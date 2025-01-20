import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import SecurityConfigurationRow from '../../components/SecurityConfiguration/Row'
import {
  defaultAppContext,
  getHighRiskConfiguration,
  getGitHubRecommendedConfiguration,
} from '../../test-utils/mock-data'
import type {OrganizationSecurityConfiguration} from '../../security-products-enablement-types'
import App from '../../App'

let configuration: OrganizationSecurityConfiguration
let ghr_config: OrganizationSecurityConfiguration

beforeEach(function () {
  configuration = getHighRiskConfiguration()
  ghr_config = getGitHubRecommendedConfiguration()
})

function TestComponent() {
  return (
    <App>
      <SecurityConfigurationRow
        configuration={configuration}
        isLast={true}
        confirmConfigApplication={confirmConfigApplicationMock}
      />
    </App>
  )
}

// Mock confirmConfigApplication function
const confirmConfigApplicationMock = jest.fn()

describe('SecurityConfigurationRow', () => {
  it('renders', async () => {
    configuration.default_for_new_private_repos = true
    configuration.enforcement = 'enforced'
    render(TestComponent(), {routePayload: defaultAppContext()})

    expect(screen.getByText('High Risk')).toBeInTheDocument()
    expect(screen.getByText('Enforced')).toBeInTheDocument()
    expect(screen.getByText('10 repositories')).toBeInTheDocument()
    expect(screen.getByText('Use for our critical repos')).toBeInTheDocument()
    expect(screen.getByText('Default for new private and internal repositories.')).toBeInTheDocument()
  })

  it('pluralizes', async () => {
    configuration.repositories_count = 2
    render(TestComponent(), {routePayload: defaultAppContext()})

    expect(screen.getByText('High Risk')).toBeInTheDocument()
    expect(screen.queryByText('Enforced')).not.toBeInTheDocument()
    expect(screen.getByText('2 repositories')).toBeInTheDocument()
    expect(screen.getByText('Use for our critical repos')).toBeInTheDocument()
  })

  it('renders a fallback title if name is blank', async () => {
    configuration.name = ''
    render(TestComponent(), {routePayload: defaultAppContext()})
    expect(screen.getByText('unnamed security configuration')).toBeInTheDocument()
  })

  it('renders GitHub Advanced Security label if ghas is enabled on configuration', async () => {
    render(TestComponent(), {routePayload: defaultAppContext()})
    expect(screen.getByText('GitHub Advanced Security')).toBeInTheDocument()
  })

  it('does not render GitHub Advanced Security label if ghas is disabled on configuration', async () => {
    configuration.enable_ghas = false
    render(TestComponent(), {routePayload: defaultAppContext()})
    expect(screen.queryByText('Enforced')).not.toBeInTheDocument()
  })

  it('renders Apply to dropdown to the GitHub recommended configuration', async () => {
    render(
      <App>
        <SecurityConfigurationRow
          configuration={ghr_config}
          isLast={true}
          isGithubRecommended={true}
          confirmConfigApplication={confirmConfigApplicationMock}
        />
      </App>,
      {routePayload: defaultAppContext()},
    )

    expect(screen.getByText('GitHub recommended')).toBeInTheDocument()
    expect(screen.queryByText('Enforced')).not.toBeInTheDocument()
    expect(screen.getByText('Apply to')).toBeInTheDocument()
  })

  it('does renders Apply to dropdown to non GitHub recommended configuration', async () => {
    render(TestComponent(), {routePayload: defaultAppContext()})

    expect(screen.getByText('High Risk')).toBeInTheDocument()
    expect(screen.getByText('Apply to')).toBeInTheDocument()
  })
})
