import {ActionList, ActionMenu, Box, IconButton, Link} from '@primer/react'
import {ownerAvatarPath} from '@github-ui/paths'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {User} from './types'
import {useState} from 'react'
import {RemoveMemberDialog} from './RemoveMemberDialog'

type TeamMemberListItemProps = {
  teamName: string
  member: User
  businessSlug: string
  directMembershipsEnabled: boolean
  removeMember: () => void
  removeMemberPath: string
  hideRemoveMemberButton?: boolean
  useMemberOrganizationsPathForUserLink?: boolean
}

const TeamMemberListItem = ({
  teamName,
  member,
  businessSlug,
  directMembershipsEnabled,
  removeMember,
  removeMemberPath,
  hideRemoveMemberButton = false,
  useMemberOrganizationsPathForUserLink = true,
}: TeamMemberListItemProps) => {
  const [showRemoveMemberConfirmationDialog, setShowRemoveMemberConfirmationDialog] = useState(false)

  const memberPath = useMemberOrganizationsPathForUserLink
    ? `/enterprises/${businessSlug}/people/${member.login}/organizations`
    : `/${member.login}`

  return (
    <Box
      role="listitem"
      aria-labelledby={member.login}
      data-testid={member.login}
      sx={{
        padding: '16px',
        borderBottom: '1px solid',
        borderBottomColor: 'border.muted',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div className="d-flex flex-items-center">
        {showRemoveMemberConfirmationDialog && (
          <RemoveMemberDialog
            teamName={teamName}
            removeMemberPath={removeMemberPath}
            member={member}
            onMemberRemove={() => {
              removeMember()
              setShowRemoveMemberConfirmationDialog(false)
            }}
            onDismiss={() => {
              setShowRemoveMemberConfirmationDialog(false)
            }}
          />
        )}
        <Link aria-labelledby={member.login} href={memberPath}>
          <GitHubAvatar sx={{ml: '1px'}} size={48} src={ownerAvatarPath({owner: member.login})} alt={member.login} />
        </Link>
        <div className="d-flex flex-column ml-2">
          <Link data-testid={`user-link-${member.login}`} aria-labelledby={member.login} href={memberPath}>
            <div className="d-flex f4">{member.name || member.login}</div>
          </Link>
          {member.name && (
            <div className="color-fg-muted" data-testid={`user-name-second-line-${member.login}`}>
              {member.login}
            </div>
          )}
        </div>
      </div>
      {!hideRemoveMemberButton && directMembershipsEnabled && (
        <ActionMenu>
          <ActionMenu.Anchor>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={KebabHorizontalIcon}
              aria-label={`View actions for ${member.login}`}
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              <ActionList.Item
                variant="danger"
                onSelect={() => {
                  setShowRemoveMemberConfirmationDialog(true)
                }}
              >
                Remove from team
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </Box>
  )
}

export default TeamMemberListItem
