import {screen, within, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {getOrganizationSettingsSecurityProductsRoutePayload} from '../test-utils/mock-data'
import {expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import {selectedRepositoryWrapper as wrapper, customRepositoryTable} from './test-helpers'
import {settingsOrgSecurityProductsRepositoriesConfigurationSummaryPath} from '@github-ui/paths'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})
jest.setTimeout(4_500)

describe('RepositoryTable', () => {
  beforeEach(navigateFn.mockClear)

  it('shows the total number of repositories in the organization', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositoryTable({}), {routePayload, wrapper})

    expect(screen.getByText('11 repositories')).toBeInTheDocument()
  })

  it('renders the table with correct number of repositories', () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositoryTable({}), {routePayload, wrapper})
    const tableRows = screen.getAllByRole('listitem')
    expect(tableRows.length).toBe(routePayload.repositories.length)
  })

  it('lists the 2 repositories', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositoryTable({}), {routePayload, wrapper})

    expect(screen.getAllByTestId('repos-list')[0]).toBeInTheDocument()
    expect(screen.getByText('public-repository')).toBeInTheDocument()
    expect(screen.getByText('private-repository')).toBeInTheDocument()

    const itemMetadata = screen.getAllByTestId('list-view-item-metadata-item')
    expect(itemMetadata[1]).toHaveTextContent('licenses required')

    expect(itemMetadata[0]).toHaveTextContent('Applying repos config')
    expect(itemMetadata[2]).toHaveTextContent('repos config 2')
    expect(itemMetadata[4]).toHaveTextContent('Removed repos config 2')
    expect(itemMetadata[6]).toHaveTextContent('No security features enabled')
    expect(itemMetadata[8]).toHaveTextContent('No configuration')

    expect(screen.queryByText('Apply configuration')).not.toBeInTheDocument()
  })

  it('renders the table with correct failure reasons', () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositoryTable({}), {routePayload, wrapper})

    expect(screen.getAllByTestId('repos-list')[0]).toBeInTheDocument()
    expect(screen.getByText('public-repository')).toBeInTheDocument()

    const itemMetadata = screen.getAllByTestId('list-view-item-metadata-item')
    expect(itemMetadata[10]).toHaveTextContent('Failed (Code scanning) repos config 2')
  })

  it('shows apply configuration button when select-all checkbox is checked', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()

    expect(screen.getByText('Apply configuration')).toBeInTheDocument()
  })

  it('shows select all button when select-all checkbox is checked', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()

    expect(screen.getByText('Select all')).toBeInTheDocument()
  })

  it(`doesn't show the select all button when the select-all checkbox is checked if there's only 1 page`, async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({pageCount: 1}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()

    expect(screen.queryByText('Select all')).not.toBeInTheDocument()
  })

  it('shows clear selection button when select-all button is checked', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    expect(screen.getByText('Select all')).toBeInTheDocument()

    const selectAllButton = screen.getByText('Select all')
    await user.click(selectAllButton)

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')

    for (const checkbox of checkboxes) {
      expect(checkbox).toBeChecked()
    }

    expect(screen.getByText('Clear selection')).toBeInTheDocument()
  })

  it('sets selected repos to current page repos after selecting select all and then deselecting a single repo', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    await user.click(selectAllCheckbox)

    const selectAllCheckboxCount = screen.getByTestId('select-all-selected-count')
    expect(selectAllCheckboxCount).toHaveTextContent('6 of 11 selected')

    const selectAllButton = screen.getByText('Select all')
    await user.click(selectAllButton)

    const selectAllButtonCount = screen.getByTestId('select-all-selected-count')
    expect(selectAllButtonCount).toHaveTextContent('11 of 11 selected')

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')

    for (const checkbox of checkboxes) {
      expect(checkbox).toBeChecked()
    }

    const checkbox = checkboxes[2]
    await user.click(checkbox!)
    expect(checkbox).not.toBeChecked()

    // We have 11 total repos and a page count of 2
    const selectedRepoCount = screen.getByTestId('select-all-selected-count')
    expect(selectedRepoCount).toHaveTextContent('5 of 11 selected')
  })

  it('clears all selected checkboxes when clear selection button is clicked', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()

    const selectAllButton = screen.getByText('Select all')
    await user.click(selectAllButton)

    const clearSelectionButton = screen.getByText('Clear selection')
    await user.click(clearSelectionButton)
    expect(selectAllCheckbox).not.toBeChecked()

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')

    for (const checkbox of checkboxes) {
      expect(checkbox).not.toBeChecked()
    }
  })

  it('hides clear selection button when a repository checkbox is unchecked after clicking select all button', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()

    const selectAllButton = screen.getByText('Select all')
    await user.click(selectAllButton)

    expect(screen.getByText('Clear selection')).toBeInTheDocument()

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')

    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).not.toBeChecked()

    expect(screen.queryByText('Clear selection')).not.toBeInTheDocument()
  })

  it('shows apply configuration button when a repo checkbox is checked', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')
    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toBeChecked()

    expect(screen.getByText('Apply configuration')).toBeInTheDocument()
  })

  it('shows dropdown list of actions when apply configuration button is clicked', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')
    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toBeChecked()

    const applyConfigurationButton = screen.getByText('Apply configuration')
    await user.click(applyConfigurationButton)
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByText('High Risk')).toBeInTheDocument()
    expect(within(menu).getByText('Low Risk')).toBeInTheDocument()
    expect(within(menu).getByLabelText('No configuration')).toBeInTheDocument()
  })

  it('dropdown does not shows GHR when it is not in the payload', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(
      customRepositoryTable({
        githubRecommendedConfiguration: {},
      }),
      {routePayload, wrapper},
    )
    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')
    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toBeChecked()

    const applyConfigurationButton = screen.getByText('Apply configuration')
    await user.click(applyConfigurationButton)
    const menu = await screen.findByRole('menu')

    expect(within(menu).getByText('High Risk')).toBeInTheDocument()
    expect(within(menu).queryByText('GitHub recommended')).not.toBeInTheDocument()
  })

  it('applies a configuration to a set of repositories', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')
    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toBeChecked()

    const applyConfigurationButton = screen.getByText('Apply configuration')
    await user.click(applyConfigurationButton)
    const menu = await screen.findByRole('menu')
    const highRiskConfiguration = within(menu).getByText('High Risk')

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/2/repositories')
    await user.click(highRiskConfiguration)

    // the new repo default option should not be shown
    expect(screen.queryByTestId('repo-default-button')).not.toBeInTheDocument()

    const apply = screen.getByText('Apply')
    await user.click(apply)

    // using the equal argument ensures that the params of the API call are exactly equal to what we expect
    // specifically, we should not have `default_for_new_public_repos` and `default_for_new_private_repos`
    // params as we *do not* want to update those settings when we are only applying a config
    expectMockFetchCalledWith(
      '/organizations/github/settings/security_products/configuration/2/repositories',
      {
        repository_ids: [1],
        repository_query: '',
        override_existing_config: true,
        source: 'repos_table',
      },
      'equal',
    )

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalled()
    })
    expect(firstCheckbox).not.toBeChecked()
  })

  it('shows No Configuration option when a repo checkbox is checked', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')
    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toBeChecked()

    const applyConfigurationButton = screen.getByText('Apply configuration')
    await user.click(applyConfigurationButton)
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByText('No configuration')).toBeInTheDocument()
  })

  it('applies no configuration to a set of repositories', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')
    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toBeChecked()

    const applyConfigurationButton = screen.getByText('Apply configuration')
    await user.click(applyConfigurationButton)

    const menu = await screen.findByRole('menu')
    const noConfiguration = within(menu).getByText('No configuration')

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/repositories')
    await user.click(noConfiguration)

    const apply = screen.getByText('No Configuration')
    await user.click(apply)

    expectMockFetchCalledWith('/organizations/github/settings/security_products/configuration/repositories', {
      repository_ids: [1],
    })

    await waitFor(() => {
      expect(firstCheckbox).not.toBeChecked()
    })
  })

  it('applies gh recommended configuration to a set of repos', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/1/repositories')

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')
    const firstCheckbox = checkboxes[0]
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toBeChecked()

    await user.click(screen.getByText('Apply configuration'))

    const menu = await screen.findByRole('menu')
    const githubRecommended = within(menu).getByText('GitHub recommended')

    mockFetch.mockRouteOnce(
      settingsOrgSecurityProductsRepositoriesConfigurationSummaryPath({org: routePayload.organization}),
      {
        public_repo_count: 5,
        private_and_internal_repo_count: 10,
        private_and_internal_repos_count_exceeding_licenses: 0,
        licenses_needed: 2,
        total_repo_count: 15,
        errors: [],
      },
    )

    await user.click(githubRecommended)

    await user.click(screen.getByText('Apply'))

    await waitFor(() => {
      expectMockFetchCalledWith(
        '/organizations/github/settings/security_products/configuration/1/repositories',
        {
          repository_ids: [1],
          repository_query: '',
          override_existing_config: true,
          source: 'repos_table',
        },
        'equal',
      )
    })
  })

  it('renders blank state when there are no repositories', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositoryTable({totalRepositoryCount: 0}), {routePayload, wrapper})

    expect(screen.getByText('This organization has no repositories.')).toBeInTheDocument()
  })

  it('clears all selected checkboxes when no configuration is selected after select all', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    // User clicks the select-all-checkbox
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()

    const selectAllButton = screen.getByText('Select all')
    // User clicks the Select all button
    await user.click(selectAllButton)

    const applyConfigurationButton = screen.getByText('Apply configuration')
    // User clicks the Apply configuration button
    await user.click(applyConfigurationButton)

    const menu = await screen.findByRole('menu')
    const noConfiguration = within(menu).getByText('No configuration')
    // User clicks No configuration
    await user.click(noConfiguration)

    const apply = screen.getByText('No Configuration')
    // User confirms in pop-up dialog
    await user.click(apply)

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')

    for (const checkbox of checkboxes) {
      expect(checkbox).not.toBeChecked()
    }
  })

  it('clears all selected checkboxes when configurations is applied after select all', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(customRepositoryTable({}), {routePayload, wrapper})

    const selectAllCheckbox = await screen.findByTestId('select-all-checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    // User clicks the select-all-checkbox
    await user.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()

    const selectAllButton = screen.getByText('Select all')
    // User clicks the Select all button
    await user.click(selectAllButton)

    const applyConfigurationButton = screen.getByText('Apply configuration')
    // User clicks the Apply configuration button
    await user.click(applyConfigurationButton)

    const menu = await screen.findByRole('menu')
    const highRiskConfiguration = within(menu).getByText('High Risk')
    await user.click(highRiskConfiguration)

    const apply = screen.getByText('Apply')
    // User confirms in pop-up dialog
    await user.click(apply)

    const items = screen.getByTestId('list-view-items')
    const checkboxes = within(items).getAllByRole('checkbox')

    for (const checkbox of checkboxes) {
      expect(checkbox).not.toBeChecked()
    }
  })

  it('renders spinner icon if query is loading', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(customRepositoryTable({isQueryLoading: true}), {routePayload, wrapper})

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})
