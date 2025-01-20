import {useEffect, useState, useMemo, useContext} from 'react'
import {TriangleDownIcon} from '@primer/octicons-react'
import {FormControl, SelectPanel, Link, Text, Box, Button} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {ActionList} from '@primer/react/deprecated'
import {type RunnerGroup, RunnerGroupVisibility} from '../../../types/runner'
import {DocsContext} from '../context'
import {URLS, SETTINGS} from '../../../helpers/constants'

interface Props {
  groups: RunnerGroup[]
  value: number
  setValue: (value: number) => void
  validationError?: boolean
}

const runnerGroupValidationId = 'runner-group-validation'

const isDefaultGroupLabelNeeded = (groupId: number | string | undefined, groups: RunnerGroup[]) => {
  const group = groups.find(g => g.id === groupId)
  if (!group) return false
  return group.id === SETTINGS.DEFAULT_RUNNER_GROUP_ID && !group.name.match(/default/i)
}

const groupDescription = (groupId: number | string | undefined, groups: RunnerGroup[]) => {
  const group = groups.find(g => g.id === groupId)
  if (!group) return ''
  const repoCount = group.selectedTargets.length
  const repoInfo =
    group.visibility === RunnerGroupVisibility.All ? 'All repositories' : `Selected repositories (${repoCount})`
  const privacyInfo = group.allowPublic ? 'including public repositories' : 'excluding public repositories'

  return `${repoInfo}, ${privacyInfo}`
}

export function RunnerGroupSelector({groups, value, setValue, validationError}: Props) {
  const docsUrlBase = useContext(DocsContext)
  const mappedGroups = useMemo(() => groups.map(group => ({id: group.id, text: group.name})), [groups])
  const [selectedGroup, setSelectedGroup] = useState<ItemInput | undefined>(
    mappedGroups.find(group => group.id === value),
  )
  const [filter, setFilter] = useState<string>('')
  const [open, setOpen] = useState(false)
  const filteredItems = useMemo(
    () => mappedGroups.filter(group => group.text?.toLowerCase().startsWith(filter.toLowerCase())),
    [filter, mappedGroups],
  )

  // if value prop changes, update selected group
  useEffect(() => {
    const newSelectedGroup = mappedGroups.find(group => group.id === value)
    if (newSelectedGroup) {
      setSelectedGroup(newSelectedGroup)
    }
  }, [value, mappedGroups])

  const onSelectChange = (item: ItemInput | undefined) => {
    if (!item || !item.id) return
    setSelectedGroup(item)

    if (typeof item.id === 'string') {
      setValue(parseInt(item.id))
      return
    }
    setValue(item.id)
  }

  return (
    <FormControl>
      <FormControl.Label>Runner group</FormControl.Label>
      <Text sx={{color: 'fg.muted', fontSize: 0}}>
        The runner group will determine which organizations and repositories can use the runner.{' '}
        <Link inline href={`${docsUrlBase}${URLS.RUNNER_GROUPS_DOCS}`}>
          Learn more about runner groups.
        </Link>
      </Text>
      {groups.length === 0 ? (
        <Text sx={{color: 'danger.fg'}} data-testid="no-runner-groups-error">
          No runner groups available.
        </Text>
      ) : (
        <>
          <SelectPanel
            placeholderText="Filter groups"
            items={filteredItems}
            selected={selectedGroup}
            onSelectedChange={onSelectChange}
            onFilterChange={setFilter}
            open={open}
            onOpenChange={setOpen}
            showItemDividers={true}
            overlayProps={{width: 'large', maxHeight: 'large'}}
            renderItem={item => (
              <ActionList.Item {...item} text={undefined}>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                  {item.text}
                  <div>
                    <Text sx={{color: 'fg.muted', fontSize: 0}}>{groupDescription(item.id, groups)}</Text>
                  </div>
                </Box>
              </ActionList.Item>
            )}
            renderAnchor={({...anchorProps}) => (
              <Button
                trailingAction={TriangleDownIcon}
                {...anchorProps}
                aria-haspopup="dialog"
                data-testid="runner-group-selector"
                aria-invalid={validationError}
                aria-describedby={runnerGroupValidationId}
                sx={{borderColor: validationError ? 'danger.fg' : 'border.default'}}
              >
                {isDefaultGroupLabelNeeded(value, groups) && <Text sx={{color: 'fg.muted'}}>Default group: </Text>}
                {selectedGroup?.text}
              </Button>
            )}
          />
          {validationError && (
            <FormControl.Validation variant="error" id={runnerGroupValidationId}>
              Invalid group selected
            </FormControl.Validation>
          )}
        </>
      )}
    </FormControl>
  )
}
