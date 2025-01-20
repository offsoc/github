import {GitHubAvatar} from '@github-ui/github-avatar'
import {MailIcon} from '@primer/octicons-react'
import {Box, Text, Link} from '@primer/react'
import type {CopilotSeatAssignment, EnterpriseTeamSeatAssignment} from '../../types'
import {SeatType} from '../../types'
import {SeatHovercardLink} from './SeatHovercardLink'
import {Bold} from './Ui'
import {pluralize} from '../../helpers/text'

type Props = {
  seat: CopilotSeatAssignment
  owner: string
  muteTitle?: boolean
}

export default function SeatAssignable(props: Props) {
  const {seat, owner, muteTitle} = props
  const {assignable_type, assignable} = seat
  const {login, slug, display_name, member_count, combined_slug, avatar_url, email, id} = assignable

  // Org invitees don't have an object in `assignable` because they are not members of the org or GitHub
  const isExternalOrgInvitee = seat.assignable_type === 'OrganizationInvitation' && !seat.assignable.invitee

  const assignableSubtext = () => {
    if (assignable_type === 'User' && display_name) {
      return display_name
    } else if (assignable_type === 'Team') {
      return `@${combined_slug} • ${member_count} members`
    } else if (isExternalOrgInvitee) {
      return 'External member'
    } else if (assignable_type === 'EnterpriseTeam') {
      return pluralize(member_count!, 'member', 's', true)
    } else {
      return ''
    }
  }

  const assignableLogin = () => {
    switch (assignable_type) {
      case SeatType.User:
        return login
      case SeatType.Team:
        return slug
      case SeatType.OrganizationInvitation:
        return assignable.invitee?.login || ''
      case SeatType.EnterpriseTeam:
        return String(assignable.mapping_id)
      default:
        return ''
    }
  }

  const assignableAvatar = () => {
    if (assignable_type === SeatType.EnterpriseTeam) {
      return null
    }

    if (isExternalOrgInvitee) {
      return (
        <Text as="span" data-testid="seat-assignable-invite-mail-icon" sx={{marginTop: '-2px'}}>
          <MailIcon size={16} verticalAlign="middle" />
        </Text>
      )
    }

    return (
      <SeatHovercardLink
        className="d-inline-block"
        owner={owner}
        assignable_type={assignable_type}
        login={assignableLogin() || ''}
        testId="seat-assignable-avatar-hover"
      >
        <GitHubAvatar src={avatar_url!} size={16} square={assignable_type === SeatType.Team} />
      </SeatHovercardLink>
    )
  }

  const assignableHandle = () => {
    if (isExternalOrgInvitee) {
      return <Bold data-testid={`seat-assignable-invite-email-${id}`}>{email}</Bold>
    }

    const loginString = assignable_type === SeatType.EnterpriseTeam ? `${login}` : `@${login}`

    if (assignable_type === SeatType.EnterpriseTeam) {
      const status = (seat as EnterpriseTeamSeatAssignment).status
      return (
        <Text
          as="b"
          sx={{
            color:
              seat.pending_cancellation_date ||
              (typeof seat.id !== 'number' && status === 'pending_creation') ||
              (typeof seat.id === 'number' && status === 'pending_reassignment') ||
              (typeof seat.id === 'number' && status === 'pending_unassignment') ||
              muteTitle
                ? 'fg.muted'
                : undefined,
          }}
        >
          <Link href={`/enterprises/${owner}/teams/${slug}/members`} sx={{color: 'fg.default'}}>
            {loginString}
          </Link>
        </Text>
      )
    }

    return (
      <SeatHovercardLink
        assignable_type={assignable_type}
        login={assignableLogin() || ''}
        owner={owner}
        testId={`seat-assignable-name-hover-${id}`}
        color={seat.pending_cancellation_date ? 'fg.muted' : undefined}
      >
        {loginString}
      </SeatHovercardLink>
    )
  }

  const subtext = assignableSubtext()

  return (
    <>
      <Box className="pr-0" sx={{paddingLeft: '12px'}}>
        {assignableAvatar()}
      </Box>

      <Box
        className="css-truncate flex-auto"
        sx={{
          display: 'flex',
          gap: 2,
          fontSize: 14,
          alignItems: 'center',
          marginTop: assignable_type === SeatType.EnterpriseTeam ? 0 : '10px',
          marginBottom: assignable_type === SeatType.EnterpriseTeam ? 0 : 2,
          paddingLeft: 2,
          lineHeight: '20px',
        }}
      >
        {assignableHandle()}
        {subtext && (
          <Box as="span" data-testid="seat-assignable-subtext" sx={{fontSize: 12, color: 'fg.muted', marginTop: '2px'}}>
            {subtext}
          </Box>
        )}
      </Box>
    </>
  )
}
