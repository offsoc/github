import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Button, FormControl, Octicon, SelectPanel, TextInput} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useFormField} from '../../hooks/use-form-field'
import type {FieldComponentProps, Group} from '../../types'
import {useBasePath} from '../../contexts/BasePathContext'
import {useReadOnly} from '../../contexts/ReadOnlyContext'
import {FileDirectoryFillIcon, TriangleDownIcon} from '@primer/octicons-react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useOrganization} from '../../contexts/OrganizationContext'

type GroupNameFieldProps = FieldComponentProps<string> & {
  isRoot?: boolean
  readOnlyOverride?: boolean
}

export function GroupNameField({initialValue = '', readOnlyOverride = false, isRoot}: GroupNameFieldProps) {
  const {parentGroup} = useRoutePayload<{parentGroup?: Group}>()
  const organization = useOrganization()
  const globalReadOnly = useReadOnly()
  const [groups, setGroups] = useState<Group[]>([])
  const fieldRef = useRef<HTMLInputElement>(null)
  const [isParentPathOpen, setIsParentPathOpen] = useState(false)
  const [parentPathFilter, setParentPathFilter] = useState<string>('')
  const readOnly = globalReadOnly || readOnlyOverride

  const initialParentValue = parentGroup?.group_path ? `${parentGroup.group_path}/` : initialValue

  const field = useFormField<string, string>('group_path', initialParentValue, {
    validator: (newValue: string) => {
      if (newValue.includes('/')) {
        return 'Group names cannot includes delimitters'
      }
      return
    },
    fieldRef,
  })
  const basePath = useBasePath()

  const parentGroupPath = field.value.split('/').slice(0, -1).join('/') || ''
  const groupName = field.value.split('/').pop() || ''

  useEffect(() => {
    const fetcher = async () => {
      if (readOnly) {
        return
      }
      const response = await verifiedFetchJSON(basePath)
      if (response.ok) {
        const {payload} = await response.json()
        setGroups(payload.groups)
      }
    }
    fetcher()
  }, [readOnly, basePath, isRoot, setGroups])

  const updateGroupPath = useCallback(
    ({
      newParentGroupPath = parentGroupPath,
      newGroupName = groupName,
    }: {
      newParentGroupPath?: string
      newGroupName?: string
    }) => {
      const path = newParentGroupPath === '' ? newGroupName : `${newParentGroupPath}/${newGroupName}`
      if (path !== field.value) {
        field.update(path)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.update, parentGroupPath, groupName],
  )

  const onOpen = useCallback(() => setIsParentPathOpen(!isParentPathOpen), [isParentPathOpen, setIsParentPathOpen])
  const onSelect = useCallback(
    (item?: ItemProps) => {
      if (!item) {
        return
      }
      updateGroupPath({newParentGroupPath: item.text})
    },
    [updateGroupPath],
  )

  const items = useMemo<ItemProps[]>(
    () =>
      groups.map(group => ({
        leadingVisual: () => <Octicon icon={FileDirectoryFillIcon} />,
        text: group.group_path || organization.name,
        id: group.id,
        selectionVariant: 'single',
      })),
    [groups, organization.name],
  )
  const filteredItems = useMemo(
    () => items.filter(item => item.text?.toLowerCase()?.includes(parentPathFilter.toLowerCase())),
    [items, parentPathFilter],
  )

  return (
    <div className="d-flex flex-row flex-start gap-2 flex-items-end">
      {!isRoot && groups.length > 0 ? (
        <>
          <FormControl id={`${field.name}-parent`}>
            <FormControl.Label>Parent</FormControl.Label>
            <SelectPanel
              renderAnchor={({children, ...anchorProps}) => (
                <Button leadingVisual={FileDirectoryFillIcon} trailingVisual={TriangleDownIcon} {...anchorProps}>
                  {children || organization.name}
                </Button>
              )}
              placeholderText="Search organizations"
              items={filteredItems}
              selected={items.find(item => item.text === parentGroupPath)}
              onSelectedChange={onSelect}
              onOpenChange={onOpen}
              onFilterChange={setParentPathFilter}
              open={isParentPathOpen}
              overlayProps={{width: 'small', height: filteredItems.length > 6 ? 'small' : 'auto'}}
            />
          </FormControl>
          <span className="text-bold mb-1" style={{fontSize: 20}}>
            /
          </span>
        </>
      ) : null}
      <FormControl required id={`${field.name}-name`}>
        <FormControl.Label>Group name</FormControl.Label>
        <TextInput
          readOnly={isRoot}
          ref={fieldRef}
          value={!isRoot ? groupName : organization.name}
          onChange={e => {
            const newGroupName = e.target.value.replaceAll('/', '')
            updateGroupPath({newGroupName})
          }}
        />
        {isRoot ? <FormControl.Caption>This group cannot be renamed</FormControl.Caption> : null}
      </FormControl>
    </div>
  )
}
