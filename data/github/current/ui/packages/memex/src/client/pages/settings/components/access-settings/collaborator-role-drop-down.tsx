import {testIdProps} from '@github-ui/test-id-props'
import type {AnchorSide} from '@primer/behaviors'
import {ActionList, ActionMenu, Box} from '@primer/react'
import {useCallback, useState} from 'react'

import {Role} from '../../../../api/common-contracts'
import {toTitleCase} from '../../../../helpers/util'
import {ManageAccessResources} from '../../../../strings'

type CollaboratorRoleDropDownItemProps = {
  role: Role
  displayName: string
  description: string
  onClose: () => void
  selected: boolean
  handleOnClick: (role: Role) => void
}

const CollaboratorRoleDropDownItem = ({
  displayName,
  selected,
  onClose,
  role,
  description,
  handleOnClick,
}: CollaboratorRoleDropDownItemProps) => {
  const onClickHandler = useCallback(() => {
    handleOnClick(role)
  }, [handleOnClick, role])

  return (
    <ActionList.Item
      tabIndex={0}
      selected={selected}
      onClick={onClickHandler}
      onKeyDown={(e: React.KeyboardEvent) => {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (e.key === 'Enter') {
          onClickHandler()
          onClose()
        }
      }}
      {...testIdProps(`collaborators-role-dropdown-item-${role}`)}
    >
      {displayName}
      <ActionList.Description variant="block">{description}</ActionList.Description>
    </ActionList.Item>
  )
}

type CollaboratorRoleDisplayProps = {
  value: Role
  displayName: string
  description: string
}

export const defaultCollaboratorRoleDropDownRoles: Array<CollaboratorRoleDisplayProps> = [
  {
    value: Role.Admin,
    displayName: toTitleCase(Role.Admin.toString()),
    description: ManageAccessResources.collaboratorDropDownAdmin,
  },
  {
    value: Role.Write,
    displayName: toTitleCase(Role.Write.toString()),
    description: ManageAccessResources.collaboratorDropDownWrite,
  },
  {
    value: Role.Read,
    displayName: toTitleCase(Role.Read.toString()),
    description: ManageAccessResources.collaboratorDropDownRead,
  },
]

type CollaboratorRoleDropDownProps = {
  align?: AnchorSide
  roles?: Array<CollaboratorRoleDisplayProps>
  selectedRoles: Array<string>
  isOrganizationRole?: boolean
  handleOnClick: (role: Role) => void
  handleDropDownButtonClick?: () => void
}

export function CollaboratorRoleDropDown({
  align = 'inside-right',
  roles = defaultCollaboratorRoleDropDownRoles,
  selectedRoles,
  isOrganizationRole = false,
  handleOnClick,
  handleDropDownButtonClick,
}: CollaboratorRoleDropDownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedRole = selectedRoles.length > 1 ? 'Mixed' : toTitleCase(selectedRoles[0] ?? '')
  const selectedRolesTitleCased =
    selectedRoles.length > 0 ? new Set(selectedRoles.map((role: string) => toTitleCase(role))) : new Set<string>()
  return (
    <Box sx={{position: 'relative'}}>
      <ActionMenu open={isOpen} onOpenChange={open => setIsOpen(open)} {...testIdProps('collaborators-role-dropdown')}>
        <ActionMenu.Button onClick={handleDropDownButtonClick} {...testIdProps('collaborators-role-dropdown-button')}>
          {isOrganizationRole ? null : <span style={{fontWeight: 400}}>Role: </span>}
          {selectedRole}
        </ActionMenu.Button>
        <ActionMenu.Overlay anchorSide={align}>
          <ActionList selectionVariant="single">
            {roles.map(role => (
              <CollaboratorRoleDropDownItem
                role={role.value}
                description={role.description}
                displayName={role.displayName}
                onClose={() => setIsOpen(false)}
                selected={selectedRolesTitleCased.has(role.displayName)}
                handleOnClick={(newRole: Role) => {
                  handleOnClick(newRole)
                }}
                key={role.value}
              />
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  )
}
