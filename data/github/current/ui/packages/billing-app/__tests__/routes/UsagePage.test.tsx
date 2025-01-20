import {render} from '@github-ui/react-core/test-utils'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import {
  getUsageRoutePayload,
  getUsageRoutePayloadWithBudgetAlert,
  getUsageRoutePayloadWithTwoBudgetAlerts,
} from '../../test-utils/mock-data'
import {screen, waitFor} from '@testing-library/react'

import {UsagePage} from '../../routes/'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({business: 'github-inc'}),
}))

describe('Usage', () => {
  it('Renders the Usage page', async () => {
    const date = new Date()
    const month = date.toLocaleDateString('en-US', {timeZone: 'UTC', month: 'short'})
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDate()
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

    const routePayload = getUsageRoutePayload()
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )

    // use find by and await for this since getAllByRole fails with suspense loaded component
    expect(await screen.findByTestId('usage-chart-title')).toHaveTextContent('Metered usage')
    expect(await screen.findByTestId('usage-chart-subtitle')).toHaveTextContent(
      `${month} ${firstDay} - ${month} ${lastDay}, ${date.getFullYear()}`,
    )

    await waitFor(() => expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Metered usage'))
    expect(
      await screen.findByText(/Includes amounts spent for organizations and repositories across all services/i),
    ).toBeInTheDocument()
  })

  it('Renders the Usage page with a budget alert banner', async () => {
    const routePayload = getUsageRoutePayloadWithBudgetAlert()
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )
    await waitFor(() => expect(screen.getByTestId('billing-banner')).toHaveTextContent("You've used 75%"))
    await waitFor(() => expect(screen.getAllByTestId('billing-banner')).toHaveLength(1))
  })

  it('Renders the Usage page without a budget alert banner', async () => {
    const routePayload = getUsageRoutePayload()
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )
    await waitFor(() => expect(screen.queryByTestId('billing-banner')).not.toBeInTheDocument())
  })

  it('Renders the Usage Page with with multiple budget alert banners', async () => {
    const routePayload = getUsageRoutePayloadWithTwoBudgetAlerts()
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )
    await waitFor(() => expect(screen.getAllByTestId('billing-banner')).toHaveLength(2))
  })
})

describe('Usage report button', () => {
  it('Renders usage report button when user email is present', async () => {
    const routePayload = getUsageRoutePayload()
    routePayload.current_user_email = 'test@github.com'
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )

    await waitFor(() =>
      expect(screen.getByTestId('usage-report-dialog-container')).toHaveTextContent('Get usage report'),
    )
  })

  it('Does not render usage report button when userEmail is missing', async () => {
    const routePayload = getUsageRoutePayload()
    routePayload.current_user_email = ''
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )

    await waitFor(() => expect(screen.queryByTestId('usage-report-dialog-container')).not.toBeInTheDocument())
  })

  it('Renders the Usage page with the pricing link', async () => {
    const routePayload = getUsageRoutePayload()
    const environment = createMockEnvironment()
    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )
    expect(await screen.findByText(/View current and past pricing information/i)).toBeInTheDocument()
  })

  it('Renders the Usage page without the pricing link in single-tenant mode', async () => {
    const routePayload = getUsageRoutePayload()
    const environment = createMockEnvironment()

    routePayload.is_single_tenant = true

    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )
    expect(screen.queryByText(/View current and past pricing information/i)).not.toBeInTheDocument()
  })

  it('Renders the Usage page without the pricing link in multi-tenant mode', async () => {
    const routePayload = getUsageRoutePayload()
    const environment = createMockEnvironment()

    routePayload.is_multi_tenant = true

    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsagePage />
      </RelayEnvironmentProvider>,
      {routePayload},
    )
    expect(screen.queryByText(/View current and past pricing information/i)).not.toBeInTheDocument()
  })
})
