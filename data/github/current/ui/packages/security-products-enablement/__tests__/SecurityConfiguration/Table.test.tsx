import {screen, waitFor, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import SecurityConfigurationTable from '../../components/SecurityConfiguration/Table'
import {getOrganizationSettingsSecurityProductsRoutePayload} from '../../test-utils/mock-data'
import {mockFetch} from '@github-ui/mock-fetch'
import OrganizationSettingsSecurityProducts from '../../routes/OrganizationSettingsSecurityProducts'
import {AliveTestProvider} from '@github-ui/use-alive/test-utils'
import App from '../../App'

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

function TestComponent() {
  return (
    <App>
      <AliveTestProvider>
        <OrganizationSettingsSecurityProducts />
      </AliveTestProvider>
    </App>
  )
}

describe('SecurityConfigurationTable', () => {
  it('lists the github recommend config plus the 2 custom security configurations', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.githubRecommendedConfiguration!.enforcement = 'enforced'
    render(
      <App>
        <AliveTestProvider>
          <SecurityConfigurationTable
            githubRecommendedConfiguration={routePayload.githubRecommendedConfiguration}
            customSecurityConfigurations={routePayload.customSecurityConfigurations}
          />
        </AliveTestProvider>
      </App>,
      {routePayload},
    )

    expect(screen.getByText('GitHub recommended')).toBeInTheDocument()
    expect(screen.getByText('Enforced')).toBeInTheDocument()
    expect(screen.getByText('5 repositories')).toBeInTheDocument()
    expect(
      screen.getByText('Suggested settings for Dependabot, secret scanning, and code scanning.'),
    ).toBeInTheDocument()

    expect(screen.getByText('High Risk')).toBeInTheDocument()
    expect(screen.getByText('10 repositories')).toBeInTheDocument()
    expect(screen.getByText('Use for our critical repos')).toBeInTheDocument()

    expect(screen.getByText('Low Risk')).toBeInTheDocument()
    expect(screen.getByText('1 repository')).toBeInTheDocument()
    expect(screen.getByText('Always use this for our empty repos')).toBeInTheDocument()
    expect(screen.queryByText('Apply configuration')).not.toBeInTheDocument()
  })

  it('does not render the GitHub recommended configuration if it is not present', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(
      <App>
        <AliveTestProvider>
          <SecurityConfigurationTable
            githubRecommendedConfiguration={undefined}
            customSecurityConfigurations={routePayload.customSecurityConfigurations}
          />
        </AliveTestProvider>
      </App>,
      {routePayload},
    )

    expect(screen.getByText('High Risk')).toBeInTheDocument()
    expect(screen.getByText('10 repositories')).toBeInTheDocument()
    expect(screen.queryByText('GitHub recommended')).not.toBeInTheDocument()
  })

  it('does not render GitHub Advanced Security label if organization has not purchased GHAS', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.capabilities.ghasPurchased = false
    render(
      <App>
        <SecurityConfigurationTable
          githubRecommendedConfiguration={routePayload.githubRecommendedConfiguration}
          customSecurityConfigurations={routePayload.customSecurityConfigurations}
        />
      </App>,
      {routePayload},
    )

    const element = screen.getByTestId(`configuration-${routePayload.githubRecommendedConfiguration?.id}`)
    expect(element).not.toHaveTextContent('GitHub Advanced Security')
  })

  it('does renders GitHub Advanced Security label if organization has purchased GHAS', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(
      <App>
        <SecurityConfigurationTable
          githubRecommendedConfiguration={routePayload.githubRecommendedConfiguration}
          customSecurityConfigurations={routePayload.customSecurityConfigurations}
        />
      </App>,
      {routePayload},
    )

    const element = screen.getByTestId(`configuration-${routePayload.githubRecommendedConfiguration?.id}`)
    expect(element).toHaveTextContent('GitHub Advanced Security')
  })

  it('renders a confirmation dialog with the new repo default when applying all configurations', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(TestComponent(), {routePayload})

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/apply_confirmation_summary',
      {
        total_repo_count: 2,
        public_repo_count: 1,
        private_and_internal_repo_count: 1,
        licenses_needed: 1,
        errors: [],
      },
    )

    const applyButton = screen.getByTestId('configuration-1-button')
    await user.click(applyButton)

    const allRepositoriesItem = screen.getByText('All repositories')
    await user.click(allRepositoriesItem)

    const confirmationDialog = screen.getByRole('dialog')
    await waitFor(() => {
      expect(confirmationDialog).toHaveTextContent(/1 public repository/)
    })
    expect(confirmationDialog).toHaveTextContent(/1 private and internal repository/)
    expect(confirmationDialog).toHaveTextContent(/1 GitHub Advanced Security license required/)
    expect(confirmationDialog).toHaveTextContent(/Use as default/)

    expect(screen.getByTestId('repo-default-button')).toBeInTheDocument()
  }, 3000)

  it('renders a confirmation dialog without the new repo default when a default is set', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.customSecurityConfigurations[0]!.default_for_new_private_repos = true

    const {user} = render(TestComponent(), {routePayload})

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/apply_confirmation_summary',
      {
        total_repo_count: 2,
        public_repo_count: 1,
        private_and_internal_repo_count: 1,
        licenses_needed: 1,
        errors: [],
      },
    )

    const applyButton = screen.getByTestId('configuration-1-button')
    await user.click(applyButton)

    const allRepositoriesItem = screen.getByText('All repositories')
    await user.click(allRepositoriesItem)

    const confirmationDialog = screen.getByRole('dialog')
    await waitFor(() => {
      expect(confirmationDialog).toHaveTextContent(/1 public repository/)
    })
    expect(confirmationDialog).toHaveTextContent(/1 private and internal repository/)
    expect(confirmationDialog).toHaveTextContent(/1 GitHub Advanced Security license required/)
    expect(confirmationDialog).not.toHaveTextContent(/Use as default/)

    // the new repo default option should not be shown
    expect(screen.queryByTestId('repo-default-button')).not.toBeInTheDocument()
  }, 3000)

  it('renders an apply confirmation failed dialog when applying all configurations returns a 422', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {user} = render(TestComponent(), {routePayload})

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/apply_confirmation_summary',
      {
        total_repo_count: 2,
        public_repo_count: 1,
        private_and_internal_repo_count: 1,
        licenses_needed: 1,
        errors: [],
      },
    )

    const applyButton = screen.getByTestId('configuration-1-button')
    await user.click(applyButton)

    const allRepositoriesItem = screen.getByText('All repositories')
    await user.click(allRepositoriesItem)

    const confirmationDialog = screen.getByRole('dialog')
    await waitFor(() => {
      expect(confirmationDialog).toHaveTextContent(/1 public repository/)
    })

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/configuration/1/repositories',
      {error: 'Another enablement event is in progress. Please try again later.'},
      {
        ok: false,
        status: 422,
      },
    )

    // Click the "Apply" button in the pop-up
    await user.click(within(confirmationDialog).getByRole('button', {name: 'Apply'}))

    const updateFailedDialog = await screen.findByRole('dialog')
    expect(updateFailedDialog).toHaveTextContent(/Unable to apply configuration./)
    expect(updateFailedDialog).toHaveTextContent(/Another enablement event is in progress. Please try again later./)

    // Click the "Okay" button in the pop-up
    await user.click(within(updateFailedDialog).getByRole('button', {name: 'Okay'}))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  }, 3000)
})
