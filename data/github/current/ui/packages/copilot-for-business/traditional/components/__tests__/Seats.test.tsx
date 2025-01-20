import {currency as formatCurrency} from '@github-ui/formatters'
import {render} from '@github-ui/react-core/test-utils'
import {act, fireEvent, screen, waitFor, within} from '@testing-library/react'
import {COPILOT_BUSINESS_LICENSE_COST} from '../../../constants'
import {createURLParams} from '../../../helpers/query'
import {
  Team,
  TeamSeat,
  UserSeat,
  getSeatManagementRoutePayloadWithCancelled,
  getSeatManagementRoutePayloadWithRequester,
  UserInviteSeat,
  EmailInviteSeat,
  getSeatManagementRoutePayload,
} from '../../../test-utils/mock-data'
import type {CopilotForBusinessPayload, UserAssignable} from '../../../types'
import {CopilotForBusinessSeatPolicy, SeatType} from '../../../types'
import {Seats} from '../Seats'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {mockFetch} from '@github-ui/mock-fetch'

jest.setTimeout(40_000)

const payload = getSeatManagementRoutePayload()
const emptyLicenses = {
  user_ids: [],
  team_ids: [],
  invite_user_ids: [],
  invite_emails: [],
}
const setPayload = jest.fn()

function renderSeats(
  props: {policy?: CopilotForBusinessSeatPolicy; payload?: CopilotForBusinessPayload} = {
    payload,
    policy: CopilotForBusinessSeatPolicy.EnabledForSelected,
  },
) {
  const policy = props.policy ?? CopilotForBusinessSeatPolicy.EnabledForSelected

  const seatBreakdown = {
    seats_assigned: 3,
    seats_billed: 3,
    seats_pending: 2,
    description: '3 seats assigned (3 seats billed / 2 seats pending)',
  }

  return render(
    <Seats
      payload={props.payload ?? payload}
      setPayload={setPayload}
      policy={policy}
      setCurrentPolicy={jest.fn()}
      selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
      setSelectedPolicy={jest.fn()}
      seatCount={2}
      seatBreakdown={seatBreakdown}
      setPolicyChangeIntent={jest.fn()}
      policyChangeIntent={null}
      membersCount={1}
      businessTrial={undefined}
      nextBillingDate={'2022-01-01'}
      planText={'Business'}
    />,
    {
      wrapper(p) {
        return (
          <>
            <div id="js-flash-container" />
            {p.children}
          </>
        )
      },
    },
  )
}

function assertDeleteConfirmationDialog(props: {memberCount: number; removedCount: number}) {
  const {memberCount, removedCount} = props

  expect(screen.getByText('Confirm seat removal')).toBeInTheDocument()
  expect(screen.getByText('Seats will be removed at the end of the billing period.')).toBeInTheDocument()
  expect(screen.getByTestId('total-seat-count-datum').textContent).toBe(String(memberCount))
  expect(screen.getByTestId('removed-seat-count-datum').textContent).toBe(String(removedCount))
  expect(screen.getByTestId('cfb-payment-total').textContent).toContain(
    formatCurrency(COPILOT_BUSINESS_LICENSE_COST * (memberCount - removedCount)),
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.unmock('../../hooks/use-copilot-settings-api')
})

describe('List of seats', () => {
  test('Shows list of seats with remove buttons', async () => {
    renderSeats()

    // User
    const name = screen.getByText('@Blah999', {selector: 'a > span'})
    expect(name).toBeInTheDocument()

    // Team
    const teamName = screen.getByText('@Team Blah', {selector: 'a > span'})
    expect(teamName).toBeInTheDocument()

    // Email invitation
    const email = screen.getByText('blah@email.com', {selector: 'span'})
    expect(email).toBeInTheDocument()

    // Seat breakdown
    expect(screen.getByText('5 members with access to Copilot')).toBeInTheDocument()
  })

  test('Shows list of seats without remove buttons if policy is all', () => {
    renderSeats({policy: CopilotForBusinessSeatPolicy.EnabledForAll})

    // User
    const name = screen.getByText('@Blah999', {selector: 'a > span'})
    expect(name).toBeInTheDocument()

    // Team
    const teamName = screen.getByText('@Team Blah', {selector: 'a > span'})
    expect(teamName).toBeInTheDocument()

    // Email invitation
    const email = screen.getByText('blah@email.com', {selector: 'span'})
    expect(email).toBeInTheDocument()

    // Seat breakdown
    expect(screen.getByText('5 members with access to Copilot')).toBeInTheDocument()
    expect(screen.queryAllByTestId(/remove-seat-/i).length).toBe(0)
  })

  test('shows the get report button', () => {
    renderSeats()

    const getReport = screen.getByRole('button', {name: 'Get report'})
    expect(getReport).toBeInTheDocument()
  })

  test('fires post request when the get report button is clicked', () => {
    renderSeats()
    const getReport = screen.getByRole('button', {name: 'Get report'})
    fireEvent.click(getReport)
    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/generate_csv', {
      method: 'POST',
      headers: expect.any(Object),
    })
    expect(mockFetch.calls()[0][1].headers.Accept).toBe('text/csv')
  })
})

describe('Sorting', () => {
  test('Have expected list of sorting options', () => {
    renderSeats()

    const sortButton = screen.getByRole('button', {name: 'Sort'})
    fireEvent.click(sortButton)

    const sortMenu = screen.getByRole('menu')
    const choices = within(sortMenu).getAllByRole('menuitemradio')

    expect(choices.length).toBe(4)
    expect(sortMenu).toHaveTextContent('Name ascending (A…Z)')
    expect(sortMenu).toHaveTextContent('Name descending (Z…A)')
    expect(sortMenu).toHaveTextContent('Last used date (Oldest first)')
    expect(sortMenu).toHaveTextContent('Last used date (Newest first)')
  })

  test('Sorts by name desc', () => {
    renderSeats()

    const sortButton = screen.getByRole('button', {name: 'Sort'})
    fireEvent.click(sortButton)

    const sortMenu = screen.getByRole('menu')
    const choices = within(sortMenu).getAllByRole('menuitemradio')
    const nameAsc = choices.find(choice => choice.textContent === 'Name ascending (A…Z)')

    expect(nameAsc).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByText('Name descending (Z…A)'))

    const expectedBody = {
      sort: 'name_desc',
      type: 'all',
      query: '',
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('Sorts by name asc', () => {
    renderSeats()

    const sortButton = screen.getByRole('button', {name: 'Sort'})
    fireEvent.click(sortButton)
    const sortMenu = screen.getByRole('menu')
    const choices = within(sortMenu).getAllByRole('menuitemradio')
    const nameAsc = choices.find(choice => choice.textContent === 'Name ascending (A…Z)')

    expect(nameAsc).toBeInTheDocument()
    expect(nameAsc).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByText('Name ascending (A…Z)'))

    const expectedBody = {
      sort: 'name_asc',
      type: 'all',
      query: '',
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('Sorts by usage descending', () => {
    renderSeats()

    // Default is sort by name asc
    const sortButton = screen.getByRole('button', {name: 'Sort'})
    fireEvent.click(sortButton)
    const sortMenu = screen.getByRole('menu')
    const choices = within(sortMenu).getAllByRole('menuitemradio')
    const nameAsc = choices.find(choice => choice.textContent === 'Name ascending (A…Z)')

    expect(nameAsc).toBeInTheDocument()
    expect(nameAsc).toHaveAttribute('aria-checked', 'true')

    // Select usage desc and check order
    fireEvent.click(screen.getByText('Last used date (Newest first)'))

    const expectedBody = {
      sort: 'use_desc',
      type: 'all',
      query: '',
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('Sorts by usage ascending with the correct request data', () => {
    renderSeats()

    const sortButton = screen.getByRole('button', {name: 'Sort'})
    fireEvent.click(sortButton)

    const sortMenu = screen.getByRole('menu')
    const choices = within(sortMenu).getAllByRole('menuitemradio')
    const nameAsc = choices.find(choice => choice.textContent === 'Name ascending (A…Z)')

    expect(nameAsc).toBeInTheDocument()
    expect(nameAsc).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByText('Last used date (Oldest first)'))
    const expectedBody = {
      sort: 'use_asc',
      type: 'all',
      query: '',
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('renders the error message when the request fails', async () => {
    const errorMsg = 'Something went wrong'
    mockFetch.mockRouteOnce(
      '/organizations/test-org/settings/copilot/seat_management/seats',
      Promise.reject(new Error(errorMsg)),
      {
        ok: false,
        status: 500,
      },
    )

    renderSeats()

    let errorMessage = screen.queryByText(errorMsg)
    expect(errorMessage).not.toBeInTheDocument()

    const sortButton = screen.getByRole('button', {name: 'Sort'})
    fireEvent.click(sortButton)
    fireEvent.click(screen.getByText('Last used date (Oldest first)'))

    errorMessage = await screen.findByText(errorMsg)
    expect(errorMessage).toBeInTheDocument()
  })

  test('sorts by pending cancellation date first when there are cancelled seats', async () => {
    renderSeats({
      policy: CopilotForBusinessSeatPolicy.EnabledForSelected,
      payload: getSeatManagementRoutePayloadWithCancelled(),
    })
    const seatList = screen.getByTestId('the-seats')
    const seats = within(seatList).getAllByRole('listitem')
    const sortButton = screen.getByRole('button', {name: 'Cancelled first'})

    expect(sortButton).toBeInTheDocument()
    expect(seats[0]?.textContent?.includes('Access will be removed')).toBeTruthy()
  })

  test('sorts by pending cancellation date last', async () => {
    renderSeats({
      policy: CopilotForBusinessSeatPolicy.EnabledForSelected,
      payload: getSeatManagementRoutePayloadWithCancelled(),
    })

    const sortButton = screen.getByRole('button', {name: 'Cancelled first'})

    fireEvent.click(sortButton)
    const sortEl = screen.getByText('Cancelled last')
    fireEvent.click(sortEl)

    const expectedBody = {
      sort: 'pending_cancelled_desc',
      type: 'all',
      query: '',
    }

    await waitFor(() =>
      expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
        method: 'POST',
        body: JSON.stringify(expectedBody),
        headers: expect.any(Object),
      }),
    )
  })
})

describe('Filtering', () => {
  test('Filters by user with the correct request data', () => {
    renderSeats()

    const filterButton = screen.getByRole('button', {name: 'Open filter options'})
    fireEvent.click(filterButton)
    expect(screen.getByText('Members')).toBeInTheDocument()

    const filterMenu = screen.getByTestId('copilot-user-search-filter')
    const choices = within(filterMenu).getAllByRole('menuitemradio')
    const allChoice = choices.find(choice => choice.textContent === 'All')

    expect(allChoice).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByText('Members'))

    const expectedBody = {
      sort: 'name_asc',
      type: 'users',
      query: '',
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('Filters by team with the correct request data', async () => {
    renderSeats()

    const filterButton = screen.getByRole('button', {name: 'Open filter options'})
    fireEvent.click(filterButton)
    expect(screen.getByText('Teams')).toBeInTheDocument()

    const filterMenu = screen.getByTestId('copilot-user-search-filter')
    const choices = within(filterMenu).getAllByRole('menuitemradio')
    const allChoice = choices.find(choice => choice.textContent === 'All')

    expect(allChoice).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByText('Teams'))

    const expectedBody = {
      sort: 'name_asc',
      type: 'teams',
      query: '',
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('Filters by pending invitation with the correct request data', () => {
    renderSeats()

    const filterButton = screen.getByRole('button', {name: 'Open filter options'})
    fireEvent.click(filterButton)
    expect(screen.getByText('Pending invitations')).toBeInTheDocument()

    const filterMenu = screen.getByTestId('copilot-user-search-filter')
    const choices = within(filterMenu).getAllByRole('menuitemradio')
    const allChoice = choices.find(choice => choice.textContent === 'All')

    expect(allChoice).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByText('Pending invitations'))
    const expectedBody = {
      sort: 'name_asc',
      type: 'organizationinvitations',
      query: '',
    }
    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('Filter by pending invitation, then all shows all', () => {
    renderSeats()

    const filterButton = screen.getByRole('button', {name: 'Open filter options'})
    fireEvent.click(filterButton)
    fireEvent.click(screen.getByText('All'))

    const expectedBody = {
      sort: 'name_asc',
      type: 'all',
      query: '',
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('Renders the seats returned after filtering', async () => {
    const expectedResponsePayload = {...payload, seats: {seats: [UserSeat]}}
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/seat_management/seats', expectedResponsePayload)

    renderSeats()

    expect(screen.getByText('The Blah', {selector: 'span'})).toBeInTheDocument()
    expect(screen.getByText('@Team Blah', {selector: 'a > span'})).toBeInTheDocument()

    const filterButton = screen.getByRole('button', {name: 'Open filter options'})
    fireEvent.click(filterButton)
    fireEvent.click(screen.getByText('Members'))

    await waitFor(() => expect(setPayload).toHaveBeenCalledWith(expectedResponsePayload))
  })

  test('Renders `Nothing matched` view when filter returns no seats', async () => {
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/seat_management/seats', {})
    renderSeats({
      payload: {
        ...payload,
        seats: {seats: [], count: 0, licenses: emptyLicenses},
      },
    })

    const filterButton = screen.getByRole('button', {name: 'Open filter options'})
    fireEvent.click(filterButton)
    fireEvent.click(screen.getByText('Members'))

    const tableHeader = await screen.findByText('Nothing matched your search criteria')
    const tableBody = await screen.findByText(
      'Make sure that everything is spelled correctly or try different keywords.',
    )
    const seatBreakdown = screen.getByTestId('seat-breakdown')

    expect(tableHeader).toBeInTheDocument()
    expect(tableBody).toBeInTheDocument()
    expect(seatBreakdown.textContent).toBe('5 members with access to Copilot')
  })

  test('Renders the table header when filter returns no seats', async () => {
    const expectedPayload = {...payload, seats: {seats: []}}
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/seat_management/seats', expectedPayload)

    renderSeats()

    expect(screen.getByText('@Team Blah', {selector: 'a > span'})).toBeInTheDocument()

    const filterButton = screen.getByRole('button', {name: 'Open filter options'})
    fireEvent.click(filterButton)
    fireEvent.click(screen.getByText('Members'))

    await waitFor(() => expect(setPayload).toHaveBeenCalledWith(expectedPayload))
  })

  test('renders the error message when the request fails', async () => {
    const errorMsg = 'Something went wrong'
    mockFetch.mockRouteOnce(
      '/organizations/test-org/settings/copilot/seat_management/seats',
      Promise.reject(new Error(errorMsg)),
      {
        ok: false,
        status: 500,
      },
    )

    renderSeats()

    let errorMessage = screen.queryByText(errorMsg)
    expect(errorMessage).not.toBeInTheDocument()

    const filterButton = screen.getByRole('button', {name: 'Open filter options'})
    fireEvent.click(filterButton)
    fireEvent.click(screen.getByText('Members'))

    errorMessage = await screen.findByText(errorMsg)
    expect(errorMessage).toBeInTheDocument()
  })
})

describe('Searching', () => {
  test('Queries with the right data', async () => {
    renderSeats()

    const searchInput = screen.getByPlaceholderText('Filter by name or handle')
    fireEvent.change(searchInput, {target: {value: UserSeat.assignable.display_name}})

    const expectedBody = {
      sort: 'name_asc',
      type: 'all',
      query: UserSeat.assignable.display_name!,
    }

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
      method: 'POST',
      body: JSON.stringify(expectedBody),
      headers: expect.any(Object),
    })
  })

  test('displays only the seats matching the query', async () => {
    const expectedPayload = {...payload, seats: {seats: [UserSeat]}}
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/seat_management/seats', expectedPayload)

    renderSeats()

    expect(screen.getByText('The Blah', {selector: 'span'})).toBeInTheDocument()
    expect(screen.getByText('@Team Blah', {selector: 'a > span'})).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Filter by name or handle')
    fireEvent.change(searchInput, {target: {value: UserSeat.assignable.display_name}})

    await waitFor(() => expect(setPayload).toHaveBeenCalledWith(expectedPayload))
  })

  test('renders the error message when the request fails', async () => {
    const errorMsg = 'Something went wrong'
    mockFetch.mockRouteOnce(
      '/organizations/test-org/settings/copilot/seat_management/seats',
      Promise.reject(new Error(errorMsg)),
      {
        ok: false,
        status: 500,
      },
    )

    renderSeats()

    let errorMessage = screen.queryByText(errorMsg)
    expect(errorMessage).not.toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Filter by name or handle')
    fireEvent.change(searchInput, {target: {value: UserSeat.assignable.display_name}})

    await act(() => new Promise(resolve => setTimeout(resolve, 1)))
    errorMessage = screen.queryByText(errorMsg)

    expect(errorMessage).toBeInTheDocument()
  })

  test('Renders the table header when search returns no seats', async () => {
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/seat_management/seats', {})
    renderSeats({
      payload: {
        ...payload,
        seats: {seats: [], count: 0, licenses: emptyLicenses},
      },
    })

    const searchInput = screen.getByPlaceholderText('Filter by name or handle')
    fireEvent.change(searchInput, {target: {value: 'bad search'}})

    const tableHeader = await screen.findByText('Nothing matched your search criteria')
    const tableBody = await screen.findByText(
      'Make sure that everything is spelled correctly or try different keywords.',
    )
    const seatBreakdown = screen.queryByTestId('seat-breakdown')

    expect(tableHeader).toBeInTheDocument()
    expect(tableBody).toBeInTheDocument()
    expect(searchInput).toBeInTheDocument()
    expect(seatBreakdown?.textContent).toBe('5 members with access to Copilot')
  })
})

describe('Removing seats', () => {
  test('Dialog opens', async () => {
    renderSeats()

    const seatOptionsBtn = screen.getByTestId(`seat-options-${TeamSeat.assignable.id}`)
    fireEvent.click(seatOptionsBtn)

    const removeTeamSeatBtn = screen.getByTestId(`remove-seat-${TeamSeat.assignable.id}`)
    fireEvent.click(removeTeamSeatBtn)

    const removeTeamSeatDialog = screen.getByTestId(`remove-seat-dialog-${TeamSeat.assignable.id}`)
    expect(removeTeamSeatDialog).toBeInTheDocument()
  })

  test('Removes a team seat', async () => {
    renderSeats()
    const seatOptionsBtn = screen.getByTestId(`seat-options-${TeamSeat.assignable.id}`)
    fireEvent.click(seatOptionsBtn)

    const removeTeamSeatBtn = screen.getByTestId(`remove-seat-${TeamSeat.assignable.id}`)
    fireEvent.click(removeTeamSeatBtn)

    const removeTeamSeatConfirmBtn = screen.getByTestId(`remove-seat-confirm-${TeamSeat.assignable.id}`)
    fireEvent.click(removeTeamSeatConfirmBtn)

    const params = createURLParams({
      sort: 'name_asc',
      type: 'all',
      query: '',
      page: '1',
      team_id: Team.id,
    })

    await waitFor(() => {
      expect(mockFetch.fetch).toHaveBeenCalledWith(
        `/organizations/${payload.organization.name}/settings/copilot/remove_team_seat?${params}`,
        {
          method: 'DELETE',
          body: undefined,
          headers: expect.any(Object),
        },
      )
    })
  })
})

describe('Pagination', () => {
  test('Does not render when there is only one page of seats', () => {
    renderSeats()

    const paginationMenu = screen.queryByTestId('pagination')
    expect(paginationMenu).not.toBeInTheDocument()
  })

  test('Renders when there is more than one page of seats', () => {
    renderSeats({payload: {...payload, seats: {...payload.seats, count: 26}}})

    const paginationMenu = screen.getByTestId('pagination')
    expect(paginationMenu).toBeInTheDocument()
  })

  test('Queries with the right data', async () => {
    renderSeats({payload: {...payload, seats: {...payload.seats, count: 26}}})

    const nextPageLink = screen.getByText('Next', {selector: 'a'})
    fireEvent.click(nextPageLink)

    const expectedBody = {
      sort: 'name_asc',
      type: 'all',
      query: '',
      page: '2',
    }

    await waitFor(() => {
      expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/test-org/settings/copilot/seat_management/seats', {
        method: 'POST',
        body: JSON.stringify(expectedBody),
        headers: expect.any(Object),
      })
    })
  })

  test('displays the next page of seats', async () => {
    const otherUserSeat = {...UserSeat, assignable: {...UserSeat.assignable, display_name: 'Other Blah'}}
    const expectedPayload = {...payload, seats: {seats: [otherUserSeat]}}
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/seat_management/seats', expectedPayload)

    renderSeats({payload: {...payload, seats: {...payload.seats, count: 26}}})
    expect(screen.getByText('The Blah', {selector: 'span'})).toBeInTheDocument()

    const nextPageLink = screen.getByText('Next', {selector: 'a'})
    fireEvent.click(nextPageLink)

    await waitFor(() => expect(setPayload).toHaveBeenCalledWith(expectedPayload))
  })

  test('renders the error message when the request fails', async () => {
    const errorMsg = 'Something went wrong'
    mockFetch.mockRouteOnce(
      '/organizations/test-org/settings/copilot/seat_management/seats',
      Promise.reject(new Error(errorMsg)),
      {
        ok: false,
        status: 500,
      },
    )

    renderSeats({payload: {...payload, seats: {...payload.seats, count: 26}}})

    let errorMessage = screen.queryByText(errorMsg)
    expect(errorMessage).not.toBeInTheDocument()

    const nextPageLink = screen.getByText('Next', {selector: 'a'})
    fireEvent.click(nextPageLink)

    errorMessage = await screen.findByText(errorMsg)
    await waitFor(() => expect(errorMessage).toBeInTheDocument())
  })
})

describe('Bulk removal', () => {
  test('Counting works', () => {
    renderSeats()

    const userSeat = screen.getByTestId('User-999-checkbox')
    const teamSeat = screen.getByTestId('Team-111-checkbox')
    const emailInvite = screen.getByTestId('OrganizationInvitation-126-checkbox')
    const invite = screen.getByTestId('OrganizationInvitation-125-checkbox')
    const selectAll: HTMLInputElement = screen.getByTestId('selectAll')

    expect(screen.getByTestId('seat-breakdown')).toBeInTheDocument()
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(false)

    fireEvent.click(userSeat)
    expect(screen.queryByTestId('seat-breakdown')).not.toBeInTheDocument()
    const actionMenu = screen.getByTestId('bulk-selected')
    expect(actionMenu).toHaveTextContent('1 member selected')
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(true)

    fireEvent.click(teamSeat)
    expect(actionMenu).toHaveTextContent('3 members selected')
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(true)

    fireEvent.click(emailInvite)
    expect(actionMenu).toHaveTextContent('4 members selected')
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(true)

    fireEvent.click(invite)
    expect(actionMenu).toHaveTextContent('5 members selected')
    expect(selectAll.checked).toBe(true)
    expect(selectAll.indeterminate).toBe(false)

    fireEvent.click(teamSeat)
    expect(actionMenu).toHaveTextContent('3 members selected')
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(true)

    fireEvent.click(emailInvite)
    expect(actionMenu).toHaveTextContent('2 members selected')
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(true)

    fireEvent.click(invite)
    fireEvent.click(userSeat)

    expect(screen.getByTestId('seat-breakdown')).toBeInTheDocument()
    expect(screen.queryByTestId('bulk-selected')).not.toBeInTheDocument()
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(false)
  })

  test('Select all works', () => {
    renderSeats()
    const userSeat: HTMLInputElement = screen.getByTestId('User-999-checkbox')
    const teamSeat: HTMLInputElement = screen.getByTestId('Team-111-checkbox')
    const emailInvite: HTMLInputElement = screen.getByTestId('OrganizationInvitation-126-checkbox')
    const invite: HTMLInputElement = screen.getByTestId('OrganizationInvitation-125-checkbox')
    const selectAll: HTMLInputElement = screen.getByTestId('selectAll')
    expect(screen.getByTestId('seat-breakdown')).toBeInTheDocument()
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(false)

    fireEvent.click(selectAll)
    expect(screen.queryByTestId('seat-breakdown')).not.toBeInTheDocument()
    const actionMenu = screen.getByTestId('bulk-selected')
    expect(actionMenu).toHaveTextContent('5 members selected')
    expect(selectAll.checked).toBe(true)
    expect(selectAll.indeterminate).toBe(false)
    expect(userSeat.checked).toBe(true)
    expect(teamSeat.checked).toBe(true)
    expect(emailInvite.checked).toBe(true)
    expect(invite.checked).toBe(true)

    fireEvent.click(selectAll)
    expect(screen.getByTestId('seat-breakdown')).toBeInTheDocument()
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(false)
    expect(userSeat.checked).toBe(false)
    expect(teamSeat.checked).toBe(false)
    expect(emailInvite.checked).toBe(false)
    expect(invite.checked).toBe(false)
  })

  test('Deleting only teams deletes only teams', async () => {
    renderSeats()
    const teamSeat = screen.getByTestId('Team-111-checkbox')
    fireEvent.click(teamSeat)
    fireEvent.click(screen.getByTestId('bulk-remove-button'))

    assertDeleteConfirmationDialog({removedCount: 2, memberCount: 5})

    fireEvent.click(screen.getByRole('button', {name: 'Remove seats'}))

    const expectedBody = {
      sort: 'name_asc',
      type: 'all',
      query: '',
      page: 1,
      teams: [111],
      invites: [],
      users: [],
    }

    await waitFor(() => {
      expect(mockFetch.fetch).toHaveBeenCalledWith(
        '/organizations/test-org/settings/copilot/seat_management_bulk_update',
        {
          method: 'POST',
          body: JSON.stringify(expectedBody),
          headers: expect.any(Object),
        },
      )
    })
  })

  test('Deleting only org invites deletes only org invites', async () => {
    renderSeats()
    const emailInvite: HTMLInputElement = screen.getByTestId('OrganizationInvitation-126-checkbox')
    const invite: HTMLInputElement = screen.getByTestId('OrganizationInvitation-125-checkbox')
    fireEvent.click(invite)
    fireEvent.click(emailInvite)
    fireEvent.click(screen.getByTestId('bulk-remove-button'))

    assertDeleteConfirmationDialog({removedCount: 2, memberCount: 5})

    fireEvent.click(screen.getByRole('button', {name: 'Remove seats'}))

    const expectedBody = {
      sort: 'name_asc',
      type: 'all',
      query: '',
      page: 1,
      teams: [],
      invites: [126, 125],
      users: [],
    }

    await waitFor(() => {
      expect(mockFetch.fetch).toHaveBeenCalledWith(
        '/organizations/test-org/settings/copilot/seat_management_bulk_update',
        {
          method: 'POST',
          body: JSON.stringify(expectedBody),
          headers: expect.any(Object),
        },
      )
    })
  })

  test('Deleting only users deletes only users', async () => {
    renderSeats()
    const userSeat = screen.getByTestId('User-999-checkbox')
    fireEvent.click(userSeat)
    fireEvent.click(screen.getByTestId('bulk-remove-button'))

    assertDeleteConfirmationDialog({removedCount: 1, memberCount: 5})

    fireEvent.click(screen.getByRole('button', {name: 'Remove seats'}))

    const expectedBody = {
      sort: 'name_asc',
      type: 'all',
      query: '',
      page: 1,
      teams: [],
      invites: [],
      users: [999],
    }

    await waitFor(() => {
      expect(mockFetch.fetch).toHaveBeenCalledWith(
        '/organizations/test-org/settings/copilot/seat_management_bulk_update',
        {
          method: 'POST',
          body: JSON.stringify(expectedBody),
          headers: expect.any(Object),
        },
      )
    })
  })

  test('Deleting all deletes all', async () => {
    renderSeats()
    const selectAll = screen.getByTestId('selectAll')
    fireEvent.click(selectAll)
    fireEvent.click(screen.getByTestId('bulk-remove-button'))

    assertDeleteConfirmationDialog({removedCount: 5, memberCount: 5})

    fireEvent.click(screen.getByRole('button', {name: 'Remove seats'}))

    const expectedBody = {
      sort: 'name_asc',
      type: 'all',
      query: '',
      page: 1,
      teams: [111],
      invites: [126, 125],
      users: [999],
    }
    await waitFor(() => {
      expect(mockFetch.fetch).toHaveBeenCalledWith(
        '/organizations/test-org/settings/copilot/seat_management_bulk_update',
        {
          method: 'POST',
          body: JSON.stringify(expectedBody),
          headers: expect.any(Object),
        },
      )
    })
  })
})

describe('Disabled policy', () => {
  test('hides the add seats button and selectAll checkbox, but show the search input if there are any billed seats', () => {
    renderSeats({policy: CopilotForBusinessSeatPolicy.Disabled})

    const addSeatsBtn = screen.queryByText('Add members')
    const selectAll = screen.queryByTestId('selectAll')
    const searchInput = screen.getByTestId('cfb-search-seats')

    expect(addSeatsBtn).not.toBeInTheDocument()
    expect(selectAll).not.toBeInTheDocument()
    expect(searchInput).toBeInTheDocument()
  })

  test('shows no members in the table when there are no billed seats', () => {
    const noSeatsPayload = {
      ...payload,
      seats: {seats: [], count: 0, licenses: emptyLicenses},
      seat_breakdown: {
        seats_assigned: 0,
        seats_billed: 0,
        seats_pending: 0,
        description: '0 seats assigned, 0 seats billed, 0 seats pending',
      },
    }
    renderSeats({policy: CopilotForBusinessSeatPolicy.Disabled, payload: noSeatsPayload})

    const tableHeader = screen.getByText('No seats assigned')
    const textHeader = screen.getByRole('heading', {level: 2})
    const searchInput = screen.queryByTestId('cfb-search-seats')

    expect(tableHeader).toBeInTheDocument()
    expect(textHeader).toHaveTextContent('No seats assigned')
    expect(searchInput).not.toBeInTheDocument()
  })
})

describe('Allowed for all policy', () => {
  test('hides the add seats button and selectAll checkbox', () => {
    renderSeats({policy: CopilotForBusinessSeatPolicy.EnabledForAll})

    const addSeatsBtn = screen.queryByText('Add members')
    const selectAll = screen.queryByTestId('selectAll')

    expect(addSeatsBtn).not.toBeInTheDocument()
    expect(selectAll).not.toBeInTheDocument()
  })
})

describe('Allowed for selected groups policy', () => {
  test('shows the add seats button and selectAll checkbox', () => {
    renderSeats()

    const addSeatsBtn = screen.getByText('Add seats')
    const selectAll = screen.getByTestId('selectAll')

    expect(addSeatsBtn).toBeInTheDocument()
    expect(selectAll).toBeInTheDocument()
  })

  test('shows no members in the table when no seats have been assigned', () => {
    const noSeatsPayload = {
      ...payload,
      seats: {seats: [], count: 0, licenses: emptyLicenses},
      seat_breakdown: {
        seats_assigned: 0,
        seats_billed: 0,
        seats_pending: 0,
        description: '0 seats assigned, 0 seats billed, 0 seats pending',
      },
    }
    renderSeats({payload: noSeatsPayload})

    const tableHeader = screen.getByText('No seats assigned')
    const textHeader = screen.getByRole('heading', {level: 2})
    const addMembersBtn = screen.getByText('Assign Copilot seats')

    expect(tableHeader).toBeInTheDocument()
    expect(textHeader).toHaveTextContent('No seats assigned')
    expect(addMembersBtn).toBeInTheDocument()
  })

  test('shows the add seats button, get report button, and search input when no seats assigned but some seats are billed', () => {
    const noSeatsPayload = {
      ...payload,
      seats: {seats: [], count: 0, licenses: emptyLicenses},
      seat_breakdown: {
        seats_assigned: 0,
        seats_billed: 4,
        seats_pending: 0,
        description: '0 seats assigned, 4 seats billed, 0 seats pending',
      },
    }
    renderSeats({payload: noSeatsPayload})

    expect(screen.getByText('Get report')).toBeInTheDocument()
    expect(screen.getByText('Add seats')).toBeInTheDocument()
    expect(screen.getByTestId('cfb-search-seats')).toBeInTheDocument()
  })
})

describe('Resend invite button', () => {
  test('appears when pending seats are checked', () => {
    renderSeats()
    const pendingSeat1 = screen.getByRole('checkbox', {
      name: `Select OrganizationInvitation ${UserInviteSeat.assignable.login}`,
    })
    fireEvent.click(pendingSeat1)

    const pendingSeat2 = screen.getByRole('checkbox', {
      name: `Select OrganizationInvitation ${EmailInviteSeat.assignable.login}`,
    })
    fireEvent.click(pendingSeat2)

    expect(screen.getByText('Resend invite')).toBeInTheDocument()
  })

  test('does not appear when both assigned and pending seats are checked', () => {
    renderSeats()

    const pendingSeat = screen.getByRole('checkbox', {
      name: `Select OrganizationInvitation ${UserInviteSeat.assignable.login}`,
    })
    fireEvent.click(pendingSeat)

    const seat = screen.getByRole('checkbox', {
      name: `Select User ${UserSeat.assignable.login}`,
    })
    fireEvent.click(seat)

    expect(screen.queryByText('Resend invite')).not.toBeInTheDocument()
  })

  test('does not appear when only assigned seats are checked', () => {
    renderSeats()

    const seat = screen.getByRole('checkbox', {
      name: `Select User ${UserSeat.assignable.login}`,
    })
    fireEvent.click(seat)

    expect(screen.queryByText('Resend invite')).not.toBeInTheDocument()
  })
})

describe('Display pending requests', () => {
  test('renders pending requests', () => {
    renderSeats({
      policy: CopilotForBusinessSeatPolicy.EnabledForSelected,
      payload: getSeatManagementRoutePayloadWithRequester(),
    })

    expect(screen.getByTestId('pending-requests-card')).toBeInTheDocument()
  })
})

describe('Flash message', () => {
  test('renders when the report is generated and exported', async () => {
    let resolveNetworkBlob: (b: Blob) => void
    const promise = new Promise<Blob>(r => (resolveNetworkBlob = r))
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/generate_csv', undefined, {
      blob: () => promise,
    })

    global.URL.createObjectURL = jest.fn().mockReturnValue('test')
    global.URL.revokeObjectURL = jest.fn()
    jest.spyOn(HTMLElement.prototype, 'click').mockImplementation()

    renderSeats()

    const message = screen.queryByText('The CSV report is being generated and successfully exported.')
    expect(message).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Get report'))
    resolveNetworkBlob!(new Blob(['test'], {type: 'text/csv'}))

    await screen.findByText(/The CSV report is being generated and successfully exported./)
  })
})

describe('Spinner', () => {
  test('renders when the report is generating', async () => {
    renderSeats()
    const label = screen.queryByLabelText('Loading a csv usage report')
    expect(label).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Get report'))

    await screen.findByLabelText('Loading a csv usage report')
  })

  test('stops rendering when the report has been exported', async () => {
    let resolveNetworkBlob: (b: Blob) => void
    const promise = new Promise<Blob>(r => (resolveNetworkBlob = r))
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/generate_csv', promise, {
      blob: () => promise,
    })
    URL.createObjectURL = jest.fn().mockReturnValue('test')
    URL.revokeObjectURL = jest.fn()
    jest.spyOn(HTMLElement.prototype, 'click').mockImplementation()

    renderSeats()

    const label = screen.queryByLabelText('Loading a csv usage report')
    expect(label).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Get report'))

    await screen.findByLabelText('Loading a csv usage report')

    resolveNetworkBlob!(new Blob(['test'], {type: 'text/csv'}))

    await screen.findByText('The CSV report is being generated and successfully exported.')
    expect(screen.queryByLabelText('Loading a csv usage report')).not.toBeInTheDocument()
  })

  test('does not render when there is an error generating a report', async () => {
    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/generate_csv', undefined, {
      ok: false,
      status: 500,
    })
    renderSeats()

    const label = screen.queryByLabelText('Loading a csv usage report')
    expect(label).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Get report'))

    await screen.findByLabelText('Loading a csv usage report')
    // Catches the error and resets the loading state
    await waitFor(() => expect(screen.queryByLabelText('Loading a csv usage report')).not.toBeInTheDocument())
  })
})

describe('Add seats button', () => {
  test('opens the add seats dialog', () => {
    renderSeats()
    const button = screen.getByTestId('add-seats')
    fireEvent.click(button)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('org-assignables-list')).toBeInTheDocument()
  })

  test('triggers hydro event', () => {
    renderSeats()
    const button = screen.getByTestId('add-seats')
    fireEvent.click(button)

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'copilot_access_management',
        action: `click_to_open_add_seats_dialog`,
        label: `ref_cta:add_seats;ref_loc:access_management_button_group`,
      },
    })
  })
})

describe('After purchasing seats', () => {
  beforeEach(() => {
    const orgMember: UserAssignable = {
      id: 666,
      avatar_url: '',
      display_login: 'buddy',
      org_member: true,
      profile_name: 'buddy',
      type: SeatType.User,
    }

    mockFetch.mockRouteOnce('/organizations/test-org/settings/copilot/members?page=1&sort=name_asc&q=', {
      assignables: [orgMember],
      total: 1,
    })
  })

  test('hides PendingRequestCard', async () => {
    renderSeats({
      policy: CopilotForBusinessSeatPolicy.EnabledForSelected,
      payload: getSeatManagementRoutePayloadWithRequester(),
    })

    expect(screen.getByTestId('pending-requests-card')).toBeInTheDocument()

    const button = screen.getByTestId('add-seats')
    fireEvent.click(button)

    const dialog = screen.getByRole('dialog')

    const checkboxes = await within(dialog).findAllByRole('checkbox')
    const clickables = checkboxes.filter(box => !(box as HTMLInputElement).disabled)

    for (const clickable of clickables) {
      fireEvent.click(clickable)
    }

    const continueBtn = await screen.findByText('Continue to purchase')

    fireEvent.click(continueBtn)

    const finishBtn = await screen.findByRole('button', {name: 'Purchase seats'})

    mockFetch.mockRouteOnce(
      '/organizations/test-org/settings/copilot/seats/create',
      getSeatManagementRoutePayloadWithRequester(),
    )

    fireEvent.click(finishBtn)

    await waitFor(async () => {
      expect(screen.queryByTestId('pending-requests-card')).not.toBeInTheDocument()
    })
  })
})
