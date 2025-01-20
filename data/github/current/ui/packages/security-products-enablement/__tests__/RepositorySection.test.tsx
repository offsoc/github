import {screen, within, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {createMoreRepos, getOrganizationSettingsSecurityProductsRoutePayload} from '../test-utils/mock-data'
import {expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import {setupExpectedAsyncErrorHandler, updateFilterValue} from '@github-ui/filter/test-utils'
import {dialogRepositoryWrapper as wrapper, customRepositorySection} from './test-helpers'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})
jest.setTimeout(4_500)

describe('RepositorySection', () => {
  beforeEach(navigateFn.mockClear)

  // This is necessary because we render the FailureBanner within this page.
  // Copied from https://github.com/primer/react/blob/main/packages/react/src/Banner/Banner.test.tsx:
  beforeEach(() => {
    // Note: this error occurs due to our usage of `@container` within a
    // `<style>` tag in Banner. The CSS parser for jsdom does not support this
    // syntax and will fail with an error containing the message below.
    // eslint-disable-next-line no-console
    const originalConsoleError = console.error
    jest.spyOn(console, 'error').mockImplementation((value, ...args) => {
      if (!value?.message?.includes('Could not parse CSS stylesheet')) {
        originalConsoleError(value, ...args)
      }
    })
  })

  it('renders', () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositorySection({}), {routePayload, wrapper})

    // Assert that the table headers are rendered
    expect(screen.getByText('Apply configurations')).toBeInTheDocument()
    expect(
      screen.getByText('Select repositories to apply configurations and view license consumption information.'),
    ).toBeInTheDocument()
  })

  it('renders a summary of GitHub Advanced Security license availability and usage from an enterprise', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositorySection({}), {routePayload, wrapper})

    const element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent(/0 GitHub Advanced Security licenses available, 1 in use by GitHub, Inc/)
  })

  it('does not render a license summary if org does not have GHAS purchased', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.capabilities.ghasPurchased = false
    render(customRepositorySection({}), {routePayload, wrapper})

    const element = screen.queryByTestId('license-summary')
    expect(element).not.toBeInTheDocument()
  })

  it('renders the tally of advanced security license summary data when a repo is selected', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositorySection({}), {routePayload, wrapper})

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        licenses_needed: 5,
        licenses_freed: 0,
        failedToFetchLicenses: false,
      },
    )

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')
    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toBeChecked()
    expectMockFetchCalledWith(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        repository_ids: ['1'],
      },
    )

    const element = screen.queryByTestId('license-summary')
    await waitFor(
      () => {
        expect(element).toHaveTextContent(
          '0 GitHub Advanced Security licenses available, 1 in use by GitHub, Inc.For configurations with GitHub Advanced Security: 5 licenses required if applying and 0 licenses freed up if disabling',
        )
      },
      {timeout: 2000},
    )
  })

  it('renders the tally of advanced security license summary data when all repos are selected', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositorySection({}), {routePayload, wrapper})

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        licenses_needed: 10,
        licenses_freed: 1,
        failedToFetchLicenses: false,
      },
    )

    const selectAllCheckbox = screen.getByTestId('select-all-checkbox')
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    expectMockFetchCalledWith(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        repository_ids: ['1', '2', '3', '4', '5'],
      },
    )

    const element = screen.queryByTestId('license-summary')
    await waitFor(() => {
      expect(element).toHaveTextContent(
        /0 GitHub Advanced Security licenses available, 1 in use by GitHub, Inc.For configurations with GitHub Advanced Security: 10 licenses required if applying and 1 license freed up if disabling/,
      )
    })

    // Updates the tallys to 0s when no repos are selected
    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        licenses_needed: 0,
        licenses_freed: 0,
        failedToFetchLicenses: false,
      },
    )
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).not.toBeChecked()
    expectMockFetchCalledWith(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        repository_ids: [],
      },
    )

    await waitFor(() => {
      expect(element).toHaveTextContent(/0 GitHub Advanced Security licenses available, 1 in use by GitHub, Inc/)
    })
  })

  it('does not send repo ids if more than 25 repos are present and select all is checked', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const repositories = createMoreRepos()
    routePayload.repositories = repositories

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customWrapper = (props: any) => wrapper({...props, totalRepositoryCount: repositories.length})

    const {user} = render(customRepositorySection({}), {routePayload, wrapper: customWrapper})

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        licenses_needed: 10,
        licenses_freed: 1,
        failedToFetchLicenses: false,
      },
    )

    const selectAllCheckbox = screen.getByTestId('select-all-checkbox')
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    expectMockFetchCalledWith(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        repository_ids: [],
      },
    )

    const element = screen.queryByTestId('license-summary')
    await waitFor(() => {
      expect(element).toHaveTextContent(
        /0 GitHub Advanced Security licenses available, 1 in use by GitHub, Inc.For configurations with GitHub Advanced Security: 10 licenses required if applying and 1 license freed up if disabling/,
      )
    })
  }, 10000)

  it('hides licenses required text if organization has not purchased GHAS', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.capabilities.ghasPurchased = false
    render(customRepositorySection({}), {routePayload, wrapper})

    expect(screen.getAllByTestId('repos-list')[0]).toBeInTheDocument()
    expect(screen.getByText('public-repository')).toBeInTheDocument()
    expect(screen.getByText('private-repository')).toBeInTheDocument()

    const itemMetadata = screen.getAllByTestId('list-view-item-metadata-item')
    expect(itemMetadata[0]).not.toHaveTextContent('licenses required')
  })

  it('does not render pagination component when pageCount is 1', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.pageCount = 1
    render(customRepositorySection(), {routePayload, wrapper})

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('renders pagination when pageCount is greater than 1', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositorySection({}), {routePayload, wrapper})

    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('does not render a failure banner when failureCounts are empty', async () => {
    // By default the failureCounts in the payload are an empty object, so we don't need to modify it:
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositorySection({}), {routePayload, wrapper})
    expect(screen.queryByTestId('failure-banner')).toBeNull()
  })

  it('does not render a failure banner without the feature flag', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositorySection({previewNext: false}), {routePayload, wrapper})
    expect(screen.queryByTestId('failure-banner')).toBeNull()
  })

  it('renders the failure banner when failureCounts are in the payload', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const failureCounts = {Unknown: 1}
    render(customRepositorySection({failureCounts}), {routePayload, wrapper})

    const failureBanner = screen.getByTestId('failure-banner')
    expect(failureBanner).toBeInTheDocument()
  })
})

describe('repo table filtering', () => {
  beforeEach(() => {
    setupExpectedAsyncErrorHandler()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('suggests both configuration filters', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositorySection({}), {routePayload, wrapper})

    const filterResults = screen.getByTestId('filter-results')
    await updateFilterValue('config')
    await waitFor(() => {
      // Accessible name includes the 'filter' type, which is expected behavior for screen reader users.
      // This is different than the visual text on purpose.
      expect(within(filterResults).getByLabelText('Configuration status, Filter')).toBeInTheDocument()
    })

    const results = within(filterResults).getAllByRole('option')

    expect(results.length).toEqual(2)
    expect(results[0]).toHaveTextContent('Configuration')
    expect(results[1]).toHaveTextContent('Configuration status')
  })

  it('suggests options for configuration status', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositorySection({}), {routePayload, wrapper})

    const filterResults = screen.getByTestId('filter-results')
    await updateFilterValue('config-status:')
    await waitFor(() => {
      // Accessible name includes the 'filter' type, which is expected behavior for screen reader users.
      // This is different than the visual text on purpose.
      expect(within(filterResults).getByLabelText('Attached, Configuration status')).toBeInTheDocument()
    })

    const results = within(filterResults).getAllByRole('option')

    expect(results.length).toEqual(5)
    expect(results[0]).toHaveTextContent('Attached')
    expect(results[1]).toHaveTextContent('Removed')
    expect(results[2]).toHaveTextContent('Failed')
    expect(results[3]).toHaveTextContent('Enforced')
    expect(results[4]).toHaveTextContent('Removed by enterprise')
  })

  it('suggests options for configuration name', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositorySection({}), {routePayload, wrapper})

    const filterResults = screen.getByTestId('filter-results')
    await updateFilterValue('configuration:')
    await waitFor(() => {
      // Accessible name includes the 'filter' type, which is expected behavior for screen reader users.
      // This is different than the visual text on purpose.
      expect(within(filterResults).getByLabelText('High Risk, Configuration')).toBeInTheDocument()
    })

    const results = within(filterResults).getAllByRole('option')

    expect(results.length).toEqual(4)
    expect(results[0]).toHaveTextContent('High Risk')
    expect(results[1]).toHaveTextContent('Low Risk')
    expect(results[2]).toHaveTextContent('GitHub Recommended')
    expect(results[3]).toHaveTextContent('None')
  })

  it('suggests options for team and filters by the selected option', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositorySection({}), {routePayload, wrapper})
    const filterResults = screen.getByTestId('filter-results')
    const filterTextBar = screen.getByRole('combobox')

    mockFetch.mockRoute(
      'http://localhost/organizations/github/settings/security_products/configurations/filter-suggestions/teams?q=&filter_value=',
      {
        teams: [
          {
            name: 'Team A',
            combined_slug: 'team-a',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        ],
      },
    )
    let suggestion: HTMLElement | undefined
    await updateFilterValue('team:')
    await waitFor(() => {
      suggestion = within(filterResults).getAllByRole('option')[1]
      expect(suggestion).toHaveTextContent('Team A')
    })

    const avatarImage: HTMLImageElement = within(suggestion!).getByAltText('"Team A"')
    expect(avatarImage.src).toMatch(/^https:\/\/example\.com\/avatar\.jpg/)

    await user.click(suggestion!)

    await waitFor(() => {
      expect(filterTextBar).toHaveValue('team:"Team A"')
    })
  })

  it('does not suggest filters for Team when no teams are available', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.capabilities.hasTeams = false
    render(customRepositorySection({}), {routePayload, wrapper})
    const filterResults = screen.getByTestId('filter-results')

    await updateFilterValue('team')
    await waitFor(() => {
      expect(within(filterResults).queryByRole('option')).not.toBeInTheDocument()
    })
  })

  it('suggests options for custom property filters', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositorySection({}), {routePayload, wrapper})
    const filterResults = screen.getByTestId('filter-results')
    const filterTextBar = screen.getByRole('combobox')

    let suggestion: HTMLElement
    await updateFilterValue('props.custom-property:')
    await waitFor(() => {
      // Accessible name includes the 'filter' type, which is expected behavior for screen reader users.
      // This is different than the visual text on purpose.
      suggestion = within(filterResults).getByRole('option', {name: 'production, Property: custom-property'})
      expect(suggestion).toBeInTheDocument()
    })

    await user.click(suggestion!)

    await waitFor(() => {
      expect(filterTextBar).toHaveValue('props.custom-property:production')
    })
  })

  it('suggests options for failure reason', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositorySection({}), {routePayload, wrapper})
    const filterResults = screen.getByTestId('filter-results')
    const filterTextBar = screen.getByRole('combobox')

    let suggestion: HTMLElement
    await updateFilterValue('failure-reason:')
    await waitFor(() => {
      // Accessible name includes the 'filter' type, which is expected behavior for screen reader users.
      // This is different than the visual text on purpose.
      suggestion = within(filterResults).getByRole('option', {name: 'Not enough licenses, Failure reason'})
      expect(suggestion).toBeInTheDocument()
    })

    const results = within(filterResults).getAllByRole('option')
    expect(results.length).toEqual(7)
    expect(results[0]).toHaveTextContent('Actions disabled')
    expect(results[1]).toHaveTextContent('Code scanning')
    expect(results[2]).toHaveTextContent('Enterprise policy')
    expect(results[3]).toHaveTextContent('Not enough licenses')
    expect(results[4]).toHaveTextContent('Not purchased')
    expect(results[5]).toHaveTextContent('Runners unavailable')
    expect(results[6]).toHaveTextContent('Unknown')

    await user.click(suggestion!)

    await waitFor(() => {
      expect(filterTextBar).toHaveValue('failure-reason:not_enough_licenses')
    })
  })
})
