import {clsx} from 'clsx'
import {currency as formatCurrency} from '@github-ui/formatters'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Dialog, IconButton, RelativeTime, Text} from '@primer/react'
import {useCopilotSettingsApi} from '../hooks/use-copilot-settings-api'
import React, {useEffect, useState} from 'react'
import type {CopilotForBusinessPayload, CopilotSeatAssignment} from '../../types'
import {SeatType} from '../../types'
import SeatAssignable from './SeatAssignable'
import styles from './styles.module.css'
import {SeatCheckboxControl} from '../../components/table/seat-checkbox-control/SeatCheckboxControl'

type Props = {
  seatAssignment: CopilotSeatAssignment
  organization: string
  removeSeat: (id: number) => void
  addSeats: (seat: string[]) => void
  addTeams: (team: string[]) => void
  removeInvitation(id: number): void
  removeTeamSeat(id: number): void
  checkSeat(seat: CopilotSeatAssignment): void
  seatsAssigned: number
  totalSeatBillingCount: number
  checked: boolean
  selectedGroupsChosen: boolean
}

export const NO_ACTIVITY = '1969-12-31T16:00:00.000-08:00'

// Used in the Seats component — the main page display
// TODO Simplify this — it should be usable in the AddMembers and AddCsvMembers components AND in the standalone enterprise components
export default function SeatListItem({
  seatAssignment,
  organization,
  addSeats,
  addTeams,
  removeSeat,
  removeInvitation,
  removeTeamSeat,
  checkSeat,
  seatsAssigned,
  totalSeatBillingCount,
  checked,
  selectedGroupsChosen,
}: Props) {
  const {
    assignable,
    assignable_type,
    invitation_expired,
    invitation_date,
    last_activity_at,
    pending_cancellation_date,
  } = seatAssignment

  const [isChecked, setIsChecked] = useState(false)
  const [showRemoveSeats, setShowRemoveSeats] = useState(false)
  const {callApi} = useCopilotSettingsApi(organization)
  const toggleRemoveSeats = () => setShowRemoveSeats(!showRemoveSeats)
  const onResendEmail = async (invitation_id: number) => {
    await callApi<CopilotForBusinessPayload>('send_invitation', {method: 'PUT', body: {invitation_id}})
  }
  const returnFocusRef = React.useRef(null)
  const totalCost = formatCurrency(totalSeatBillingCount * 19)
  const showActionMenu = selectedGroupsChosen && assignable_type !== SeatType.Organization

  const handleSeatRemove = () => {
    removeSeat(assignable.id)
  }

  const handleRemoveInvitation = () => {
    removeInvitation(assignable.id)
  }

  const handleRemoveTeamSeat = () => {
    removeTeamSeat(assignable.id)
  }

  const handleRestoreSeats = () => {
    if (assignable_type === SeatType.User) {
      addSeats([assignable.login || ''])
    } else if (assignable_type === SeatType.Team) {
      addTeams([assignable.login || ''])
    }
  }

  const lastActivityText = () => {
    if (assignable_type === 'OrganizationInvitation') {
      if (invitation_expired === true) {
        return 'Invitation Expired'
      }
      const inviteDate = new Date(Date.parse(invitation_date!)).toLocaleDateString('default', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const formattedDate = inviteDate
      return `Pending invite (${formattedDate})`
    }

    if (last_activity_at === NO_ACTIVITY) {
      return 'No activity yet'
    }

    return <RelativeTime date={new Date(last_activity_at || '')} data-testid="last-activity" />
  }

  const getRenderActionsEvent = () => {
    switch (assignable_type) {
      case 'User':
        return () => {
          handleSeatRemove()
          toggleRemoveSeats()
        }
      case 'Team':
        return () => {
          handleRemoveTeamSeat()
          toggleRemoveSeats()
        }
      case 'OrganizationInvitation':
        return () => {
          handleRemoveInvitation()
          toggleRemoveSeats()
        }
      default:
        return toggleRemoveSeats
    }
  }

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const isPendingCancellation = typeof pending_cancellation_date === 'string'
  const showCheckbox = selectedGroupsChosen

  return (
    <Box
      as="li"
      className="d-flex flex-items-center flex-justify-end member-list-item border border-top-0 pr-1 pl-3"
      sx={{
        backgroundColor: checked ? 'accent.subtle' : 'initial',
        boxShadow: checked ? 'rgb(9, 105, 218) 0px 0px 0px 1px' : 'none',
        ':last-child': {
          borderBottomRightRadius: 2,
          borderBottomLeftRadius: 2,
        },
        '&:hover': {
          backgroundColor: checked ? 'accent.subtle' : 'neutral.subtle',
        },
        height: '36px',
      }}
      data-testid={`${assignable_type}-${assignable.id}`}
    >
      {showCheckbox && (
        <SeatCheckboxControl
          checked={isChecked}
          onChange={() => checkSeat(seatAssignment)}
          selectable={seatAssignment}
          isDisabled={isPendingCancellation}
        />
      )}
      <SeatAssignable seat={seatAssignment} owner={organization} />
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        {pending_cancellation_date ? (
          <PendingCancellation date={pending_cancellation_date} />
        ) : (
          <div className="text-center color-fg-muted f6 flex-shrink-0 pr-3" data-testid="seat-last-activity-at">
            {typeof lastActivityText() === 'string' ? '' : 'Last usage'} {lastActivityText()}
          </div>
        )}
        <div className="text-left color-fg-muted pr-3 f5 flex-shrink-0 pr-3">
          {showActionMenu && (
            <ActionMenu>
              <ActionMenu.Anchor>
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  size="small"
                  icon={KebabHorizontalIcon}
                  variant="invisible"
                  aria-label="Open column options"
                  ref={returnFocusRef}
                  data-testid={`seat-options-${assignable.id}`}
                />
              </ActionMenu.Anchor>
              <ActionMenu.Overlay>
                <ActionList>
                  {!pending_cancellation_date && getRenderActionsEvent() && (
                    <>
                      {assignable_type === 'OrganizationInvitation' && !invitation_expired && (
                        <ActionList.Item
                          onSelect={() => onResendEmail(assignable.id)}
                          data-testid={`resend-email-invite-${assignable.id}`}
                        >
                          Resend email invite
                        </ActionList.Item>
                      )}
                      <ActionList.Item
                        variant="danger"
                        onSelect={toggleRemoveSeats}
                        data-testid={`remove-seat-${assignable.id}`}
                      >
                        Cancel seat
                      </ActionList.Item>
                    </>
                  )}
                  {pending_cancellation_date &&
                    (assignable_type === SeatType.User || assignable_type === SeatType.Team) && (
                      <ActionList.Item onSelect={handleRestoreSeats} data-testid={`undo-remove-seat-${assignable.id}`}>
                        Re-assign seat
                      </ActionList.Item>
                    )}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          )}
        </div>
      </Box>
      <Dialog
        isOpen={showRemoveSeats}
        onDismiss={toggleRemoveSeats}
        returnFocusRef={returnFocusRef}
        sx={{width: '100%', maxWidth: '600px'}}
        data-testid={`remove-seat-dialog-${assignable.id}`}
      >
        <Dialog.Header>Confirm removing seats</Dialog.Header>
        <Box sx={{p: 3}}>
          <Text as="p" sx={{fontSize: '0', fontWeight: 'bold'}}>
            Your next payment
          </Text>
          <div className={clsx(styles.confirmationPaymentText, 'mb-2', 'mt-2')} data-testid="cfb-payment-total">
            {totalCost}{' '}
            <Box as="span" sx={{color: 'fg.subtle', fontSize: 14}}>
              per month
            </Box>
          </div>
          <Box as="div" sx={{fontSize: 12, color: 'fg.subtle'}}>
            Seats will be removed at the end of the billing period.
          </Box>
          <hr />
          <Box sx={{display: 'flex', fontSize: '0', marginY: 3}}>
            <Box sx={{flexGrow: 1, fontWeight: 'bold'}}>Cost per seat</Box>
            <div>$19.00 USD</div>
          </Box>
          <Box sx={{display: 'flex', fontSize: '0', marginY: 3}}>
            <Box sx={{flexGrow: 1, fontWeight: 'bold'}}>Total assigned seats</Box>
            <div>{seatsAssigned}</div>
          </Box>
          <Box sx={{display: 'flex', fontSize: '0', marginY: 3}}>
            <Box sx={{flexGrow: 1, fontWeight: 'bold'}}>Seats to be removed</Box>
            <div>1</div>
          </Box>
          <hr />
          <Box sx={{display: 'flex', justifyContent: 'end'}}>
            <Button onClick={toggleRemoveSeats} sx={{marginRight: 2}}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={getRenderActionsEvent()}
              data-testid={`remove-seat-confirm-${assignable.id}`}
            >
              Remove seats
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  )
}

function PendingCancellation(props: {date: string}) {
  return (
    <Box as="span" className="flex-shrink-0 pr-3" sx={{textAlign: 'center', color: 'fg.muted', fontSize: 12}}>
      {`Access will be removed on ${new Date(Date.parse(props.date)).toLocaleDateString('default', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`}
    </Box>
  )
}
