import {act, screen, waitFor, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {expectMockFetchCalledTimes, expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import SecurityConfiguration from '../routes/SecurityConfiguration'
import {
  getSecurityConfigurationsRoutePayload,
  editSecurityConfigurationsRoutePayload,
  showSecurityConfigurationsRoutePayload,
} from '../test-utils/mock-data'
import {AliveTestProvider} from '@github-ui/use-alive/test-utils'
import {
  SecurityProductAvailability,
  type SecurityConfigurationPayload,
  type AppContextValue,
} from '../security-products-enablement-types'
import App from '../App'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  const actual = jest.requireActual('@github-ui/use-navigate')
  return {
    ...actual,
    useNavigate: () => navigateFn,
  }
})
jest.useFakeTimers()

beforeEach(navigateFn.mockClear)

const scrollToFn = jest.fn()
window.scrollTo = scrollToFn
beforeEach(scrollToFn.mockClear)

function TestComponent() {
  return (
    <App>
      <AliveTestProvider>
        <SecurityConfiguration />
      </AliveTestProvider>
    </App>
  )
}

describe('Security Configuration', () => {
  it('renders with protect new repositories tip', async () => {
    const routePayload = showSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      search: '?tip=protect_new_repositories',
      pathname: '/organizations/github/settings/security_products/configurations/new',
      routePayload: {...routePayload},
    })

    expect(
      screen.getByText(
        /Keep your new repositories code, supply chain, and secrets secure with natively embedded security and unparalleled access to curated security intelligence/,
      ),
    ).toBeInTheDocument()

    expect(screen.getByTestId('tip-return-link').getAttribute('href')).toBe(
      '/orgs/github/organization_onboarding/advanced_security',
    )
  })

  it('renders with code scanning tip', async () => {
    const routePayload = showSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      search: '?tip=code_scanning',
      pathname: '/organizations/github/settings/security_products/configurations/new',
      routePayload: {...routePayload},
    })

    expect(
      screen.getByText(
        /Effortlessly prevent and fix vulnerabilities while you write code without leaving your workflow with GitHub’s native code scanning capabilities./,
      ),
    ).toBeInTheDocument()
  })

  it('renders with secret scanning tip', async () => {
    const routePayload = showSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      search: '?tip=secret_scanning',
      pathname: '/organizations/github/settings/security_products/configurations/new',
      routePayload: {...routePayload},
    })

    expect(
      screen.getByText(
        /Detect and prevent secret leaks across more than 200 token types and your unique custom patterns too, with GitHub’s native secret scanning capabilities./,
      ),
    ).toBeInTheDocument()
  })

  it('renders a new configuration form', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      routePayload,
    })
    expect(screen.getByText('Code security configurations')).toBeInTheDocument()
    expect(screen.getByText('Code security configurations').getAttribute('href')).toEqual(
      '/organizations/github/settings/security_products',
    )
    expect(screen.queryByTestId('subhead-description')).not.toBeInTheDocument()
    expect(screen.getByText('GitHub Advanced Security features')).toBeInTheDocument()
    expect(screen.getByTestId('enable-ghas-dropdown')).toBeInTheDocument()

    expect(screen.getByTestId('info-text')).toHaveTextContent(
      'This configuration counts towards your GitHub Advanced Security license usage on private and internal repositories.',
    )

    const title = screen.getByTestId('form-title')
    expect(title).toHaveTextContent('New configuration')
    expect(screen.getByRole('button', {name: 'Save configuration'})).toBeInTheDocument()

    expect(screen.getByText('Enforce configuration')).toBeInTheDocument()
    expect(screen.getByText('Enforce')).toBeInTheDocument()
  })

  it('renders an edit configuration form', async () => {
    const routePayload = editSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      routePayload,
    })
    expect(screen.getByText('Code security configurations')).toBeInTheDocument()
    expect(screen.getByText('Code security configurations').getAttribute('href')).toEqual(
      '/organizations/github/settings/security_products',
    )
    expect(screen.queryByTestId('subhead-description')).not.toBeInTheDocument()
    expect(screen.getByText('GitHub Advanced Security features')).toBeInTheDocument()
    expect(screen.getByTestId('enable-ghas-dropdown')).toBeInTheDocument()
    const title = screen.getByTestId('form-title')
    expect(title).toHaveTextContent('Edit configuration')
    expect(screen.getByRole('button', {name: 'Update configuration'})).toBeInTheDocument()

    expect(screen.getByLabelText('Name*')).toHaveValue('High Risk')
    expect(screen.getByLabelText('Description*')).toHaveValue('Use for critical repos')
  })

  it('renders the show configuration page', async () => {
    const routePayload = showSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      routePayload,
    })
    expect(screen.getByText('Code security configurations')).toBeInTheDocument()
    expect(screen.getByText('Code security configurations').getAttribute('href')).toEqual(
      '/organizations/github/settings/security_products',
    )
    const title = screen.getByTestId('form-title')
    expect(title).toHaveTextContent('GitHub recommended')

    expect(screen.getByLabelText('Name*')).toHaveValue('GitHub recommended')
    expect(screen.getByLabelText('Description*')).toHaveValue(
      'Suggested settings for Dependabot, secret scanning, and code scanning.',
    )
  })

  it('creates a new configuration', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

    await user.type(screen.getByLabelText('Name*'), 'High Risk Repos')
    await user.type(screen.getByLabelText('Description*'), 'All my repos')

    await user.click(screen.getByRole('button', {name: 'Save configuration'}))

    await waitFor(() => {
      expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
        security_configuration: {
          name: 'High Risk Repos',
          description: 'All my repos',
          enable_ghas: true,
          dependency_graph: 'enabled',
          dependabot_alerts: 'enabled',
          dependabot_security_updates: 'not_set',
          code_scanning: 'enabled',
          secret_scanning: 'enabled',
          secret_scanning_push_protection: 'enabled',
          private_vulnerability_reporting: 'enabled',
        },
        default_for_new_public_repos: false,
        default_for_new_private_repos: false,
        enforcement: 'enforced',
      })
    })

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalled()
    })
  })

  it('creates a new configuration and sets it as default', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

    await user.type(screen.getByLabelText('Name*'), 'High Risk Repos')
    await user.type(screen.getByLabelText('Description*'), 'All my repos')

    await user.click(screen.getByTestId('repo-default-button'))
    await user.click(screen.getByTestId('repo-default-item-public'))

    await user.click(screen.getByRole('button', {name: 'Save configuration'}))

    await waitFor(() => {
      expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
        security_configuration: {
          name: 'High Risk Repos',
          description: 'All my repos',
          enable_ghas: true,
          dependency_graph: 'enabled',
          dependabot_alerts: 'enabled',
          dependabot_security_updates: 'not_set',
          code_scanning: 'enabled',
          secret_scanning: 'enabled',
          secret_scanning_push_protection: 'enabled',
          private_vulnerability_reporting: 'enabled',
        },
        default_for_new_public_repos: true,
        default_for_new_private_repos: false,
      })
    })

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalled()
    })
  })

  it('clicking cancel calls navigate', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

    await user.click(screen.getByRole('button', {name: 'Cancel'}))

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalled()
    })
  })

  it('shows flash banner if request fails', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/configurations',
      {error: 'Not Implemented'},
      {
        ok: false,
      },
    )

    await user.type(screen.getByLabelText('Name*'), 'High Risk Repos')
    await user.type(screen.getByLabelText('Description*'), 'All my repos')

    await user.click(screen.getByTestId('save-configuration'))

    await waitFor(() => {
      expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
        security_configuration: {
          name: 'High Risk Repos',
          description: 'All my repos',
          enable_ghas: true,
          dependency_graph: 'enabled',
          dependabot_alerts: 'enabled',
          dependabot_security_updates: 'not_set',
          code_scanning: 'enabled',
          secret_scanning: 'enabled',
          secret_scanning_push_protection: 'enabled',
          private_vulnerability_reporting: 'enabled',
        },
        default_for_new_public_repos: false,
        default_for_new_private_repos: false,
      })
    })

    expect(scrollToFn).toHaveBeenCalled()
    expect(navigateFn).not.toHaveBeenCalled()
  })

  it('shows flash banner if title and description are blank', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/configurations',
      {errors: {name: ["can't be blank"], description: ["can't be blank"]}},
      {
        ok: false,
      },
    )

    await user.click(screen.getByTestId('save-configuration'))

    await waitFor(() => {
      expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
        security_configuration: {
          name: '',
          description: '',
          enable_ghas: true,
          dependency_graph: 'enabled',
          dependabot_alerts: 'enabled',
          dependabot_security_updates: 'not_set',
          code_scanning: 'enabled',
          secret_scanning: 'enabled',
          secret_scanning_push_protection: 'enabled',
          private_vulnerability_reporting: 'enabled',
        },
        default_for_new_public_repos: false,
        default_for_new_private_repos: false,
      })
    })

    expect(scrollToFn).toHaveBeenCalled()
    expect(navigateFn).not.toHaveBeenCalled()
  })

  it('updates an existing configuration', async () => {
    const routePayload = editSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations/1')

    const nameField = screen.getByLabelText('Name*')
    await user.clear(nameField)
    await user.type(nameField, 'High Risk Repos')

    const descriptionField = screen.getByLabelText('Description*')
    await user.clear(descriptionField)
    await user.type(descriptionField, 'All my repos')

    const enableGHASDropdown = screen.getByTestId('enable-ghas-dropdown')
    await user.click(enableGHASDropdown)
    const excludeOption = screen.getByRole('menuitemradio', {name: 'Exclude'})
    await user.click(excludeOption)

    const mockAPI = mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/configuration/1/repositories_count',
      {
        repo_count: 1,
      },
    )

    await user.click(screen.getByRole('button', {name: 'Update configuration'}))

    await act(() => expect(mockAPI).toHaveBeenCalledTimes(1))

    // Wait for the pop-up to appear
    const updateConfigDialog = await screen.findByRole('dialog')

    await waitFor(() => {
      expect(updateConfigDialog).toHaveTextContent(/This will update 1 repository using this configuration./)
    })

    // Click the "Update configuration" button in the pop-up
    await user.click(within(updateConfigDialog).getByRole('button', {name: 'Update configuration'}))

    await waitFor(() => {
      expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations/1', {
        security_configuration: {
          name: 'High Risk Repos',
          description: 'All my repos',
          enable_ghas: false,
          dependency_graph: 'enabled',
          dependabot_alerts: 'enabled',
          dependabot_security_updates: 'disabled',
          code_scanning: 'disabled',
          secret_scanning: 'disabled',
          secret_scanning_push_protection: 'disabled',
          private_vulnerability_reporting: 'enabled',
        },
        default_for_new_public_repos: false,
        default_for_new_private_repos: false,
      })
    })

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalled()
    })
  })

  it("updates an existing configuration's default from public to public and private", async () => {
    const routePayload = editSecurityConfigurationsRoutePayload({
      defaultForNewPublicRepos: true,
      defaultForNewPrivateRepos: false,
    })
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations/1')

    const repoDefaultButton = screen.getByTestId('repo-default-button')
    expect(repoDefaultButton).toHaveTextContent('Public')

    await user.click(repoDefaultButton)
    await user.click(screen.getByTestId('repo-default-item-all'))
    expect(repoDefaultButton).toHaveTextContent('All repositories')

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/1/repositories_count', {
      repo_count: 1,
    })

    await user.click(screen.getByRole('button', {name: 'Update configuration'}))

    await act(() => {
      expectMockFetchCalledTimes(
        '/organizations/github/settings/security_products/configuration/1/repositories_count',
        1,
      )
    })

    // Wait for the pop-up to appear
    const updateConfigDialog = await screen.findByRole('dialog')

    expect(updateConfigDialog).toBeInTheDocument()

    await user.click(within(updateConfigDialog).getByRole('button', {name: 'Update configuration'}))

    await waitFor(() => {
      expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations/1', {
        security_configuration: {
          name: 'High Risk',
          description: 'Use for critical repos',
          enable_ghas: true,
          dependency_graph: 'enabled',
          dependabot_alerts: 'enabled',
          dependabot_security_updates: 'disabled',
          code_scanning: 'not_set',
          secret_scanning: 'enabled',
          secret_scanning_push_protection: 'enabled',
          private_vulnerability_reporting: 'enabled',
        },
        default_for_new_public_repos: true,
        default_for_new_private_repos: true,
      })
    })

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalled()
    })
  })

  it('shows pop up dialog if attempt to update configuration returns 422 error code', async () => {
    const routePayload = editSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations/1')

    const enableGHASDropdown = screen.getByTestId('enable-ghas-dropdown')
    await user.click(enableGHASDropdown)
    const excludeOption = screen.getByRole('menuitemradio', {name: 'Exclude'})
    await user.click(excludeOption)

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/1/repositories_count', {
      repo_count: 1,
    })

    await user.click(screen.getByRole('button', {name: 'Update configuration'}))

    await act(() => {
      expectMockFetchCalledTimes(
        '/organizations/github/settings/security_products/configuration/1/repositories_count',
        1,
      )
    })

    // Wait for the pop-up to appear
    const updateDialog = await screen.findByRole('dialog')

    expect(updateDialog).toBeInTheDocument()

    // Mock response to return a 422
    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/configurations/1',
      {error: 'Another enablement event is in progress and your changes could not be saved. Please try again later.'},
      {
        ok: false,
        status: 422,
      },
    )

    // Click the "update configuration" button in the pop-up
    await user.click(within(updateDialog).getByRole('button', {name: 'Update configuration'}))

    // Wait for the pop-up to appear
    const updateFailedDialog = await screen.findByRole('dialog')

    expect(updateFailedDialog).toHaveTextContent(/Unable to update High Risk/)
    expect(updateFailedDialog).toHaveTextContent(/Another enablement event is in progress. Please try again later./)

    // Click the "Okay" button in the pop-up
    await user.click(within(updateFailedDialog).getByRole('button', {name: 'Okay'}))
  })

  it('deletes an existing configuration', async () => {
    const routePayload = editSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations/1')

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/1/repositories_count', {
      repo_count: 1,
    })

    await user.click(screen.getByRole('button', {name: 'Delete configuration'}))

    await act(() => {
      expectMockFetchCalledTimes(
        '/organizations/github/settings/security_products/configuration/1/repositories_count',
        1,
      )
    })

    // Wait for the pop-up to appear
    const deleteConfigDialog = await screen.findByRole('dialog')

    expect(deleteConfigDialog).toBeInTheDocument()

    // Click the "Delete configuration" button in the pop-up
    await user.click(within(deleteConfigDialog).getByRole('button', {name: 'Delete configuration'}))

    expectMockFetchCalledTimes('/organizations/github/settings/security_products/configurations/1', 1)

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalled()
    })
  })

  it('shows pop up dialog when attempt to delete an existing configuration returns 422', async () => {
    const routePayload = editSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations/1')

    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configuration/1/repositories_count', {
      repo_count: 1,
    })

    await user.click(screen.getByRole('button', {name: 'Delete configuration'}))

    await act(() => {
      expectMockFetchCalledTimes(
        '/organizations/github/settings/security_products/configuration/1/repositories_count',
        1,
      )
    })

    // Wait for the pop-up to appear
    const deleteConfigDialog = await screen.findByRole('dialog')

    expect(deleteConfigDialog).toBeInTheDocument()

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/configurations/1',
      {error: 'Another enablement event is in progress. Please try again later.'},
      {
        ok: false,
        status: 422,
      },
    )

    // Click the "Delete configuration" button in the pop-up
    await user.click(within(deleteConfigDialog).getByRole('button', {name: 'Delete configuration'}))

    // Wait for the pop-up to appear
    await screen.findByRole('dialog')

    const updateFailedDialog = screen.getByRole('dialog')

    expect(updateFailedDialog).toHaveTextContent(/Unable to update High Risk/)
    expect(updateFailedDialog).toHaveTextContent(/Another enablement event is in progress. Please try again later./)

    // Click the "Okay" button in the pop-up
    await user.click(within(updateFailedDialog).getByRole('button', {name: 'Okay'}))
  }, 3000)

  it('sets GHAS settings as disabled when GHAS is excluded', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    const title = screen.getByTestId('form-title')
    expect(title).toHaveTextContent('New configuration')
    expect(screen.getByRole('button', {name: 'Save configuration'})).toBeInTheDocument()

    expect(screen.getByTestId('dependabotAlertsVEA')).toHaveTextContent('Enabled')
    expect(screen.getByTestId('codeScanning')).toHaveTextContent('Enabled')
    expect(screen.getByTestId('secretScanning')).toHaveTextContent('Enabled')

    const enableGhasDropdown = screen.getByTestId('enable-ghas-dropdown')
    await user.click(enableGhasDropdown)

    const disableGhas = screen.getByRole('menuitemradio', {name: 'Exclude'})
    await user.click(disableGhas)

    expect(screen.getByTestId('dependabotAlertsVEA')).toHaveTextContent('Disabled')
    expect(screen.getByTestId('codeScanning')).toHaveTextContent('Disabled')
    expect(screen.getByTestId('secretScanning')).toHaveTextContent('Disabled')
  })

  it('sets GHAS as included when any ghas setting is enabled', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    const {user} = render(<TestComponent />, {
      routePayload,
    })

    const dependabotAlerts = screen.getByTestId('dependabotAlerts')
    const vea = screen.getByTestId('dependabotAlertsVEA')
    const secretScanning = screen.getByTestId('secretScanning')
    const enableGhasDropdown = screen.getByTestId('enable-ghas-dropdown')

    await user.click(enableGhasDropdown)
    await user.click(screen.getByRole('menuitemradio', {name: 'Exclude'}))

    expect(dependabotAlerts).toHaveTextContent('Enabled')
    expect(vea).toHaveTextContent('Disabled')
    expect(secretScanning).toHaveTextContent('Disabled')
    expect(enableGhasDropdown).toHaveTextContent('Exclude')

    await user.click(secretScanning)
    await user.click(screen.getByRole('menuitemradio', {name: 'Enabled'}))

    expect(dependabotAlerts).toHaveTextContent('Enabled')
    expect(vea).toHaveTextContent('Enabled')
    expect(secretScanning).toHaveTextContent('Enabled')
    expect(enableGhasDropdown).toHaveTextContent('Include')
  })

  it('renders the default dropdown when creating a new configuration', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      routePayload,
    })

    const title = screen.getByTestId('form-title')
    expect(title).toHaveTextContent('New configuration')
    expect(screen.getByRole('button', {name: 'Save configuration'})).toBeInTheDocument()

    expect(screen.getByTestId('repo-default-button')).toBeInTheDocument()
  })

  it('renders the default dropdown when editing a configuration', async () => {
    const routePayload = editSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      routePayload,
    })

    const title = screen.getByTestId('form-title')
    expect(title).toHaveTextContent('Edit configuration')
    expect(screen.getByRole('button', {name: 'Update configuration'})).toBeInTheDocument()

    expect(screen.getByTestId('repo-default-button')).toBeInTheDocument()
  })

  it('renders the default dropdown when viewing a configuration', async () => {
    const routePayload = showSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {
      routePayload,
    })

    const title = screen.getByTestId('form-title')
    expect(title).toHaveTextContent('GitHub recommended')

    expect(screen.getByTestId('repo-default-button')).toBeInTheDocument()
  })

  it('renders the default dropdown without public repos', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    routePayload.capabilities.hasPublicRepos = false
    render(<TestComponent />, {
      routePayload,
    })

    const title = screen.getByTestId('form-title')
    expect(title).toHaveTextContent('New configuration')
    expect(screen.getByRole('button', {name: 'Save configuration'})).toBeInTheDocument()

    expect(screen.getByTestId('repo-default-button')).toBeInTheDocument()
  })

  it('renders Private Vulnerability Reporting when available', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()

    render(<TestComponent />, {
      routePayload,
    })

    expect(screen.getByText('Private vulnerability reporting', {exact: false})).toBeInTheDocument()

    expect(
      screen.getByText(
        /Allow your community to privately report potential security vulnerabilities in public repositories/,
      ),
    ).toBeInTheDocument()
  })

  it('does not render a security product when unavailable', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    routePayload.securityProducts.private_vulnerability_reporting.availability = SecurityProductAvailability.Unavailable
    render(<TestComponent />, {
      routePayload,
    })

    expect(screen.queryByText('Private vulnerability reporting', {exact: false})).not.toBeInTheDocument()

    expect(
      screen.queryByText(
        /Allow your community to privately report potential security vulnerabilities in public repositories/,
      ),
    ).not.toBeInTheDocument()
  })

  it('does not render the enablement in progress banner when creating a new configuration', async () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    render(<TestComponent />, {routePayload})

    expect(screen.queryByTestId('in-progress-banner-text')).not.toBeInTheDocument()
  })

  describe('In progress banner', () => {
    it('renders the enablement in progress banner when editing a configuration', async () => {
      const routePayload = editSecurityConfigurationsRoutePayload()
      routePayload.changesInProgress = {inProgress: true, type: 'enablement_changes', repositoryStatuses: {}}
      render(<TestComponent />, {routePayload})

      expect(screen.getByTestId('banner-text')).toHaveTextContent(
        "Another enablement event is in progress. Modifying or deleting this configuration is not available until it's finished.",
      )
    })

    it('renders the enablement in progress banner when viewing a configuration', async () => {
      const routePayload = showSecurityConfigurationsRoutePayload()
      routePayload.changesInProgress = {inProgress: true, type: 'enablement_changes', repositoryStatuses: {}}

      render(<TestComponent />, {routePayload})

      expect(screen.getByTestId('banner-text')).toHaveTextContent(
        "Another enablement event is in progress. Modifying or deleting this configuration is not available until it's finished.",
      )
    })

    it('renders the correct text when configs are being applied for security configurations page', async () => {
      const routePayload = editSecurityConfigurationsRoutePayload()
      routePayload.changesInProgress = {inProgress: true, type: 'applying_configuration', repositoryStatuses: {}}

      render(<TestComponent />, {routePayload})

      expect(screen.getByTestId('banner-text')).toHaveTextContent(
        "Another enablement event is in progress. Modifying or deleting this configuration is not available until it's finished.",
      )
    })
  })

  describe('New security configuration form interactivity - child behavior', () => {
    it("doesn't update a child that is set as 'Disabled' when parent is updated", async () => {
      const routePayload = getSecurityConfigurationsRoutePayload()
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      const pushProtection = screen.getByTestId('secretScanningPushProtection')
      const secretScanning = screen.getByTestId('secretScanning')

      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(pushProtection).toHaveTextContent('Disabled')

      // Parent goes from enabled to disabled
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(pushProtection).toHaveTextContent('Disabled')

      // Parent goes from disabled to enabled
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Enabled'}))

      expect(pushProtection).toHaveTextContent('Disabled')

      // Parent goes from enabled to not set
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      expect(pushProtection).toHaveTextContent('Disabled')
    })

    it("updates a child that is set as 'Enabled' when parent is updated", async () => {
      const routePayload = getSecurityConfigurationsRoutePayload()
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      const pushProtection = screen.getByTestId('secretScanningPushProtection')
      const secretScanning = screen.getByTestId('secretScanning')

      expect(secretScanning).toHaveTextContent('Enabled')
      expect(pushProtection).toHaveTextContent('Enabled')

      // Parent goes from enabled to disabled
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(pushProtection).toHaveTextContent('Disabled')

      // Reset child & parent to enabled
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Enabled'}))

      expect(secretScanning).toHaveTextContent('Enabled')

      // Parent goes from enabled to not set
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      expect(pushProtection).toHaveTextContent('Not set')
    })

    it("updates a child that is set as 'Not set' when parent is updated", async () => {
      const routePayload = getSecurityConfigurationsRoutePayload()
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      const pushProtection = screen.getByTestId('secretScanningPushProtection')
      const secretScanning = screen.getByTestId('secretScanning')

      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      expect(secretScanning).toHaveTextContent('Enabled')
      expect(pushProtection).toHaveTextContent('Not set')

      // Parent goes from enabled to not set
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      expect(pushProtection).toHaveTextContent('Not set')

      // Reset parent to enabled & child to not set
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Enabled'}))
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      // Parent goes from enabled to disabled
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(pushProtection).toHaveTextContent('Disabled')

      // Reset parent to not set & child to not set
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      // Parent goes from not set to disabled
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(pushProtection).toHaveTextContent('Disabled')
    })

    it('when GHAS is disabled, it does not enable VEA with Dependabot Alerts', async () => {
      const routePayload = getSecurityConfigurationsRoutePayload()
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      const dependabotAlerts = screen.getByTestId('dependabotAlerts')
      const vea = screen.getByTestId('dependabotAlertsVEA')
      const enableGhasDropdown = screen.getByTestId('enable-ghas-dropdown')

      await user.click(dependabotAlerts)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      await user.click(enableGhasDropdown)
      await user.click(screen.getByRole('menuitemradio', {name: 'Exclude'}))

      expect(dependabotAlerts).toHaveTextContent('Disabled')
      expect(vea).toHaveTextContent('Disabled')
      expect(enableGhasDropdown).toHaveTextContent('Exclude')

      await user.click(dependabotAlerts)
      await user.click(screen.getByRole('menuitemradio', {name: 'Enabled'}))

      expect(dependabotAlerts).toHaveTextContent('Enabled')
      expect(vea).toHaveTextContent('Disabled')
      expect(enableGhasDropdown).toHaveTextContent('Exclude')
    })
  })

  describe('New security configuration form interactivity - parent behavior', () => {
    it("doesn't update a parent that is set as 'Enabled' when a child is updated", async () => {
      const routePayload = getSecurityConfigurationsRoutePayload()
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      const pushProtection = screen.getByTestId('secretScanningPushProtection')
      const secretScanning = screen.getByTestId('secretScanning')

      expect(secretScanning).toHaveTextContent('Enabled')
      expect(pushProtection).toHaveTextContent('Enabled')

      // Child goes from enabled to disabled
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(secretScanning).toHaveTextContent('Enabled')

      // Child goes from disabled to enabled
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Enabled'}))

      expect(secretScanning).toHaveTextContent('Enabled')
      expect(pushProtection).toHaveTextContent('Enabled')

      // Child goes from enabled to not set
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      expect(secretScanning).toHaveTextContent('Enabled')
    })

    it("updates a parent that is set as 'Disabled' when a child is updated", async () => {
      const routePayload = getSecurityConfigurationsRoutePayload()
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      const pushProtection = screen.getByTestId('secretScanningPushProtection')
      const secretScanning = screen.getByTestId('secretScanning')

      // Set parent and child to disabled
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(secretScanning).toHaveTextContent('Disabled')
      expect(pushProtection).toHaveTextContent('Disabled')

      // Child goes from disabled to enabled
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Enabled'}))

      expect(secretScanning).toHaveTextContent('Enabled')
      expect(pushProtection).toHaveTextContent('Enabled')

      // Reset parent and child to disabled
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(secretScanning).toHaveTextContent('Disabled')
      expect(pushProtection).toHaveTextContent('Disabled')

      // Child goes from disabled to not set
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      expect(secretScanning).toHaveTextContent('Not set')
      expect(pushProtection).toHaveTextContent('Not set')
    })

    it("updates a parent that is set as 'Not set' when a child is updated", async () => {
      const routePayload = getSecurityConfigurationsRoutePayload()
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      const pushProtection = screen.getByTestId('secretScanningPushProtection')
      const secretScanning = screen.getByTestId('secretScanning')

      // Set parent and child to not set
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      expect(secretScanning).toHaveTextContent('Not set')
      expect(pushProtection).toHaveTextContent('Not set')

      // Child goes from not set to enabled
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Enabled'}))

      expect(secretScanning).toHaveTextContent('Enabled')
      expect(pushProtection).toHaveTextContent('Enabled')

      // Reset parent and child to not set
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Not set'}))

      expect(secretScanning).toHaveTextContent('Not set')
      expect(pushProtection).toHaveTextContent('Not set')

      // Child goes from not set to disabled
      await user.click(pushProtection)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(secretScanning).toHaveTextContent('Not set')
      expect(pushProtection).toHaveTextContent('Disabled')
    })
  })

  describe('VEA interactivity', () => {
    const routePayload = getSecurityConfigurationsRoutePayload()
    const testTransitions = [
      ['Enabled', 'Disabled'],
      ['Enabled', 'Not set'],
      ['Disabled', 'Enabled'],
      ['Disabled', 'Not set'],
      ['Not set', 'Enabled'],
      ['Not set', 'Disabled'],
    ]
    for (const [oldState, newState] of testTransitions) {
      it(`when GHAS is enabled and Dependabot Alerts goes from ${oldState} to ${newState} VEA is ${newState}`, async () => {
        const {user} = render(<TestComponent />, {
          routePayload,
        })

        const dependabotAlerts = screen.getByTestId('dependabotAlerts')
        const vea = screen.getByTestId('dependabotAlertsVEA')
        const enableGhasDropdown = screen.getByTestId('enable-ghas-dropdown')
        expect(enableGhasDropdown).toHaveTextContent('Include')

        await user.click(dependabotAlerts)
        await user.click(screen.getByRole('menuitemradio', {name: oldState}))

        await user.click(dependabotAlerts)
        await user.click(screen.getByRole('menuitemradio', {name: newState}))
        expect(dependabotAlerts).toHaveTextContent(newState!)
        expect(vea).toHaveTextContent(newState!)
      })

      it(`when GHAS is disabled and Dependabot Alerts goes from ${oldState} to ${newState} VEA is Disable`, async () => {
        const {user} = render(<TestComponent />, {
          routePayload,
        })

        const dependabotAlerts = screen.getByTestId('dependabotAlerts')
        const vea = screen.getByTestId('dependabotAlertsVEA')

        const enableGhasDropdown = screen.getByTestId('enable-ghas-dropdown')
        await user.click(enableGhasDropdown)
        await user.click(screen.getByRole('menuitemradio', {name: 'Exclude'}))

        await user.click(dependabotAlerts)
        await user.click(screen.getByRole('menuitemradio', {name: oldState}))

        await user.click(dependabotAlerts)
        await user.click(screen.getByRole('menuitemradio', {name: newState}))
        expect(dependabotAlerts).toHaveTextContent(newState!)
        expect(vea).toHaveTextContent('Disabled')
      })
    }
  })

  describe('on a non-ghas org with public repos having GHAS', () => {
    let routePayload: AppContextValue & SecurityConfigurationPayload
    beforeEach(() => {
      routePayload = getSecurityConfigurationsRoutePayload()
      routePayload.capabilities.ghasPurchased = false
    })

    it('renders a new configuration form without the GHAS setting', async () => {
      render(<TestComponent />, {
        routePayload,
      })

      expect(screen.queryByLabelText('GitHub Advanced Security features')).not.toBeInTheDocument()
      expect(screen.queryByTestId('enable-ghas-dropdown')).not.toBeInTheDocument()

      expect(screen.getByTestId('info-text')).toHaveTextContent(
        'This configuration enables GitHub Advanced Security features. Applying it to private repositories will only enable free security features.',
      )

      const title = screen.getByTestId('form-title')
      expect(title).toHaveTextContent('New configuration')
      expect(screen.getByRole('button', {name: 'Save configuration'})).toBeInTheDocument()
    })

    it('renders a new configuration form and hides the GHAS message when GHAS is not being used', async () => {
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      // verify GHAS message is shown
      expect(screen.getByTestId('info-text')).toBeInTheDocument()

      // disable all settings that use GHAS
      const dependabotAlerts = screen.getByTestId('dependabotAlerts')
      await user.click(dependabotAlerts)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      const secretScanning = screen.getByTestId('secretScanning')
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      const codeScanning = screen.getByTestId('codeScanning')
      await user.click(codeScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      // verify GHAS message isn't shown
      expect(screen.queryByTestId('info-text')).not.toBeInTheDocument()
    })

    it('renders a new configuration form and hides the VEA section', async () => {
      render(<TestComponent />, {
        routePayload,
      })
      const title = screen.getByTestId('form-title')
      expect(title).toHaveTextContent('New configuration')
      expect(screen.queryByTestId('dependabotAlertsVEA')).not.toBeInTheDocument()
    })

    it('creates a new configuration', async () => {
      const {user} = render(<TestComponent />, {
        routePayload,
      })
      expect(screen.queryByLabelText('GitHub Advanced Security features')).not.toBeInTheDocument()
      expect(screen.queryByTestId('enable-ghas-dropdown')).not.toBeInTheDocument()

      mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

      await user.type(screen.getByLabelText('Name*'), 'High Risk Repos')
      await user.type(screen.getByLabelText('Description*'), 'All my repos')

      await user.click(screen.getByRole('button', {name: 'Save configuration'}))

      await waitFor(() => {
        expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
          security_configuration: {
            name: 'High Risk Repos',
            description: 'All my repos',
            enable_ghas: true, // This is right! We still want to enable GHAS features for public repos
            dependency_graph: 'enabled',
            dependabot_alerts: 'enabled',
            dependabot_security_updates: 'not_set',
            code_scanning: 'enabled',
            secret_scanning: 'enabled',
            secret_scanning_push_protection: 'enabled',
            private_vulnerability_reporting: 'enabled',
          },
          default_for_new_public_repos: false,
          default_for_new_private_repos: false,
        })
      })

      await waitFor(() => {
        expect(navigateFn).toHaveBeenCalled()
      })
    })

    it('creates a new configuration without unavailable security products', async () => {
      routePayload.securityProducts.dependency_graph_autosubmit_action.availability =
        SecurityProductAvailability.Unavailable
      routePayload.securityProducts.secret_scanning.availability = SecurityProductAvailability.Unavailable
      routePayload.securityProducts.dependabot_alerts.availability = SecurityProductAvailability.Unavailable
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      expect(screen.queryByLabelText('GitHub Advanced Security features')).not.toBeInTheDocument()
      expect(screen.queryByTestId('enable-ghas-dropdown')).not.toBeInTheDocument()

      mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

      await user.type(screen.getByLabelText('Name*'), 'High Risk Repos')
      await user.type(screen.getByLabelText('Description*'), 'All my repos')

      await user.click(screen.getByRole('button', {name: 'Save configuration'}))

      await waitFor(() => {
        expectMockFetchCalledWith(
          '/organizations/github/settings/security_products/configurations',
          {
            security_configuration: {
              name: 'High Risk Repos',
              description: 'All my repos',
              enable_ghas: true, // This is right! We still want to enable GHAS features for public repos
              dependency_graph: 'enabled',
              dependabot_security_updates: 'not_set',
              code_scanning: 'enabled',
              private_vulnerability_reporting: 'enabled',
            },
            default_for_new_public_repos: false,
            default_for_new_private_repos: false,
            enforcement: 'enforced',
          },
          'equal',
        )
      })

      await waitFor(() => {
        expect(navigateFn).toHaveBeenCalled()
      })
    })

    it('creates a new configuration that disables ghas when code scanning and secret scanning are disabled', async () => {
      const {user} = render(<TestComponent />, {
        routePayload,
      })
      expect(screen.queryByLabelText('GitHub Advanced Security features')).not.toBeInTheDocument()
      expect(screen.queryByTestId('enable-ghas-dropdown')).not.toBeInTheDocument()

      mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

      await user.type(screen.getByLabelText('Name*'), 'High Risk Repos')
      await user.type(screen.getByLabelText('Description*'), 'All my repos')

      const secretScanning = screen.getByTestId('secretScanning')
      await user.click(secretScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(secretScanning).toHaveTextContent('Disabled')

      const codeScanning = screen.getByTestId('codeScanning')
      await user.click(codeScanning)
      await user.click(screen.getByRole('menuitemradio', {name: 'Disabled'}))

      expect(codeScanning).toHaveTextContent('Disabled')

      await user.click(screen.getByRole('button', {name: 'Save configuration'}))

      await waitFor(() => {
        expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
          security_configuration: {
            name: 'High Risk Repos',
            description: 'All my repos',
            enable_ghas: false,
            dependency_graph: 'enabled',
            dependabot_alerts: 'enabled',
            dependabot_security_updates: 'not_set',
            code_scanning: 'disabled',
            secret_scanning: 'disabled',
            secret_scanning_push_protection: 'disabled',
            private_vulnerability_reporting: 'enabled',
          },
          default_for_new_public_repos: false,
          default_for_new_private_repos: false,
        })
      })

      await waitFor(() => {
        expect(navigateFn).toHaveBeenCalled()
      })
    })

    it('creates a new configuration and show tip with flash message', async () => {
      const {user} = render(<TestComponent />, {
        search: '?tip=protect_new_repositories',
        pathname: '/organizations/github/settings/security_products/configurations/view',
        routePayload,
      })
      expect(screen.queryByLabelText('GitHub Advanced Security features')).not.toBeInTheDocument()
      expect(screen.queryByTestId('enable-ghas-dropdown')).not.toBeInTheDocument()

      mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

      await user.type(screen.getByLabelText('Name*'), 'High Risk Repos')
      await user.type(screen.getByLabelText('Description*'), 'All my repos')

      await user.click(screen.getByRole('button', {name: 'Save configuration'}))

      await waitFor(() => {
        expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
          security_configuration: {
            name: 'High Risk Repos',
            description: 'All my repos',
            enable_ghas: true,
            dependency_graph: 'enabled',
            dependabot_alerts: 'enabled',
            dependabot_security_updates: 'not_set',
            code_scanning: 'enabled',
            secret_scanning: 'enabled',
            secret_scanning_push_protection: 'enabled',
            private_vulnerability_reporting: 'enabled',
          },
          default_for_new_public_repos: false,
          default_for_new_private_repos: false,
        })
      })

      await waitFor(() => {
        expect(navigateFn).toHaveBeenCalledWith(
          '/organizations/github/settings/security_products/configurations/view?tip=protect_new_repositories',
          {state: {flash: {message: 'High Risk Repos configuration successfully created.', variant: 'success'}}},
        )
      })
    })

    it('renders an edit configuration form', async () => {
      routePayload = editSecurityConfigurationsRoutePayload()
      routePayload.capabilities.ghasPurchased = false

      render(<TestComponent />, {
        routePayload,
      })

      expect(screen.queryByLabelText('GitHub Advanced Security features')).not.toBeInTheDocument()
      expect(screen.queryByTestId('enable-ghas-dropdown')).not.toBeInTheDocument()
      expect(screen.getByTestId('info-text')).toBeInTheDocument()

      const title = screen.getByTestId('form-title')
      expect(title).toHaveTextContent('Edit configuration')
      expect(screen.getByRole('button', {name: 'Update configuration'})).toBeInTheDocument()

      expect(screen.getByLabelText('Name*')).toHaveValue('High Risk')
      expect(screen.getByLabelText('Description*')).toHaveValue('Use for critical repos')
    })

    describe('without public repos having GHAS', () => {
      it('creates a non-GHAS new configuration', async () => {
        routePayload.capabilities.ghasFreeForPublicRepos = false
        routePayload.securityProducts.secret_scanning.availability = SecurityProductAvailability.Unavailable
        routePayload.securityProducts.code_scanning.availability = SecurityProductAvailability.Unavailable
        routePayload.securityProducts.private_vulnerability_reporting.availability =
          SecurityProductAvailability.Unavailable

        const {user} = render(<TestComponent />, {
          routePayload,
        })
        expect(screen.queryByLabelText('GitHub Advanced Security features')).not.toBeInTheDocument()
        expect(screen.queryByTestId('enable-ghas-dropdown')).not.toBeInTheDocument()

        mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

        await user.type(screen.getByLabelText('Name*'), 'High Risk Repos')
        await user.type(screen.getByLabelText('Description*'), 'All my repos')

        await user.click(screen.getByRole('button', {name: 'Save configuration'}))

        await waitFor(() => {
          expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
            security_configuration: {
              name: 'High Risk Repos',
              description: 'All my repos',
              enable_ghas: false,
              dependency_graph: 'enabled',
              dependabot_alerts: 'enabled',
              dependabot_security_updates: 'not_set',
            },
            default_for_new_public_repos: false,
            default_for_new_private_repos: false,
          })
        })

        await waitFor(() => {
          expect(navigateFn).toHaveBeenCalled()
        })
      })
    })
  })

  describe('Feature-specific behaviour - Automatic depencency submission', () => {
    let routePayload: SecurityConfigurationPayload
    beforeEach(() => {
      routePayload = getSecurityConfigurationsRoutePayload()
    })

    it('creates a new configuration', async () => {
      const {user} = render(<TestComponent />, {
        routePayload,
      })

      mockFetch.mockRouteOnce('/organizations/github/settings/security_products/configurations')

      await user.type(screen.getByLabelText('Name*'), 'Automatic dependency submission')
      await user.type(screen.getByLabelText('Description*'), 'Maven build-time analysis')

      await user.click(screen.getByTestId('dependencyGraphAutosubmitAction'))
      const label = await screen.findByLabelText('Enabled for labeled runners')
      await user.click(label)

      await user.click(screen.getByRole('button', {name: 'Save configuration'}))

      await waitFor(() => {
        expectMockFetchCalledWith('/organizations/github/settings/security_products/configurations', {
          security_configuration: {
            name: 'Automatic dependency submission',
            description: 'Maven build-time analysis',
            enable_ghas: true,
            dependency_graph: 'enabled',
            dependency_graph_autosubmit_action: 'enabled',
            dependency_graph_autosubmit_action_options: {labeled_runners: true},
            dependabot_alerts: 'enabled',
            dependabot_security_updates: 'not_set',
            code_scanning: 'enabled',
            secret_scanning: 'enabled',
            secret_scanning_push_protection: 'enabled',
            private_vulnerability_reporting: 'enabled',
          },
          default_for_new_public_repos: false,
          default_for_new_private_repos: false,
          enforcement: 'enforced',
        })
      })

      await waitFor(() => {
        expect(navigateFn).toHaveBeenCalled()
      })
    })
  })
})
