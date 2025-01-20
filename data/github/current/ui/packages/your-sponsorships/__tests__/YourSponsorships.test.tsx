import {fireEvent, screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {YourSponsorships, type YourSponsorshipsProps} from '../YourSponsorships'
import {
  getYourSponsorshipsProps,
  getYourSponsorshipsPropsMultipleSponsorships,
  getYourSponsorshipsPropsNoActive,
  getYourSponsorshipsPropsPagination,
} from '../test-utils/mock-data'

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock

jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

test('Renders description with current and past sponsorship count', () => {
  const props = getYourSponsorshipsProps()
  render(<YourSponsorships {...props} />)
  expect(screen.getByTestId('your-sponsorships-description')).toHaveTextContent(
    'sponsoring-org has 1 current sponsorship and 0 past sponsorships',
  )
})

test('Renders description with current and past sponsorship count - multiple', () => {
  const props = getYourSponsorshipsPropsMultipleSponsorships()
  render(<YourSponsorships {...props} />)
  expect(screen.getByTestId('your-sponsorships-description')).toHaveTextContent(
    'sponsoring-org has 3 current sponsorships and 1 past sponsorship',
  )
})

test('Renders empty state if no sponsorships', () => {
  const props = getYourSponsorshipsPropsNoActive()
  render(<YourSponsorships {...props} />)
  expect(screen.getByTestId('your-sponsorships-empty-state')).toBeVisible()
  expect(screen.queryByTestId('your-sponsorships-table')).toBeNull()
})

test('Renders current sponsorships when Current Sponsorships tab is selected', () => {
  const props = getYourSponsorshipsProps()
  render(<YourSponsorships {...props} />)

  const currentTabButton = screen.getByText('Current Sponsorships')
  fireEvent.click(currentTabButton)

  expect(screen.getByTestId('your-sponsorships-table')).toBeInTheDocument()
  expect(screen.queryByTestId('your-sponsorships-empty-state')).toBeNull()
})

test('Renders past sponsorships when Past Sponsorships tab is selected', () => {
  const props = getYourSponsorshipsPropsNoActive()
  render(<YourSponsorships {...props} />)

  const currentTabButton = screen.getByText('Past Sponsorships')
  fireEvent.click(currentTabButton)

  expect(screen.getByTestId('your-sponsorships-table')).toBeInTheDocument()
  expect(screen.queryByTestId('your-sponsorships-empty-state')).toBeNull()
})

test('renders the correct number of items on the first page and correct number of items on the next page', () => {
  const PAGE_SIZE = 1
  const props = getYourSponsorshipsPropsPagination(PAGE_SIZE)
  render(<YourSponsorships {...props} />)
  const rows = screen.getAllByRole('row')
  expect(rows).toHaveLength(PAGE_SIZE + 1) // add 1 for the header row
  expect(rows[1]).toHaveTextContent('sponsorable1')

  const nextPageButton = screen.getByText('Next')
  fireEvent.click(nextPageButton)

  const rowsNext = screen.getAllByRole('row')
  expect(rowsNext).toHaveLength(PAGE_SIZE + 1) // add 1 for the header row
  expect(rowsNext[1]).toHaveTextContent('sponsorable2')
})

test('Supports filtering by sponsorable login', async () => {
  const props = getYourSponsorshipsPropsMultipleSponsorships()
  const {user} = render(<YourSponsorships {...props} />)

  const filterBox = screen.getByRole('textbox')

  const initialRows = screen.queryAllByRole('row')
  expect(initialRows).toHaveLength(4) // header and 3 rows

  await user.click(filterBox)
  await user.paste('SpOnSoRaBlE1') // case-insenstive matching

  expect(screen.getByTestId('your-sponsorships-table')).toBeVisible()
  const filteredRows = screen.queryAllByRole('row')
  expect(filteredRows).toHaveLength(2) // header and one row
  expect(filteredRows[1]).toHaveTextContent('sponsorable1')

  await user.clear(filterBox) // restores rows when filter removed

  const restoredRows = screen.queryAllByRole('row')
  expect(restoredRows).toHaveLength(4) // header and 4 rows
})

test('Show empty state when filtering matches no sponsorships', async () => {
  const props = getYourSponsorshipsPropsMultipleSponsorships()
  const {user} = render(<YourSponsorships {...props} />)

  const filterBox = screen.getByRole('textbox')

  await user.click(filterBox)
  await user.paste('no-matches')

  expect(screen.queryByTestId('your-sponsorships-table')).toBeNull()
  expect(screen.queryByTestId('your-sponsorships-empty-state')).toBeNull()
  expect(screen.queryByTestId('your-sponsorships-filter-empty-state')).toBeVisible()
})

describe('Respects viewer permissions', () => {
  test('columns when viewer is non-member', () => {
    const props = getYourSponsorshipsProps()
    props.viewerIsOrgMember = false
    props.viewerCanManageSponsorships = false
    render(<YourSponsorships {...props} />)

    const columns = screen.queryAllByRole('columnheader')
    expect(columns).toHaveLength(3)
    const columnNames = columns.map(column => column.textContent)
    expect(columnNames).toEqual(['Name', 'Start date', 'Actions'])
    expect(screen.queryByTestId('sponsor-button')).toBeVisible()
    expect(screen.queryByTestId('manage-button')).toBeNull()
  })

  test('columns when viewer is member', () => {
    const props = getYourSponsorshipsProps()
    props.viewerIsOrgMember = true
    props.viewerCanManageSponsorships = false
    render(<YourSponsorships {...props} />)

    const columns = screen.queryAllByRole('columnheader')
    expect(columns).toHaveLength(4)
    const columnNames = columns.map(column => column.textContent)
    expect(columnNames).toEqual(['Name', 'Visibility', 'Start date', 'Actions'])
    expect(screen.queryByTestId('sponsor-button')).toBeVisible()
    expect(screen.queryByTestId('manage-button')).toBeNull()
  })

  test('sponsor button link for current sponsorships when viewer is member', () => {
    const props = getYourSponsorshipsProps()
    props.viewerIsOrgMember = true
    props.viewerCanManageSponsorships = false
    render(<YourSponsorships {...props} />)

    const sponsorButton = screen.getByTestId('sponsor-button')
    expect(sponsorButton).toHaveAttribute('href', `/sponsors/sponsorable`)
  })

  test('sponsor button link for current sponsorships when viewer is non-member', () => {
    const props = getYourSponsorshipsProps()
    props.viewerIsOrgMember = false
    props.viewerCanManageSponsorships = false
    render(<YourSponsorships {...props} />)

    const sponsorButton = screen.getByTestId('sponsor-button')
    expect(sponsorButton).toHaveAttribute('href', `/sponsors/sponsorable`)
  })

  test('columns when viewer can manage sponsorships', () => {
    const props = getYourSponsorshipsProps()
    props.viewerIsOrgMember = true
    props.viewerCanManageSponsorships = true
    render(<YourSponsorships {...props} />)

    const columns = screen.queryAllByRole('columnheader')
    expect(columns).toHaveLength(5)
    const columnNames = columns.map(column => column.textContent)
    expect(columnNames).toEqual(['Name', 'Visibility', 'Start date', 'Amount', 'Actions'])
    expect(screen.queryByTestId('manage-button')).toBeVisible()
    expect(screen.queryByTestId('sponsor-button')).toBeNull()
  })

  test('export button exists when viewer can manage sponsorships', () => {
    const props = getYourSponsorshipsProps()
    props.viewerCanManageSponsorships = true
    render(<YourSponsorships {...props} />)

    expect(screen.getByTestId('your-sponsorships-export-button')).toBeVisible()
  })

  test('export button omitted when viewer cannot manage sponsorships', () => {
    const props = getYourSponsorshipsProps()
    props.viewerCanManageSponsorships = false
    render(<YourSponsorships {...props} />)

    expect(screen.queryByTestId('your-sponsorships-export-button')).toBeNull()
  })
})

describe('Exporting sponsorships', () => {
  test('requests export for active sponsorships showing flash when current selected', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => {
        return {msg: 'expected-flash-message'}
      },
    })

    const props = getYourSponsorshipsProps()
    render(<YourSponsorships {...props} />)

    const exportButton = screen.getByTestId('your-sponsorships-export-button')
    expect(exportButton).toBeInTheDocument()

    fireEvent.click(exportButton)

    const startExportButton = await screen.findByTestId('your-sponsorships-start-export-button')
    expect(startExportButton).toBeVisible()

    fireEvent.click(startExportButton)

    expect(mockVerifiedFetchJSON).toHaveBeenCalledWith('/orgs/sponsoring-org/sponsoring/sponsorships_exports', {
      method: 'POST',
      body: {active: true},
    })
    const resultFlash = await screen.findByTestId('your-sponsorships-flash')
    expect(within(resultFlash).getByText('expected-flash-message')).toBeInTheDocument()
  })

  test('requests export for non active sponsorships showing flash when past selected', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => {
        return {msg: 'expected-flash-message'}
      },
    })

    const props = getYourSponsorshipsPropsNoActive()
    render(<YourSponsorships {...props} />)

    const pastTabButton = screen.getByText('Past Sponsorships')
    fireEvent.click(pastTabButton)

    const exportButton = screen.getByTestId('your-sponsorships-export-button')
    expect(exportButton).toBeInTheDocument()

    fireEvent.click(exportButton)

    const startExportButton = await screen.findByTestId('your-sponsorships-start-export-button')
    expect(startExportButton).toBeVisible()

    fireEvent.click(startExportButton)

    expect(mockVerifiedFetchJSON).toHaveBeenCalledWith('/orgs/sponsoring-org/sponsoring/sponsorships_exports', {
      method: 'POST',
      body: {active: false},
    })
    const resultFlash = await screen.findByTestId('your-sponsorships-flash')
    expect(within(resultFlash).getByText('expected-flash-message')).toBeInTheDocument()
  })

  test('renders danger flash with error message when export request fails', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      status: 500,
      ok: false,
      error: 'error',
    })

    const props = getYourSponsorshipsProps()
    render(<YourSponsorships {...props} />)

    const exportButton = screen.getByTestId('your-sponsorships-export-button')
    expect(exportButton).toBeInTheDocument()

    fireEvent.click(exportButton)

    const startExportButton = await screen.findByTestId('your-sponsorships-start-export-button')
    expect(startExportButton).toBeVisible()

    fireEvent.click(startExportButton)

    expect(mockVerifiedFetchJSON).toHaveBeenCalled()

    const resultFlash = await screen.findByTestId('your-sponsorships-flash')
    expect(within(resultFlash).getByText('There was a problem exporting your sponsorships.')).toBeInTheDocument()
  })
})

describe('Manage button actions', () => {
  describe('Current sponsorships', () => {
    let props: YourSponsorshipsProps
    beforeEach(() => {
      props = getYourSponsorshipsProps()
      props.viewerIsOrgMember = true
      props.viewerCanManageSponsorships = true
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    test('manage button menu when sponsorship is public', () => {
      render(<YourSponsorships {...props} />)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      const manageSponsorshipButton = screen.getByTestId('manage-sponsorship-button')

      expect(manageSponsorshipButton).toHaveAttribute(
        'href',
        '/sponsors/sponsorable/sponsorships?sponsor=sponsoring-org&tier_id=1',
      )

      const privacyButton = screen.getByTestId('privacy-button')
      expect(privacyButton).toBeInTheDocument()
      expect(screen.getByText('Subscribe to email updates')).toBeInTheDocument()
    })

    test('manage button menu when sponsorship is private', () => {
      if (props.sponsorships[0]) {
        props.sponsorships[0].privacyLevel = 'private'
      }
      render(<YourSponsorships {...props} />)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      expect(screen.getByText('Make Public')).toBeInTheDocument()
    })

    test('manage button menu when patreon sponsorship', () => {
      if (props.sponsorships[0]) {
        props.sponsorships[0].patreonLink = 'patreon-link.com'
      }
      render(<YourSponsorships {...props} />)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      const manageSponsorshipButton = screen.getByTestId('manage-sponsorship-button')
      expect(manageSponsorshipButton).toHaveAttribute('href', 'patreon-link.com')
    })

    test('manage button menu when subscribed to email updates', () => {
      if (props.sponsorships[0]) {
        props.sponsorships[0].subscribedToNewsletterUpdates = true
      }
      render(<YourSponsorships {...props} />)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      expect(screen.getByText('Unsubscribe from emails')).toBeInTheDocument()
    })

    test('Update a sponsorship to be private', async () => {
      mockVerifiedFetchJSON.mockResolvedValue({
        status: 200,
        ok: true,
      })

      render(<YourSponsorships {...props} />)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      const privacyButton = screen.getByTestId('privacy-button')
      expect(privacyButton).toHaveTextContent('Make Private')

      fireEvent.click(privacyButton)

      const resultFlash = await screen.findByTestId('your-sponsorships-flash')
      expect(resultFlash).toBeInTheDocument()

      // After changing the privacy above, go through the flow again to make sure the button text and table text updates
      const manageButton2 = screen.getByTestId('manage-button')
      fireEvent.click(manageButton2)

      const row = screen.getByRole('row', {name: /sponsorable/})
      expect(row).toHaveTextContent('private')

      const privacyButton2 = screen.getByTestId('privacy-button')
      expect(privacyButton2).toHaveTextContent('Make Public')

      // ensure that updating the privacy level does not change the subscription setting
      const subscriptionButton = screen.getByTestId('subscribe-button')
      expect(subscriptionButton).toHaveTextContent('Subscribe to email updates')
    })

    test('Error updating a sponsorship to be private', async () => {
      mockVerifiedFetchJSON.mockResolvedValue({
        status: 500,
        ok: false,
      })

      render(<YourSponsorships {...props} />)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      const privacyButton = screen.getByTestId('privacy-button')
      expect(privacyButton).toHaveTextContent('Make Private')

      fireEvent.click(privacyButton)

      const resultFlash = await screen.findByTestId('your-sponsorships-flash')
      expect(resultFlash).toHaveTextContent('There was a problem updating your sponsorship')

      // After changing the privacy above, go through the flow again to make sure the button text and table text does not change
      const manageButton2 = screen.getByTestId('manage-button')
      fireEvent.click(manageButton2)

      const row = screen.getByRole('row', {name: /sponsorable/})
      expect(row).toHaveTextContent('public')

      const privacyButton2 = screen.getByTestId('privacy-button')
      expect(privacyButton2).toHaveTextContent('Make Private')
    })

    test('Subscribe to email updates', async () => {
      mockVerifiedFetchJSON.mockResolvedValue({
        status: 200,
        ok: true,
      })
      render(<YourSponsorships {...props} />)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      const subscribeButton = screen.getByTestId('subscribe-button')
      expect(subscribeButton).toHaveTextContent('Subscribe to email updates')

      fireEvent.click(subscribeButton)

      const resultFlash = await screen.findByTestId('your-sponsorships-flash')
      expect(resultFlash).toBeInTheDocument()

      // After changing the privacy above, go through the flow again to make sure the button text updates
      const manageButton2 = screen.getByTestId('manage-button')
      fireEvent.click(manageButton2)

      const subscribeButton2 = screen.getByTestId('subscribe-button')
      expect(subscribeButton2).toHaveTextContent('Unsubscribe from emails')

      // ensure that updating the subscription setting does not change the privacy level
      const privacyButton = screen.getByTestId('privacy-button')
      expect(privacyButton).toHaveTextContent('Make Private')
    })

    test('Error subscribing to email updates', async () => {
      mockVerifiedFetchJSON.mockResolvedValue({
        status: 501,
        ok: false,
      })
      render(<YourSponsorships {...props} />)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      const subscribeButton = screen.getByTestId('subscribe-button')
      expect(subscribeButton).toHaveTextContent('Subscribe to email updates')

      fireEvent.click(subscribeButton)

      const resultFlash = await screen.findByTestId('your-sponsorships-flash')
      expect(resultFlash).toHaveTextContent('There was a problem updating your sponsorship')

      // After changing the privacy above, go through the flow again to make sure the button text and table text does not change

      const manageButton2 = screen.getByTestId('manage-button')
      fireEvent.click(manageButton2)

      const subscribeButton2 = screen.getByTestId('subscribe-button')
      expect(subscribeButton2).toHaveTextContent('Subscribe to email updates')

      // ensure that updating the subscription setting does not change the privacy level
      const privacyButton = screen.getByTestId('privacy-button')
      expect(privacyButton).toHaveTextContent('Make Private')
    })
  })

  describe('Past sponsorships', () => {
    let props: YourSponsorshipsProps
    beforeEach(() => {
      props = getYourSponsorshipsProps()
      props.viewerIsOrgMember = true
      props.viewerCanManageSponsorships = true
      if (props.sponsorships[0]) {
        props.sponsorships[0].active = false
      }
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    test('manage button menu when sponsorship is public', () => {
      render(<YourSponsorships {...props} />)

      const pastTabButton = screen.getByText('Past Sponsorships')
      fireEvent.click(pastTabButton)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      const manageSponsorshipButton = screen.getByTestId('manage-past-sponsorship-button')

      expect(manageSponsorshipButton).toHaveAttribute('href', '/sponsors/sponsorable?sponsor=sponsoring-org')
      expect(screen.getByText('Make Private')).toBeInTheDocument()
      expect(screen.queryByText('Unsubscribe from emails')).toBeNull()
      expect(screen.queryByText('Subscribe to email updates')).toBeNull()
    })

    test('manage button menu when sponsorship is private', async () => {
      mockVerifiedFetchJSON.mockResolvedValue({
        status: 200,
        ok: true,
      })

      if (props.sponsorships[0]) {
        props.sponsorships[0].active = false
        props.sponsorships[0].privacyLevel = 'private'
      }
      render(<YourSponsorships {...props} />)

      const pastTabButton = screen.getByText('Past Sponsorships')
      fireEvent.click(pastTabButton)

      const manageButton = screen.getByTestId('manage-button')
      fireEvent.click(manageButton)

      const privacyButton = screen.getByTestId('privacy-button-past')
      expect(privacyButton).toHaveTextContent('Make Public')

      fireEvent.click(privacyButton)

      const resultFlash = await screen.findByTestId('your-sponsorships-flash')
      expect(resultFlash).toBeInTheDocument()

      // After changing the privacy above, go through the flow again to make sure the button text and table text updates
      const manageButton2 = screen.getByTestId('manage-button')
      fireEvent.click(manageButton2)

      const row = screen.getByRole('row', {name: /sponsorable/})
      expect(row).toHaveTextContent('public')

      const privacyButton2 = screen.getByTestId('privacy-button-past')
      expect(privacyButton2).toHaveTextContent('Make Private')
    })
  })
})
