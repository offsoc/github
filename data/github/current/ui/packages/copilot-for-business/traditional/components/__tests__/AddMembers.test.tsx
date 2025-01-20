import {fireEvent, screen, waitFor, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {AddMembers} from '../AddMembers'
import {mockFetch} from '@github-ui/mock-fetch'
import {SeatType} from '../../../types'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useCreateFetcher} from '../../../hooks/use-fetchers'

const fetcherFactorySpy = jest.spyOn({useCreateFetcher}, 'useCreateFetcher')

jest.mock('@github-ui/react-core/use-feature-flag')

interface TestSelectedSeat {
  name: string
  member_ids?: number[]
}

function getSelected() {
  return {
    Team: [] as TestSelectedSeat[],
    User: [] as TestSelectedSeat[],
    OrganizationInvitation: [] as TestSelectedSeat[],
  }
}

let selected = getSelected()
const setSelected = jest.fn(
  (data: {Team: TestSelectedSeat[]; User: TestSelectedSeat[]; OrganizationInvitation: TestSelectedSeat[]}) => {
    selected = data
  },
)

const selectionError = 'Please select at least one member from the list to continue with the purchase.'
const setSelectionError = jest.fn(() => {})

beforeEach(() => {
  jest.clearAllMocks()
  selected = getSelected()
})

function renderAddMembers(
  organization = 'blorg',
  seatsCount = 0,
  selectedSeats = getSelected(),
  hasPendingRequests = false,
) {
  return render(
    <AddMembers
      organization={organization}
      selected={selectedSeats}
      setSelected={setSelected}
      selectionError={selectionError}
      setSelectionError={setSelectionError}
      newSeatsCount={seatsCount}
      hasPendingRequests={hasPendingRequests}
      ariaLiveRegionId="aria-live-region"
    />,
  )
}

describe('<AddMembers />', () => {
  test('renders with an initial loading state', async () => {
    fetcherFactorySpy.mockImplementation(() => () => ({
      loading: true,
      data: undefined,
    }))

    renderAddMembers()

    await waitFor(async () => {
      const loader = await screen.findByTestId('org-assignables-list-loader')
      expect(loader).toBeInTheDocument()
    })
  })

  test('renders error when encountered', async () => {
    mockFetch.mockRouteOnce(
      '/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=',
      {error: 'Not Found'},
      {ok: false, status: 404},
    )

    renderAddMembers()

    await waitFor(async () => {
      const fallbackEl = await screen.findByText('Unable to load organization members at this time')
      expect(fallbackEl).toBeInTheDocument()
    })

    await waitFor(async () => {
      const errorText = await screen.findByText('Not Found')
      expect(errorText).toBeInTheDocument()
    })
  })

  test('renders with initial data', async () => {
    mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=', {
      assignables: [
        {
          id: 1,
          avatar_url: '',
          display_login: 'buddy',
          org_member: true,
          profile_name: 'buddy',
          type: SeatType.User,
        },
      ],
      total: 1,
    })
    renderAddMembers()

    await waitFor(async () => {
      const list = await screen.findByTestId('org-assignables-list')
      const items = within(list).queryAllByTestId(/assignable-list-item/)

      expect(items.length).toBe(1)
    })

    await waitFor(async () => {
      expect(screen.queryByTestId('add-members-pagination')).not.toBeInTheDocument()
    })
  })

  describe('when feature flag is enabled', () => {
    const mockUseFeatureFlag = jest.mocked(useFeatureFlag)
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue(true)
    })

    test('shows only the date sorting options if no pending requests exist', async () => {
      mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [
          {
            id: 1,
            avatar_url: '',
            display_login: 'buddy',
            org_member: true,
            profile_name: 'buddy',
            type: SeatType.User,
          },
        ],
        total: 1,
      })
      renderAddMembers('blorg', 0, getSelected(), false)

      let sortMenu: HTMLElement | null = null
      let choices: HTMLElement[] = []
      await waitFor(async () => {
        const sortButton = screen.getByRole('button', {name: 'Sort'})
        sortButton.click()

        sortMenu = screen.getByRole('menu')
        choices = within(sortMenu).getAllByRole('menuitemradio')
      })
      expect(choices.length).toBe(2)

      expect(sortMenu).toHaveTextContent('Name ascending (A–Z)')
      expect(sortMenu).toHaveTextContent('Name descending (Z–A)')
      expect(sortMenu).not.toHaveTextContent('Requested date (Oldest first)')
      expect(sortMenu).not.toHaveTextContent('Requested date (Newest first)')
    })

    test('shows all sorting options if requests exist', async () => {
      mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [
          {
            id: 1,
            avatar_url: '',
            display_login: 'buddy',
            org_member: true,
            profile_name: 'buddy',
            type: SeatType.User,
          },
        ],
        total: 1,
      })
      renderAddMembers('blorg', 0, getSelected(), true)

      let sortMenu: HTMLElement | null = null
      let choices: HTMLElement[] = []
      await waitFor(async () => {
        const sortButton = screen.getByRole('button', {name: 'Sort'})
        sortButton.click()

        sortMenu = screen.getByRole('menu')
        choices = within(sortMenu).getAllByRole('menuitemradio')
      })
      expect(choices.length).toBe(4)

      expect(sortMenu).toHaveTextContent('Name ascending (A–Z)')
      expect(sortMenu).toHaveTextContent('Name descending (Z–A)')
      expect(sortMenu).toHaveTextContent('Requested date (Oldest first)')
      expect(sortMenu).toHaveTextContent('Requested date (Newest first)')
    })

    test('preselect checkbox if requests exist', async () => {
      mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [
          {
            id: 1,
            avatar_url: '',
            display_login: 'buddy',
            org_member: true,
            profile_name: 'buddy',
            type: SeatType.User,
          },
        ],
        total: 1,
      })

      const selectedSeats = {
        Team: [] as TestSelectedSeat[],
        User: [{name: 'buddy'}],
        OrganizationInvitation: [] as TestSelectedSeat[],
      }

      renderAddMembers('blorg', 0, selectedSeats, true)

      let checkbox: HTMLElement[] = []
      await waitFor(async () => {
        checkbox = screen.getAllByRole('checkbox')
      })
      expect(checkbox.length).toBe(1)
      expect(checkbox[0]).toBeChecked()
    })
  })

  describe('when feature flag is disabled', () => {
    const mockUseFeatureFlag = jest.mocked(useFeatureFlag)
    beforeEach(() => {
      mockUseFeatureFlag.mockReturnValue(false)
    })
    test('shows the correct sorting options', async () => {
      mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [
          {
            id: 1,
            avatar_url: '',
            display_login: 'buddy',
            org_member: true,
            profile_name: 'buddy',
            type: SeatType.User,
          },
        ],
        total: 1,
      })
      renderAddMembers()

      let sortMenu: HTMLElement | null = null
      let choices: HTMLElement[] = []
      await waitFor(async () => {
        const sortButton = screen.getByRole('button', {name: 'Sort'})
        sortButton.click()

        sortMenu = screen.getByRole('menu')
        choices = within(sortMenu).getAllByRole('menuitemradio')
      })
      expect(choices.length).toBe(2)

      expect(sortMenu).toHaveTextContent('Name ascending (A–Z)')
      expect(sortMenu).toHaveTextContent('Name descending (Z–A)')
    })
  })

  describe('selecting assignables to add', () => {
    test('works', async () => {
      const orgMember = {
        id: 1,
        avatar_url: '',
        display_login: 'buddy',
        org_member: true,
        profile_name: 'buddy',
        type: SeatType.User,
      }
      mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [orgMember],
        total: 1,
      })
      renderAddMembers()

      let items: HTMLElement[] = []

      await waitFor(async () => {
        const list = await screen.findByTestId('org-assignables-list')
        items = await within(list).findAllByTestId(/assignable-list-item/)
      })

      const checkboxId = `${orgMember.type}-${orgMember.id}-checkbox`
      const el = within(items[0]!).getByTestId(checkboxId)

      fireEvent.click(el, {target: {checked: false}})

      await waitFor(async () => {
        expect(setSelected).toHaveBeenCalled()
      })
    })

    test('selected state gets updated including name when a user is selected', async () => {
      const orgMember = {
        id: 1,
        avatar_url: '',
        display_login: 'buddy',
        org_member: true,
        profile_name: 'buddy',
        type: SeatType.User,
      }

      mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [orgMember],
        total: 1,
      })
      renderAddMembers()

      let items: HTMLElement[] = []

      await waitFor(async () => {
        const list = await screen.findByTestId('org-assignables-list')
        items = await within(list).findAllByTestId(/assignable-list-item/)
      })

      const checkboxId = `${orgMember.type}-${orgMember.id}-checkbox`
      const el = within(items[0]!).getByTestId(checkboxId)

      fireEvent.click(el, {target: {checked: false}})

      await waitFor(async () => {
        expect(selected['User']).toEqual([{name: orgMember.display_login, member_ids: [orgMember.id]}])
      })
    })

    test('selected state includes name and member_ids when a team is selected', async () => {
      const team = {
        id: 2,
        avatar_url: '',
        name: 'team',
        member_ids: [1, 2, 3],
        org_member: true,
        slug: 'team',
        type: SeatType.Team,
      }

      mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [team],
        total: 1,
      })
      renderAddMembers()

      let items: HTMLElement[] = []

      await waitFor(async () => {
        const list = await screen.findByTestId('org-assignables-list')
        items = await within(list).findAllByTestId(/assignable-list-item/)
      })

      const checkboxId = `${team.type}-${team.id}-checkbox`
      const el = within(items[0]!).getByTestId(checkboxId)

      fireEvent.click(el, {target: {checked: false}})

      await waitFor(async () => {
        expect(selected['Team']).toEqual([{name: team.name, member_ids: team.member_ids}])
      })
    })
  })

  describe('Table header', () => {
    test('renders with a default header when no seat is selected', async () => {
      renderAddMembers()
      await waitFor(async () => {
        const defaultHeaderText = await screen.findByText('0 members selected')
        expect(defaultHeaderText).toBeInTheDocument()
      })
    })

    test('renders with one member added', async () => {
      const selectedSeats = {
        Team: [] as TestSelectedSeat[],
        User: [{name: 'name-blah'}],
        OrganizationInvitation: [] as TestSelectedSeat[],
      }

      renderAddMembers('blah', 1, selectedSeats)
      await waitFor(async () => {
        const defaultHeaderText = await screen.findByText('1 member selected')
        expect(defaultHeaderText).toBeInTheDocument()
      })
    })

    test('renders with multiple members added', async () => {
      const selectedSeats = {
        Team: [{name: 'team-blah', member_ids: [1, 2]}],
        User: [{name: 'name-blah'}],
        OrganizationInvitation: [] as TestSelectedSeat[],
      }

      renderAddMembers('blah', 3, selectedSeats)
      await waitFor(async () => {
        const defaultHeaderText = await screen.findByText('3 members selected')
        expect(defaultHeaderText).toBeInTheDocument()
      })
    })
  })
})
