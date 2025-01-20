import {GitHubAvatar} from '@github-ui/github-avatar'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button, Link, Text, themeGet} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo} from 'react'
import styled from 'styled-components'

import {
  type Collaborator,
  collaboratorRolesMap,
  type Owner,
  Role,
  type TeamCollaborator,
} from '../../../../api/common-contracts'
import {getInitialState} from '../../../../helpers/initial-state'
import {actorIdentifier, getCollaboratorDisplayValue} from '../../../../queries/organization-access'
import {Resources, SettingsResources} from '../../../../strings'
import {CollaboratorRoleDropDown} from './collaborator-role-drop-down'

function getTeamCollaboratorMemberDetails(collaborator: TeamCollaborator) {
  const membersCount = collaborator.membersCount
  const membersString = membersCount === 1 ? `${membersCount} member` : `${membersCount} members`
  return `@${collaborator.slug} • ${membersString}`
}

function getCollaboratorUrl(collaborator: Collaborator, projectOwner: Owner | undefined) {
  let collabUrl = ''

  if (collaborator.actor_type === 'user') {
    collabUrl = `/${collaborator.login}`
  }

  if (collaborator.actor_type === 'team') {
    collabUrl = projectOwner ? `/orgs/${projectOwner.login}/teams/${collaborator.slug}` : ''
  }

  return collabUrl
}

function getCollaboratorHovercardUrl(collaborator: Collaborator, projectOwner: Owner | undefined) {
  if (collaborator.actor_type === 'user') {
    return `/users/${collaborator.login}/hovercard`
  }

  if (collaborator.actor_type === 'team' && projectOwner?.type === 'organization') {
    return `/orgs/${projectOwner.login}/teams/${collaborator.slug}/hovercard`
  }
}

type CollaboratorsListItemProps = {
  collaborator: CollaboratorItem
  isLastItem: boolean
  isSelected: boolean
  onCheckboxChange: (checkbox: React.ChangeEvent<HTMLInputElement>) => void
  onDropDownClick: (role: Role, actorIds: Set<string>) => void
  onRemoveButtonClick: (actorIds: Set<string>) => void
}

type CollaboratorItem = Collaborator & {isUpdated?: boolean}

const boxStyleFooter: BetterSystemStyleObject = {
  padding: 3,
  marginTop: '-1px',
  borderTopColor: 'border.default',
  borderTopStyle: 'solid',
  borderTopWidth: 1,
  borderRadius: '0 0 6px 6px',
}
const boxStyleRow: BetterSystemStyleObject = {
  padding: 3,
  listStyleType: 'none',
  marginTop: '-1px',
  borderTopColor: 'border.muted',
  borderTopStyle: 'solid',
  borderTopWidth: 1,
}
const CollaboratorsListItemComponent: React.FC<CollaboratorsListItemProps> = ({
  collaborator,
  isLastItem,
  isSelected,
  onCheckboxChange,
  onDropDownClick,
  onRemoveButtonClick,
}) => {
  const {projectOwner} = getInitialState()

  const rowStyles = isLastItem ? boxStyleFooter : boxStyleRow
  const roleAssigned: Role = collaboratorRolesMap.get(collaborator.role) ?? Role.None

  const RowComponent = collaborator.isUpdated ? FadedRow : Box
  const displayValue =
    collaborator.actor_type === 'team'
      ? getTeamCollaboratorMemberDetails(collaborator)
      : getCollaboratorDisplayValue(collaborator)

  return (
    <RowComponent key={collaborator.id} sx={rowStyles} {...testIdProps(`collaborators-row-${displayValue}`)}>
      <Box sx={{display: 'flex', flex: 'auto', alignItems: 'center'}}>
        <Box sx={{mr: 3}}>
          <input
            type="checkbox"
            aria-label={
              isSelected
                ? SettingsResources.unselectCollaborator(displayValue)
                : SettingsResources.selectCollaborator(displayValue)
            }
            checked={isSelected}
            name={actorIdentifier(collaborator)}
            onChange={onCheckboxChange}
            {...testIdProps(`collaborators-checkbox-${displayValue}`)}
          />
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', flex: 'auto'}}>
          <GitHubAvatar
            loading="lazy"
            alt={displayValue}
            src={collaborator.avatarUrl}
            size={32}
            sx={{mr: 3}}
            data-hovercard-type={collaborator.actor_type}
            data-hovercard-url={getCollaboratorHovercardUrl(collaborator, projectOwner)}
          />
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Link
              data-hovercard-type={collaborator.actor_type}
              data-hovercard-url={getCollaboratorHovercardUrl(collaborator, projectOwner)}
              sx={{cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold'}}
              href={getCollaboratorUrl(collaborator, projectOwner)}
              {...testIdProps('collaborator-link')}
            >
              {collaborator.name || displayValue}
            </Link>

            {collaborator.name && (
              <Text sx={{color: 'fg.muted'}} {...testIdProps('collaborator-login')}>
                {displayValue}
              </Text>
            )}
          </Box>
        </Box>
        <CollaboratorRoleDropDown
          selectedRoles={[roleAssigned]}
          handleOnClick={(role: Role) => onDropDownClick(role, new Set([actorIdentifier(collaborator)]))}
        />
        <Button
          variant="invisible"
          onClick={() => onRemoveButtonClick(new Set([actorIdentifier(collaborator)]))}
          {...testIdProps(`remove-collaborator-${displayValue}`)}
          sx={{
            color: 'fg.muted',
            border: '1px solid',
            borderColor: 'transparent',
            boxShadow: 'none',
            '&:hover:not([disabled]), &:focus:not([disabled])': {
              color: 'btn.danger.text',
              border: '1px solid',
              borderColor: 'btn.border',
            },
            marginLeft: 2,
          }}
          aria-label={Resources.removeTitle}
        >
          {Resources.removeTitle}
        </Button>
      </Box>
    </RowComponent>
  )
}

const FadedRow = styled(Box)`
  animation: fadeOut 2s ease-out;

  @keyframes fadeOut {
    from {
      background: ${themeGet('colors.neutral.subtle')};
    }
    to {
      background: ${themeGet('colors.canvas.default')};
    }
  }
`

export const CollaboratorsListItem = memo(CollaboratorsListItemComponent)
