import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useSyncedState} from '@github-ui/use-synced-state'
import {StopIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Checkbox, FormControl, Octicon, Text, TextInput} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import debounce, {type DebouncedFunc} from 'lodash-es/debounce'
import {memo, useCallback, useMemo, useRef, useState} from 'react'

import {type Collaborator, CollaboratorRole, CollaboratorType, Role} from '../../../../api/common-contracts'
import {getInitialState} from '../../../../helpers/initial-state'
import {useAllCollaboratorsByIdentifier} from '../../../../queries/collaborators'
import {ManageAccessResources, Resources} from '../../../../strings'
import {CollaboratorRoleDropDown} from './collaborator-role-drop-down'
import {useCollaboratorsFilter} from './collaborators-filter'

const roles = ['Read', 'Write', 'Admin']
const types = ['User', 'Team']

const roleToStringMap: Map<CollaboratorRole, string> = new Map([
  [CollaboratorRole.Reader, 'Read'],
  [CollaboratorRole.Writer, 'Write'],
  [CollaboratorRole.Admin, 'Admin'],
])

type CollaboratorsTableHeaderProps = {
  userCount: number
  teamCount: number
  showError: boolean
  selectedCollaboratorIds: Set<string>
  onCheckBoxChange: (checkbox: React.ChangeEvent<HTMLInputElement>) => void
  onDropDownItemClick: (role: Role, actorIds: Set<string>) => Promise<void>
  onRemoveButtonClick: (actorIds: Set<string>) => Promise<void>
  onDropDownButtonClick: () => void
}

const defaultCollaboratorsMap = new Map<string, Collaborator>()
export const CollaboratorsTableHeader: React.FC<CollaboratorsTableHeaderProps> = memo(
  function CollaboratorsTableHeader({
    userCount,
    teamCount,
    showError,
    selectedCollaboratorIds,
    onCheckBoxChange,
    onDropDownItemClick,
    onRemoveButtonClick,
    onDropDownButtonClick,
  }) {
    const {data: allCollaboratorsMap = defaultCollaboratorsMap} = useAllCollaboratorsByIdentifier()

    const selectedRoles = new Set<string>()
    for (const collaboratorId of selectedCollaboratorIds) {
      if (selectedRoles.size === roles.length) break
      const collab = allCollaboratorsMap.get(collaboratorId)
      if (collab) {
        const str = roleToStringMap.get(collab.role)
        if (str) selectedRoles.add(str)
      } else {
        // this shouldn't happen, but if it does, we'll just remove the collaborator from the selection
        selectedCollaboratorIds.delete(collaboratorId)
      }
    }

    const checkboxRef = useRef<HTMLInputElement>(null)
    const {typeFilter} = useCollaboratorsFilter()
    const totalVisibleUsers = getTotalVisibleUsers(typeFilter, {userCount, teamCount})

    useLayoutEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate =
          selectedCollaboratorIds.size !== 0 && selectedCollaboratorIds.size < totalVisibleUsers
      }
    }, [selectedCollaboratorIds, totalVisibleUsers])

    let collabString = ''
    collabString = userCount !== 1 ? `${userCount} members` : `${userCount} member`

    if (teamCount) {
      if (userCount === 0) {
        collabString = ''
      }
      collabString += userCount ? `, ` : ``
      collabString += teamCount > 1 ? `${teamCount} teams` : `${teamCount} team`
    }

    const selectedCount = selectedCollaboratorIds.size
    return (
      <>
        <Box sx={boxHeaderStyles}>
          <Box sx={{display: 'flex', alignItems: 'center', flex: '1 1 0'}}>
            <Box sx={{mr: 2}}>
              <FormControl id="collaborators-checkbox-bulk">
                <Checkbox
                  name="collaborators-checkbox-bulk"
                  ref={checkboxRef}
                  onChange={onCheckBoxChange}
                  checked={selectedCount > 0 && selectedCount === totalVisibleUsers}
                  {...testIdProps('collaborators-checkbox-bulk')}
                />
                <FormControl.Label sx={{color: 'fg.muted', fontWeight: 'normal'}}>
                  <span className="sr-only">Select all collaborators. </span>
                  <span {...testIdProps('collaborators-table-counter')}>
                    {selectedCount > 0 ? `${selectedCount} selected` : collabString}
                  </span>
                </FormControl.Label>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <div aria-live="polite">{selectedCount > 1 && showError && <ErrorMessage />}</div>

            <div {...testIdProps('collaborators-header-dropdown')}>
              {selectedCount > 1 ? (
                <RoleBulkSetDropdown
                  selectedRoles={Array.from(selectedRoles)}
                  collaboratorIds={selectedCollaboratorIds}
                  onDropDownItemClick={onDropDownItemClick}
                  onDropDownButtonClick={onDropDownButtonClick}
                />
              ) : (
                <Box sx={{display: 'flex'}}>
                  <CollaboratorsFilterTypeDropdown />
                  <CollaboratorsFilterRoleDropdown />
                </Box>
              )}
            </div>

            {selectedCount > 1 && (
              <Button
                sx={{
                  ml: 2,
                  '&:hover:not([disabled]), &:focus:not([disabled])': {color: 'btn.danger.text'},
                }}
                onClick={() => onRemoveButtonClick(selectedCollaboratorIds)}
                {...testIdProps('collaborators-remove-bulk')}
              >
                {Resources.removeTitle}
              </Button>
            )}
          </Box>
        </Box>
        <Box sx={{p: 3}}>
          <CollaboratorsFilterInput />
        </Box>
      </>
    )
  },
)

function getTotalVisibleUsers(typeFilter: CollaboratorType, counts: {userCount: number; teamCount: number}) {
  const opts: Record<CollaboratorType, number> = {
    [CollaboratorType.User]: counts.userCount,
    [CollaboratorType.Team]: counts.teamCount,
    [CollaboratorType.None]: counts.userCount + counts.teamCount,
  }
  return opts[typeFilter]
}

const boxHeaderStyles: BetterSystemStyleObject = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: 3,
  margin: '-1px -1px 0',
  backgroundColor: 'canvas.subtle',
  borderColor: 'border.default',
  borderStyle: 'solid',
  borderWidth: 1,
  borderTopLeftRadius: 2,
  borderTopRightRadius: 2,
}

function ErrorMessage() {
  return (
    <Box {...testIdProps('failure-message')} sx={{mr: 2}}>
      <Octicon icon={StopIcon} sx={{mr: 1, color: 'danger.fg'}} />
      <span>Something went wrong</span>
    </Box>
  )
}

function RoleBulkSetDropdown(props: {
  selectedRoles: Array<string>
  collaboratorIds: Set<string>
  onDropDownItemClick: (role: Role, actorIds: Set<string>) => void
  onDropDownButtonClick: () => void
}) {
  return (
    <CollaboratorRoleDropDown
      selectedRoles={props.selectedRoles}
      handleOnClick={role => props.onDropDownItemClick(role, props.collaboratorIds)}
      handleDropDownButtonClick={props.onDropDownButtonClick}
      {...testIdProps('collaborators-header-role-picker')}
    />
  )
}

const CollaboratorsFilterInput: React.FC = () => {
  const {query, setQuery} = useCollaboratorsFilter()
  const {projectOwner} = getInitialState()
  const [localQuery, setLocalQuery] = useSyncedState(query)
  const debouncedSearch = useRef<DebouncedFunc<() => Promise<void>> | undefined>()

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value

    setLocalQuery(searchQuery)

    if (debouncedSearch.current) {
      debouncedSearch.current.cancel()
    }

    debouncedSearch.current = debounce(() => setQuery(searchQuery), 200)
    debouncedSearch.current()
  }

  return (
    <Box sx={{flex: '1 1 100%'}} {...testIdProps('filter-collaborators')}>
      <TextInput
        placeholder={
          projectOwner && projectOwner.type === 'organization'
            ? ManageAccessResources.collaboratorFilterPlaceholderOrgProject
            : ManageAccessResources.collaboratorFilterPlaceholderUserProject
        }
        value={localQuery}
        contrast
        onChange={onInputChange}
        {...testIdProps('filter-collaborators-input')}
        sx={{width: '100%'}}
      />
    </Box>
  )
}

const CollaboratorsFilterTypeDropdown: React.FC = () => {
  const {typeFilter, setTypeFilter} = useCollaboratorsFilter()
  const [isOpen, setIsOpen] = useState(false)

  const selectFilterType = useCallback(
    (type: CollaboratorType) => {
      setTypeFilter(type)
    },
    [setTypeFilter],
  )

  const onClickHandler = useCallback(
    (type: string, isSelected: boolean) => {
      selectFilterType(isSelected ? CollaboratorType.None : (type as CollaboratorType))
    },
    [selectFilterType],
  )

  return (
    <ActionMenu open={isOpen} onOpenChange={open => setIsOpen(open)}>
      <ActionMenu.Button {...testIdProps('collaborators-header-type-filter-button')}>
        <Text sx={{color: 'fg.muted'}}>Type</Text>
      </ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList selectionVariant="single" {...testIdProps('collaborators-header-type-filter-menu')}>
          {types.map(type => (
            <FilterDropdownItem
              key={type}
              onClickHandler={onClickHandler}
              onClose={() => setIsOpen(false)}
              value={type}
              filter={typeFilter}
            />
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

const CollaboratorsFilterRoleDropdown: React.FC = () => {
  const {roleFilter, setRoleFilter} = useCollaboratorsFilter()
  const [isOpen, setIsOpen] = useState(false)

  const selectFilterRole = useCallback(
    (role: Role) => {
      setRoleFilter(role)
    },
    [setRoleFilter],
  )

  const onClickHandler = useCallback(
    (role: string, isSelected: boolean) => {
      selectFilterRole(isSelected ? Role.None : (role as Role))
    },
    [selectFilterRole],
  )

  return (
    <ActionMenu open={isOpen} onOpenChange={open => setIsOpen(open)}>
      <ActionMenu.Button {...testIdProps('collaborators-header-role-filter-button')} sx={{ml: 2}}>
        <Text sx={{color: 'fg.muted'}}>Role</Text>
      </ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList selectionVariant="single" {...testIdProps('collaborators-header-role-filter-menu')}>
          {roles.map(role => (
            <FilterDropdownItem
              key={role}
              onClickHandler={onClickHandler}
              onClose={() => setIsOpen(false)}
              value={role}
              filter={roleFilter}
            />
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

type RoleFilterDropdownItemProps = {
  filter: Role
  value: string
  onClickHandler: (role: string, isSelected: boolean) => void
  onClose: () => void
}

type TypeFilterDropdownItemProps = {
  filter: string
  value: string
  onClickHandler: (type: string, isSelected: boolean) => void
  onClose: () => void
}

const FilterDropdownItem = ({
  filter,
  value,
  onClickHandler,
  onClose,
}: RoleFilterDropdownItemProps | TypeFilterDropdownItemProps) => {
  const isSelected = useMemo(() => value.toLowerCase() === filter?.toLowerCase(), [value, filter])

  const onClick = useCallback(() => {
    onClickHandler(value, isSelected)
  }, [onClickHandler, value, isSelected])

  return (
    <ActionList.Item
      tabIndex={0}
      key={value}
      onClick={onClick}
      onKeyDown={e => {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (e.key === 'Enter') {
          onClick()
          onClose()
        }
      }}
      selected={isSelected}
      {...testIdProps(`filter-${value.toLowerCase()}`)}
    >
      {value}
    </ActionList.Item>
  )
}
