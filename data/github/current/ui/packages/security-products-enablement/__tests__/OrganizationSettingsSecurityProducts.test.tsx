import {act, screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import OrganizationSettingsSecurityProducts from '../routes/OrganizationSettingsSecurityProducts'
import {getOrganizationSettingsSecurityProductsRoutePayload} from '../test-utils/mock-data'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {AliveTestProvider, dispatchAliveTestMessage} from '@github-ui/use-alive/test-utils'
import App from '../App'
import {
  SecurityProductAvailability,
  type AppContextValue,
  type OrganizationSettingsSecurityProductsPayload,
} from '../security-products-enablement-types'
import {dismissNoticePath} from '../utils/banner-helper'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  const actual = jest.requireActual('@github-ui/use-navigate')
  return {
    ...actual,
    useNavigate: () => navigateFn,
  }
})
jest.useFakeTimers()

function TestComponent() {
  return (
    <App>
      <AliveTestProvider>
        <OrganizationSettingsSecurityProducts />
      </AliveTestProvider>
    </App>
  )
}

describe('Organization Settings Security Products', () => {
  beforeEach(navigateFn.mockClear)
  it('renders', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {
      routePayload,
    })
    expect(screen.getByTestId('subhead-description')).toBeInTheDocument()
    expect(screen.getByText('New configuration')).toBeInTheDocument()
  })

  it('renders with recommended settings tip', () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {
      search: '?tip=recommended_settings',
      pathname: '/organizations/github/settings/security_products',
      routePayload,
    })

    expect(screen.getByTestId('tip-message').textContent).toBe(
      'Automatically apply our standard settings to Dependabot, code scanning, and secret scanning by selecting  Apply to below.',
    )

    expect(screen.getByTestId('tip-return-link').getAttribute('href')).toBe(
      '/orgs/github/organization_onboarding/advanced_security',
    )
  })

  it('does not render with recommended settings tip if the query string is not present', () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {
      pathname: '/organizations/github/settings/security_products',
      routePayload,
    })

    const tipMessage = screen.queryByTestId('tip-message')
    expect(tipMessage).not.toBeInTheDocument()
  })

  it('has the correct url', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {
      routePayload,
    })
    expect(screen.getByTestId('new-configuration').getAttribute('href')).toEqual(
      '/organizations/github/settings/security_products/configurations/new',
    )
  })
})

describe('banner', () => {
  it('does not render either banner', () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.changesInProgress = {inProgress: false, repositoryStatuses: {}}
    render(<TestComponent />, {routePayload})

    expect(screen.queryByTestId('banner')).not.toBeInTheDocument()
  })

  describe('info banner', () => {
    it('renders info banner', () => {
      const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
      routePayload.showInfoBanner = true
      routePayload.changesInProgress = {inProgress: false, repositoryStatuses: {}}
      render(<TestComponent />, {routePayload})

      expect(screen.getByTestId('banner-info')).toBeInTheDocument()
      expect(screen.getByTestId('banner-text')).toBeInTheDocument()
      expect(screen.getByTestId('banner-dismiss-button')).toBeInTheDocument()
    })

    it('dismisses banner', async () => {
      const notice = 'security_configurations_non_ghas_org_info'
      const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
      routePayload.showInfoBanner = true
      routePayload.changesInProgress = {inProgress: false, repositoryStatuses: {}}
      const {user} = render(<TestComponent />, {routePayload})

      mockFetch.mockRouteOnce(dismissNoticePath({notice}))

      await act(async () => {
        user.click(screen.getByTestId('banner-dismiss-button'))
      })

      await waitFor(() => {
        expectMockFetchCalledTimes(dismissNoticePath({notice}), 1)
        expect(screen.queryByTestId('banner-info')).not.toBeInTheDocument()
      })
    })
  })

  describe('in progress banner', () => {
    it('does not render the in progress banner when nothing is in progress', () => {
      const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
      routePayload.changesInProgress = {inProgress: false, repositoryStatuses: {}}
      render(<TestComponent />, {routePayload})

      expect(screen.queryByTestId('banner-text')).not.toBeInTheDocument()
    })

    it('renders the in progress banner when enablement changes are in progress', () => {
      const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
      routePayload.changesInProgress = {
        inProgress: true,
        type: 'enablement_changes',
        repositoryStatuses: {},
      }
      render(<TestComponent />, {routePayload})

      expect(screen.getByTestId('banner-text')).toHaveTextContent(
        'Another enablement event is in progress. This may take a while and applying or editing configurations will be unavailable until all repositories have been updated.',
      )
    })

    it('renders the in progress banner when configurations are attaching', async () => {
      const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
      render(<TestComponent />, {routePayload})

      expect(screen.getByTestId('banner-text')).toHaveTextContent(
        'Applying configurations to repositories. This may take a while and applying or editing configurations will be unavailable until all repositories have been updated.',
      )
    })
  })
})

describe('blankslate', () => {
  let routePayload: AppContextValue & OrganizationSettingsSecurityProductsPayload
  beforeEach(() => {
    routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
  })

  it('renders BlankSlate with correct props when all security products are unavailable', async () => {
    routePayload.securityProducts.dependency_graph.availability = SecurityProductAvailability.Unavailable
    routePayload.securityProducts.dependabot_alerts.availability = SecurityProductAvailability.Unavailable
    routePayload.securityProducts.dependabot_vea.availability = SecurityProductAvailability.Unavailable
    routePayload.securityProducts.dependency_graph_autosubmit_action.availability =
      SecurityProductAvailability.Unavailable
    routePayload.securityProducts.dependabot_updates.availability = SecurityProductAvailability.Unavailable
    routePayload.securityProducts.code_scanning.availability = SecurityProductAvailability.Unavailable
    routePayload.securityProducts.secret_scanning.availability = SecurityProductAvailability.Unavailable
    routePayload.securityProducts.private_vulnerability_reporting.availability = SecurityProductAvailability.Unavailable

    render(<TestComponent />, {routePayload})

    expect(screen.getByText('No security features installed')).toBeInTheDocument()
    expect(screen.getByText('Learn about installing security features on GitHub Enterprise')).toBeInTheDocument()
    expect(screen.getByTestId('blankslate')).toBeInTheDocument()
    expect(screen.queryByTestId('new-configuration')).not.toBeInTheDocument()
  })

  it('renders the blankslate when no configs are present', async () => {
    routePayload.githubRecommendedConfiguration = undefined
    routePayload.customSecurityConfigurations = []

    render(<TestComponent />, {routePayload})

    expect(screen.getByText('Protect your code with code security configurations')).toBeInTheDocument()
    expect(screen.getByTestId('blankslate')).toBeInTheDocument()
  })

  it("doesn't render the blankslate when there is a custom config and security products are available", async () => {
    routePayload.githubRecommendedConfiguration = undefined

    render(<TestComponent />, {routePayload})

    expect(screen.queryByTestId('blankslate')).not.toBeInTheDocument()
  })

  it("doesn't render the blankslate when there is a GHR config and security products are available", async () => {
    routePayload.customSecurityConfigurations = []

    render(<TestComponent />, {routePayload})

    expect(screen.queryByTestId('blankslate')).not.toBeInTheDocument()
  })
})

describe('live updates', () => {
  test('triggers a debounced refresh call', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {routePayload})

    act(() => {
      dispatchAliveTestMessage('security_configurations:User:1234', {type: 'configuration_updates'})
    })

    jest.runAllTimers() // Trigger the debounced fetch
    expectMockFetchCalledTimes('/organizations/github/settings/security_products/refresh', 1)
  })

  test('updates attachment states in the repos table', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {routePayload})

    act(() => {
      dispatchAliveTestMessage('security_configurations:User:1234', {
        type: 'repository_statuses',
        repositoryStatuses: {
          1: {configuration_id: 10, status: 'attached'},
        },
      })
    })

    const itemMetadata = screen.getAllByTestId('list-view-item-metadata-item')
    // Initial state was attaching, Alive set it to attached, expect metadata to only render the config name:
    expect(itemMetadata[0]).toHaveTextContent('repos config')

    jest.runAllTimers() // Trigger the debounced fetch
    expectMockFetchCalledTimes('/organizations/github/settings/security_products/refresh', 1)
  })

  it('updates changesInProgress state correctly when inProgress is true', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {routePayload})
    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/refresh', {
      inProgress: true,
      type: 'enablement_changes',
    })

    act(() => {
      dispatchAliveTestMessage('security_configurations:User:1234', {
        type: 'configuration_updates',
      })
    })

    jest.runAllTimers() // Trigger the debounced fetch
    await waitFor(() => {
      expect(screen.getByTestId('banner-text')).toHaveTextContent(
        'Another enablement event is in progress. This may take a while and applying or editing configurations will be unavailable until all repositories have been updated.',
      )
    })
  })

  it('updates changesInProgress state correctly when inProgress is false', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {routePayload})
    mockFetch.mockRouteOnce('/organizations/github/settings/security_products/refresh', {inProgress: false})

    act(() => {
      dispatchAliveTestMessage('security_configurations:User:1234', {
        type: 'configuration_updates',
      })
    })

    jest.runAllTimers() // Trigger the debounced fetch
    await waitFor(() => {
      expect(screen.queryByTestId('banner-text')).not.toBeInTheDocument()
    })
  })

  it('updates all repositories information', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(<TestComponent />, {routePayload})

    act(() => {
      dispatchAliveTestMessage('security_configurations:User:1234', {
        type: 'repositories',
        repositories: {
          id: 1,
          name: 'repo1',
          visibility: 'private',
          pushed_at: '2022-01-01',
          licenses_required: 1,
          security_configuration: {
            name: 'repos config',
            status: 'attached',
            repository_security_configuration_id: 10,
            is_github_recommended_configuration: false,
          },
          security_features_enabled: true,
        },
      })
    })

    jest.runAllTimers() // Trigger the debounced fetch
    expectMockFetchCalledTimes('/organizations/github/settings/security_products/refresh', 1)
  })
})
