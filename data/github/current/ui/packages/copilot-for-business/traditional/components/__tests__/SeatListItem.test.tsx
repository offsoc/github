import {fireEvent, screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import SeatListItem, {NO_ACTIVITY} from '../SeatListItem'
import {
  EmailInvite,
  EmailInviteSeat,
  ExpiredUserInviteSeat,
  Team,
  TeamSeat,
  UserInviteSeat,
  UserSeat,
} from '../../../test-utils/mock-data'
import type {CopilotSeatAssignment} from '../../../types'
import {SeatType} from '../../../types'
import {mockFetch} from '@github-ui/mock-fetch'

const removeSeat = jest.fn()
const addSeats = jest.fn()
const addTeams = jest.fn()
const removeInvitation = jest.fn()
const removeTeamSeat = jest.fn()
const checkSeat = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

const renderSeatListItem = (seatAssignment: CopilotSeatAssignment, selectedGroupsChosen: boolean) => {
  render(
    <SeatListItem
      seatAssignment={seatAssignment}
      organization="blah"
      removeSeat={removeSeat}
      addSeats={addSeats}
      addTeams={addTeams}
      removeTeamSeat={removeTeamSeat}
      removeInvitation={removeInvitation}
      checkSeat={checkSeat}
      checked={false}
      seatsAssigned={12}
      totalSeatBillingCount={14}
      selectedGroupsChosen={selectedGroupsChosen}
    />,
  )
}

describe('When rendering a user seat', () => {
  test('renders the user name', () => {
    renderSeatListItem(UserSeat, true)

    const name = screen.getByText('@Blah999', {selector: 'a > span'})
    const subtext = screen.getByText('The Blah', {selector: 'span'})
    expect(name).toBeInTheDocument()
    expect(subtext).toBeInTheDocument()
  })

  test('renders No Activity when the user has no activity', () => {
    renderSeatListItem({...UserSeat, last_activity_at: NO_ACTIVITY}, true)

    const activity = screen.getByText('No activity yet')
    expect(activity).toBeInTheDocument()
  })

  test('renders the last activity date when the user has activity', () => {
    renderSeatListItem(UserSeat, true)

    const activity = screen.getByTestId('last-activity')
    expect(activity).toBeInTheDocument()
  })

  test('renders the remove button when the user is not pending removal', () => {
    renderSeatListItem({...UserSeat, pending_cancellation_date: undefined}, true)

    const seatOptionsBtn = screen.getByTestId(`seat-options-${UserSeat.assignable.id}`)
    expect(seatOptionsBtn).toBeInTheDocument()
    fireEvent.click(seatOptionsBtn)
    const removeButton = screen.getByTestId(`remove-seat-${UserSeat.assignable.id}`)
    expect(removeButton).toBeInTheDocument()
    fireEvent.click(removeButton)
    const removeSeatConfirmBtn = screen.getByTestId(`remove-seat-confirm-${UserSeat.assignable.id}`)
    expect(removeSeatConfirmBtn).toBeInTheDocument()
    fireEvent.click(removeSeatConfirmBtn)
    expect(removeSeat).toHaveBeenCalledTimes(1)
    expect(removeSeat).toHaveBeenCalledWith(UserSeat.assignable.id)
  })

  test('renders the undo remove button when the user is pending removal', () => {
    renderSeatListItem({...UserSeat, pending_cancellation_date: '2020-01-01 18:00:00'}, true)

    const removingText = screen.getByText('Access will be removed on Jan 1, 2020')
    expect(removingText).toBeInTheDocument()
    const seatOptionsBtn = screen.getByTestId(`seat-options-${UserSeat.assignable.id}`)
    expect(seatOptionsBtn).toBeInTheDocument()
    fireEvent.click(seatOptionsBtn)
    const undoRemoveButton = screen.getByTestId(`undo-remove-seat-${UserSeat.assignable.id}`)
    expect(undoRemoveButton).toBeInTheDocument()
    fireEvent.click(undoRemoveButton)
    expect(addSeats).toHaveBeenCalledTimes(1)
    expect(addSeats).toHaveBeenCalledWith([UserSeat.assignable.login])
  })

  test('renders the resend email invite button when the user is pending invite', async () => {
    renderSeatListItem({...UserInviteSeat, assignable_type: SeatType.OrganizationInvitation}, true)

    const pendingInviteText = screen.getByTestId('seat-last-activity-at')
    expect(pendingInviteText.textContent).toContain('Pending invite')
    expect(pendingInviteText.textContent).not.toContain('Last usage')
    const seatOptionsBtn = screen.getByTestId(`seat-options-${UserInviteSeat.assignable.id}`)
    expect(seatOptionsBtn).toBeInTheDocument()
    fireEvent.click(seatOptionsBtn)
    const resendEmailInviteBtn = screen.getByTestId(`resend-email-invite-${UserInviteSeat.assignable.id}`)
    expect(resendEmailInviteBtn).toBeInTheDocument()
    fireEvent.click(resendEmailInviteBtn)
    await waitFor(() => {
      expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/blah/settings/copilot/send_invitation', {
        method: 'PUT',
        body: JSON.stringify({invitation_id: UserInviteSeat.assignable.id}),
        headers: expect.any(Object),
      })
    })
  })

  test('does not render the resend email invite button when the invite is expired', async () => {
    renderSeatListItem({...ExpiredUserInviteSeat, assignable_type: SeatType.OrganizationInvitation}, true)

    const pendingInviteText = screen.getByTestId('seat-last-activity-at')
    expect(pendingInviteText.textContent).toContain('Invitation Expired')
    expect(pendingInviteText.textContent).not.toContain('Last usage')
    const seatOptionsBtn = screen.getByTestId(`seat-options-${ExpiredUserInviteSeat.assignable.id}`)
    expect(seatOptionsBtn).toBeInTheDocument()
    fireEvent.click(seatOptionsBtn)
    const resendEmailInviteBtn = screen.queryByTestId(`resend-email-invite-${ExpiredUserInviteSeat.assignable.id}`)
    expect(resendEmailInviteBtn).not.toBeInTheDocument()
  })

  test('does not render the resend email invite button when the user has a seat assigned', () => {
    renderSeatListItem({...UserSeat}, true)

    const seatOptionsBtn = screen.getByTestId(`seat-options-${UserSeat.assignable.id}`)
    expect(seatOptionsBtn).toBeInTheDocument()
    fireEvent.click(seatOptionsBtn)
    const resendEmailInviteBtn = screen.queryByTestId(`resend-email-invite-${UserSeat.assignable.id}`)
    expect(resendEmailInviteBtn).not.toBeInTheDocument()
  })
})

describe('When rendering a team seat', () => {
  test('renders the team name', () => {
    renderSeatListItem(TeamSeat, true)

    const name = screen.getByText(`@${Team.login}`, {selector: 'a > span'})
    const subtext = screen.getByText(`@${Team.combined_slug} • ${Team.member_count} members`) // {selector: 'a'})
    expect(subtext).toBeInTheDocument()
    expect(name).toBeInTheDocument()
  })

  test('renders No Activity when the team has no activity', () => {
    renderSeatListItem({...TeamSeat, last_activity_at: NO_ACTIVITY}, true)

    const activity = screen.getByText('No activity yet')
    expect(activity).toBeInTheDocument()
  })

  test('renders the last activity date when the team has activity', () => {
    renderSeatListItem(TeamSeat, true)

    const activity = screen.getByTestId('last-activity')
    expect(activity).toBeInTheDocument()
  })

  // Update this when removing teams is supported
  test('renders the dummy remove button', () => {
    renderSeatListItem({...TeamSeat, pending_cancellation_date: undefined}, true)

    const seatOptionsBtn = screen.getByTestId(`seat-options-${Team.id}`)
    expect(seatOptionsBtn).toBeInTheDocument()
    fireEvent.click(seatOptionsBtn)
    const removeButton = screen.getByTestId(`remove-seat-${Team.id}`)
    expect(removeButton).toBeInTheDocument()
  })

  test('renders the remove button', () => {
    renderSeatListItem({...TeamSeat, pending_cancellation_date: undefined}, true)

    const seatOptionsBtn = screen.getByTestId(`seat-options-${Team.id}`)
    expect(seatOptionsBtn).toBeInTheDocument()
    fireEvent.click(seatOptionsBtn)
    const removeButton = screen.getByTestId(`remove-seat-${Team.id}`)
    expect(removeButton).toBeInTheDocument()
    fireEvent.click(removeButton)
    const removeSeatConfirmBtn = screen.getByTestId(`remove-seat-confirm-${Team.id}`)
    expect(removeSeatConfirmBtn).toBeInTheDocument()
    fireEvent.click(removeSeatConfirmBtn)
    expect(removeTeamSeat).toHaveBeenCalledTimes(1)
    expect(removeTeamSeat).toHaveBeenCalledWith(TeamSeat.assignable.id)
  })

  test('can re-assign seat for team after removal', () => {
    renderSeatListItem({...TeamSeat, pending_cancellation_date: '2020-01-02 18:00:00'}, true)

    fireEvent.click(screen.getByTestId(`seat-options-${Team.id}`))
    const reAssignSeatBtn = screen.getByText('Re-assign seat')
    expect(reAssignSeatBtn).toBeInTheDocument()
    fireEvent.click(reAssignSeatBtn)
    expect(addTeams).toHaveBeenCalledTimes(1)
    expect(addTeams).toHaveBeenCalledWith([TeamSeat.assignable.login])
  })
})

describe('When rendering an invitation seat', () => {
  test('renders the invite', () => {
    renderSeatListItem(EmailInviteSeat, true)

    const name = screen.getByText('blah@email.com')
    expect(name).toBeInTheDocument()
    const pendingInviteNotice = screen.getByText(/Pending invite \(.+\)/)
    expect(pendingInviteNotice).toBeInTheDocument()
  })

  test('renders the remove button', () => {
    renderSeatListItem({...EmailInviteSeat, pending_cancellation_date: undefined}, true)

    const seatOptionsBtn = screen.getByTestId(`seat-options-${EmailInvite.id}`)
    expect(seatOptionsBtn).toBeInTheDocument()
    fireEvent.click(seatOptionsBtn)
    const removeButton = screen.getByTestId(`remove-seat-${EmailInvite.id}`)
    expect(removeButton).toBeInTheDocument()
    fireEvent.click(removeButton)
    const removeSeatConfirmBtn = screen.getByTestId(`remove-seat-confirm-${EmailInvite.id}`)
    expect(removeSeatConfirmBtn).toBeInTheDocument()
    fireEvent.click(removeSeatConfirmBtn)
    expect(removeInvitation).toHaveBeenCalledTimes(1)
    expect(removeInvitation).toHaveBeenCalledWith(EmailInviteSeat.assignable.id)
  })

  test('does not render remove button if it is false', () => {
    renderSeatListItem({...EmailInviteSeat, pending_cancellation_date: undefined}, false)

    const seatOptionsBtn = screen.queryByTestId(`seat-options-${EmailInvite.id}`)
    expect(seatOptionsBtn).not.toBeInTheDocument()
  })
})

describe('When the disabled policy or enabled for all policy is selected', () => {
  test('should not display a checkbox to select a user', () => {
    renderSeatListItem(UserSeat, false)
    expect(
      screen.queryByTestId(`${UserSeat.assignable_type}-${UserSeat.assignable.id}-checkbox`),
    ).not.toBeInTheDocument()
  })

  test('should not display the action menu', () => {
    renderSeatListItem(UserSeat, false)

    const seatOptionsBtn = screen.queryByTestId(`seat-options-${UserSeat.assignable.id}`)
    expect(seatOptionsBtn).not.toBeInTheDocument()
  })
})

describe('When the allowed for selected groups policy selected', () => {
  test('should display a checkbox to select a user', () => {
    renderSeatListItem(UserSeat, true)
    expect(screen.getByTestId(`${UserSeat.assignable_type}-${UserSeat.assignable.id}`)).toBeInTheDocument()
  })
})
