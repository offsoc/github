import {AvatarStack, Box, Button, Text} from '@primer/react'
import type {Requester} from '../../types'
import {SeatType} from '../../types'
import {pluralize} from '../../helpers/text'
import {Bold, CopilotCard} from './Ui'
import {SeatHovercardLink} from './SeatHovercardLink'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ownerAvatarPath} from '@github-ui/paths'

type PendingRequestCardProps = {
  organization: string
  pendingRequests?: {
    requesters: Requester[]
    count: number
  }
  toggleSeatDialog: () => void
}

export function PendingRequestCard(props: PendingRequestCardProps) {
  const {organization, pendingRequests, toggleSeatDialog} = props
  const requester = pendingRequests?.requesters[0]

  const {sendClickAnalyticsEvent} = useClickAnalytics()

  if (pendingRequests && pendingRequests.count > 0 && requester) {
    return (
      <CopilotCard
        role="region"
        aria-label="Pending requests"
        sx={{marginBottom: 3}}
        data-testid="pending-requests-card"
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          <AvatarStack disableExpand={true} data-testid={'seat-requester-avatar-stack'}>
            {pendingRequests.requesters.slice(0, 4).map(user => (
              <GitHubAvatar
                key={user.id}
                src={ownerAvatarPath({owner: user.display_login})}
                alt={user.display_login}
                data-testid={'seat-requester-avatar'}
              />
            ))}
          </AvatarStack>
          <BodyText count={pendingRequests.count} requester={requester} organization={organization} />
        </Box>
        <Text as="p" sx={{marginTop: 2, marginBottom: 3, color: 'fg.muted'}}>
          Your members have requested access to Copilot. Review their requests and assign seats to offer them access.
          Maximize your developer velocity with AI by leveraging Copilot for your organization.
        </Text>
        <Button
          variant="primary"
          data-testid="review-access-requests-button"
          onClick={() => {
            toggleSeatDialog()
            sendClickAnalyticsEvent({
              category: 'copilot_access_management',
              action: `click_to_open_add_seats_dialog`,
              label: `ref_cta:review_access_requests;ref_loc:pending_requests_card`,
            })
          }}
        >
          Review access requests
        </Button>
      </CopilotCard>
    )
  }

  return null
}

type RequesterHovercardProps = {
  requester: Requester
  organization: string
}

function RequesterHovercard({requester, organization}: RequesterHovercardProps) {
  return (
    <SeatHovercardLink
      assignable_type={SeatType.User}
      login={requester.display_login}
      owner={organization}
      testId={`seat-requester-name-hover-${requester.id}`}
    >
      <Text sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{`@${requester.display_login}`}</Text>
    </SeatHovercardLink>
  )
}

type BodyTextProps = {
  count?: number
  requester?: Requester
  organization: string
}

function BodyText({count = 0, requester, organization}: BodyTextProps) {
  if (count > 0 && requester) {
    if (count === 1) {
      return (
        <Bold>
          <RequesterHovercard requester={requester} organization={organization} /> is waiting for access to Copilot.
        </Bold>
      )
    }

    return (
      <Bold>
        <RequesterHovercard requester={requester} organization={organization} /> and{' '}
        {pluralize(count - 1, 'more member', 's')} are waiting for access to Copilot
      </Bold>
    )
  }

  return null
}
