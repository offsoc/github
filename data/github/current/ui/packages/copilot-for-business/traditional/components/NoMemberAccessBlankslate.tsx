import {AvatarStack, Box, Button, Text} from '@primer/react'
import type {Dispatch, SetStateAction} from 'react'
import {CopilotForBusinessSeatPolicy, SeatType} from '../../types'
import type {
  CopilotForBusinessOrganization,
  CopilotForBusinessPayload,
  CopilotForBusinessTrial,
  PlanText,
  Requester,
  SeatBreakdown,
} from '../../types'
import {pluralize} from '../../helpers/text'
import {SeatHovercardLink} from './SeatHovercardLink'
import {Bold} from './Ui'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ownerAvatarPath} from '@github-ui/paths'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {SeatAssignmentPolicy} from './SeatAssignmentPolicy'

type Props = {
  policy: CopilotForBusinessSeatPolicy
  onClick: () => void
  setPreselectRequesters: (arg0: boolean) => void
  organization: CopilotForBusinessOrganization
  pendingRequests?: {
    requesters: Requester[]
    count: number
  }
  currentPolicy: CopilotForBusinessSeatPolicy
  setCurrentPolicy: (policy: CopilotForBusinessSeatPolicy) => void
  selectedPolicy: CopilotForBusinessSeatPolicy
  setSelectedPolicy: (policy: CopilotForBusinessSeatPolicy) => void
  seatCount: number
  setPayload: Dispatch<SetStateAction<CopilotForBusinessPayload>>
  seatBreakdown: SeatBreakdown
  setPolicyChangeIntent: (intent: 'remove' | 'add' | null) => void
  policyChangeIntent: 'remove' | 'add' | null
  membersCount: number
  businessTrial?: CopilotForBusinessTrial
  nextBillingDate: string
  planText: PlanText
}

export function NoMemberAccessBlankslate(props: Props) {
  const {organization, pendingRequests, setPreselectRequesters} = props
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const hasPendingRequests = pendingRequests && pendingRequests.count > 0 && pendingRequests.requesters.length > 0

  return (
    <>
      <div className="Box blankslate">
        <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'column'}} data-testid="cfb-no-seats">
          {hasPendingRequests && (
            <AvatarStack disableExpand={true} sx={{marginBottom: 4}} data-testid={'seat-requester-avatar-stack'}>
              {pendingRequests.requesters.slice(0, 4).map(user => (
                <GitHubAvatar
                  key={user.id}
                  src={ownerAvatarPath({owner: user.display_login})}
                  alt={user.display_login}
                  data-testid={'seat-requester-avatar'}
                />
              ))}
            </AvatarStack>
          )}
          {props.policy === CopilotForBusinessSeatPolicy.Disabled ? (
            <>
              <h2 className="blankslate-heading">No seats assigned</h2>
              <p data-testid="seat-management-body-text">
                <DisabledBodyText
                  count={pendingRequests?.count}
                  requester={pendingRequests?.requesters[0]}
                  organization={organization.name}
                />
              </p>
              <SeatAssignmentPolicy
                organization={props.organization}
                currentPolicy={props.currentPolicy}
                setCurrentPolicy={props.setCurrentPolicy}
                selectedPolicy={props.selectedPolicy}
                setSelectedPolicy={props.setSelectedPolicy}
                seatCount={props.seatCount}
                setPayload={props.setPayload}
                seatBreakdown={props.seatBreakdown}
                setPolicyChangeIntent={props.setPolicyChangeIntent}
                policyChangeIntent={props.policyChangeIntent}
                membersCount={props.membersCount}
                businessTrial={props.businessTrial}
                nextBillingDate={props.nextBillingDate}
                planText={props.planText}
                emptyState={true}
                onBlankslateClick={props.onClick}
                setPreselectRequesters={setPreselectRequesters}
              />
            </>
          ) : (
            <>
              <h2 className="blankslate-heading">No seats assigned</h2>
              <p className="mb-3" data-testid="seat-management-body-text">
                <SelectMembersBodyText
                  count={pendingRequests?.count}
                  requester={pendingRequests?.requesters[0]}
                  organization={organization.name}
                />
              </p>
              {/* This is a temporary and non-ideal fix. See heart-services#3098 and heart-services#3023 */}
              {props.policy === CopilotForBusinessSeatPolicy.EnabledForSelected && (
                <>
                  {hasPendingRequests && (
                    <Button
                      sx={{mb: 2}}
                      variant="primary"
                      onClick={() => {
                        setPreselectRequesters(true)
                        props.onClick()
                        sendClickAnalyticsEvent({
                          category: 'copilot_access_management',
                          action: `click_to_open_add_seats_dialog`,
                          label: `ref_cta:start_adding_seats;ref_loc:no_member_access_blankslate`,
                        })
                      }}
                    >
                      Review access requests
                    </Button>
                  )}
                  <Button
                    variant={hasPendingRequests ? 'invisible' : 'primary'}
                    onClick={() => {
                      setPreselectRequesters(false)
                      props.onClick()
                      sendClickAnalyticsEvent({
                        category: 'copilot_access_management',
                        action: `click_to_open_add_seats_dialog`,
                        label: `ref_cta:start_adding_seats;ref_loc:no_member_access_blankslate`,
                      })
                    }}
                  >
                    Assign Copilot seats
                  </Button>
                </>
              )}
            </>
          )}
        </Box>
      </div>
    </>
  )
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

function DisabledBodyText({count = 0, requester, organization}: BodyTextProps) {
  if (count > 0 && requester) {
    if (count === 1) {
      return (
        <>
          <RequesterHovercard requester={requester} organization={organization} /> is waiting for access to Copilot. To
          maximize your <br />
          developer velocity using AI, enable Copilot in your organization to give members access.
        </>
      )
    }

    return (
      <>
        <RequesterHovercard requester={requester} organization={organization} /> and{' '}
        <Bold>{pluralize(count - 1, 'more member', 's')}</Bold> are waiting for access to Copilot. To maximize your{' '}
        <br />
        developer velocity using AI, enable Copilot in your organization to give members access.
      </>
    )
  }

  return (
    <>
      No members are using GitHub Copilot in this organization. To maximize your <br />
      developer velocity using AI, enable Copilot and start adding users.
    </>
  )
}

function SelectMembersBodyText({count = 0, requester, organization}: BodyTextProps) {
  if (count > 0 && requester) {
    if (count === 1) {
      return (
        <>
          <RequesterHovercard requester={requester} organization={organization} /> is waiting for access to Copilot.
          Review <br />
          their requests to offer members in your organization access to Copilot.
        </>
      )
    }

    return (
      <>
        <RequesterHovercard requester={requester} organization={organization} /> and{' '}
        <Bold>{pluralize(count - 1, 'more member', 's')}</Bold> are waiting for access to Copilot. Review <br />
        their requests to offer members in your organization access to Copilot.
      </>
    )
  }

  return (
    <>
      No members are using GitHub Copilot in this organization. To maximize your <br />
      developer velocity using AI, start assigning seats to users.
    </>
  )
}
