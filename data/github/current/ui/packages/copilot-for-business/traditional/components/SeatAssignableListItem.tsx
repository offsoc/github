import {ActionList, ActionMenu, Box, IconButton, RelativeTime} from '@primer/react'
import {KebabHorizontalIcon, TrashIcon, MailIcon} from '@primer/octicons-react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {SeatAssignable} from '../../types'
import {SeatType} from '../../types'
import {SeatHovercardLink} from './SeatHovercardLink'
import {Muted} from './Ui'
import {id} from '../../helpers/id'
import {pluralize} from '../../helpers/text'

// Used in the AddMembers and AddCsvMembers components
export default function SeatAssignableListItem(props: {
  owner: string
  member: SeatAssignable
  hasLicense?: boolean
  dismissRequest?: (memberFeatureRequestId: number, assignableId: number) => void
}) {
  const {member, owner, hasLicense = false, dismissRequest} = props
  const {type} = member
  const isExternalInvitee = type === SeatType.OrganizationInvitation && !member.avatar_url

  // This is used to generate links for the hovercard.
  const assignableLogin = () => {
    switch (type) {
      case SeatType.User:
        return member.display_login
      case SeatType.Team:
        return member.slug
      case SeatType.OrganizationInvitation:
        return member.display_login
      default:
        return ''
    }
  }

  const assignableStatus = () => {
    switch (type) {
      case SeatType.User: {
        if (hasLicense) {
          return 'Access already granted'
        }

        if (!member.org_member) {
          return 'Will be invited to join organization'
        }

        if (member.feature_request) {
          return (
            <>
              Requested <RelativeTime datetime={member.feature_request.requested_at} />
            </>
          )
        }

        return ''
      }
      case SeatType.Team: {
        const memberCount = pluralize(member.member_ids.length, 'member', 's')
        return `Team with ${memberCount}`
      }
      case SeatType.OrganizationInvitation: {
        return 'Will be invited to join organization'
      }
    }
  }

  const assignableName = () => {
    switch (type) {
      case SeatType.User: {
        return member.profile_name ?? ''
      }
      case SeatType.Team: {
        return member.name
      }
      case SeatType.OrganizationInvitation: {
        if (member.profile_name === member.display_login || !member.profile_name) {
          return ''
        }

        return member.display_login
      }
      default: {
        return ''
      }
    }
  }

  const assignableAvatar = () => {
    if (isExternalInvitee) {
      return (
        <span data-testid="seat-assignable-invite-mail-icon">
          <MailIcon size={16} />
        </span>
      )
    }

    return (
      <SeatHovercardLink
        assignable_type={type}
        login={assignableLogin()}
        owner={owner}
        className="d-inline-block"
        testId="seat-assignable-avatar-hover"
      >
        {/* only org invites can have an empty avatar url, and we've already guaranteed it to not be empty in the check above */}
        <GitHubAvatar src={member.avatar_url!} size={16} square={type === SeatType.Team} />
      </SeatHovercardLink>
    )
  }

  const assignableHandle = () => {
    if (isExternalInvitee) {
      return (
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 'bold',
          }}
          data-testid={`seat-assignable-invite-email-${memberId}`}
        >
          {member.display_login}
        </Box>
      )
    }

    const displayLogin = (() => {
      switch (type) {
        case SeatType.Team:
          return member.name
        case SeatType.OrganizationInvitation:
          return member.profile_name ?? member.display_login
        default:
          return member.display_login
      }
    })()

    return (
      <SeatHovercardLink
        assignable_type={type}
        login={assignableLogin()}
        owner={owner}
        testId={`seat-assignable-name-hover-${memberId}`}
      >
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 'bold',
          }}
        >{`@${displayLogin}`}</Box>
      </SeatHovercardLink>
    )
  }

  const assignableTrailingActions = () => {
    if (!(type === SeatType.User && member.feature_request && dismissRequest)) {
      return null
    }

    return (
      <Box sx={{paddingLeft: 2}}>
        <ActionMenu>
          <ActionMenu.Anchor>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={KebabHorizontalIcon}
              size="small"
              variant="invisible"
              aria-label="Open menu"
              data-testid={`dismiss-request-menu-${memberId}`}
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              <ActionList.Item
                onSelect={() => dismissRequest(member.feature_request!.id, member.id)}
                variant="danger"
                data-testid={`dismiss-request-button-${memberId}`}
              >
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                Dismiss request
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Box>
    )
  }

  const name = assignableName()
  const status = assignableStatus()
  const memberId = id(member)

  return (
    <Box sx={{display: 'flex', alignItems: 'center', width: '100%', textAlign: 'center'}}>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Box sx={{paddingLeft: '12px', paddingRight: '12px', display: 'flex', alignItems: 'center', marginTop: '-2px'}}>
          {assignableAvatar()}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            gap: 2,
          }}
        >
          {assignableHandle()}
          <Muted>{name}</Muted>
        </Box>
      </Box>
      <Box sx={{flex: 1}} />
      <div data-testid={`seat-assignable-status-${memberId}`}>
        <Muted>{status}</Muted>
      </div>
      {assignableTrailingActions()}
    </Box>
  )
}
