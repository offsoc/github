import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor} from '@testing-library/react'
import {OverviewPage} from '../../routes/'
import {
  getOverviewRoutePayload,
  getOverviewRoutePayloadWithEmptyAlert,
  getOverviewRoutePayloadWithMultipleAlerts,
} from '../../test-utils/mock-data'
import {PageContext} from '../../App'

jest.mock('@github-ui/ssr-utils', () => ({
  get ssrSafeLocation() {
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', pathname: '/enterprises/github-inc/billing'}
    })()
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    return {business: 'github-inc'}
  },
}))

describe('Overview page', () => {
  it('Renders the Overview page', async () => {
    const date = new Date()
    const month = date.toLocaleDateString('en-US', {timeZone: 'UTC', month: 'short'})
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDate()
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

    const routePayload = getOverviewRoutePayload()
    render(
      <PageContext.Provider value={{isStafftoolsRoute: false, isEnterpriseRoute: true, isOrganizationRoute: false}}>
        <OverviewPage />
      </PageContext.Provider>,
      {routePayload},
    )

    // use find by and await for this since getAllByRole fails with suspense loaded component
    expect(await screen.findByTestId('usage-chart-subtitle')).toHaveTextContent(
      `${month} ${firstDay} - ${month} ${lastDay}, ${date.getFullYear()}`,
    )

    const headings = await screen.findAllByRole('heading')

    expect(headings[0]).toHaveTextContent('Overview')
    expect(headings[1]).toHaveTextContent('Current metered usage')
    expect(headings[2]).toHaveTextContent('Metered usage')
    expect(headings[4]).toHaveTextContent('Usage by organization')
    expect(headings[5]).toHaveTextContent('Usage by repository')
    expect(headings[6]).toHaveTextContent('Products selector navigation')
    expect(headings[7]).toHaveTextContent('Actions usage')
    expect(headings[8]).toHaveTextContent('Budgets')
  })

  it('Renders the Overview page with a budget alert banner', async () => {
    const routePayload = getOverviewRoutePayload()
    render(<OverviewPage />, {routePayload})
    await waitFor(() => expect(screen.getByTestId('billing-banner')).toHaveTextContent("You've used 100%"))
  })

  it('Renders the Overview page without a budget alert banner', async () => {
    const routePayload = getOverviewRoutePayloadWithEmptyAlert()
    render(<OverviewPage />, {routePayload})
    await waitFor(() => expect(screen.queryByTestId('billing-banner')).not.toBeInTheDocument())
  })

  it('Renders the Overview page with multiple budget alert banners', async () => {
    const routePayload = getOverviewRoutePayloadWithMultipleAlerts()
    render(<OverviewPage />, {routePayload})
    await waitFor(() => expect(screen.getAllByTestId('billing-banner')).toHaveLength(2))
  })

  it('Hides the payment due tile when showPaymentDueTile disabled', async () => {
    const routePayload = getOverviewRoutePayload()
    routePayload.showPaymentDueTile = false
    render(<OverviewPage />, {routePayload})
    await waitFor(() => expect(screen.queryByTestId('auto-pay-enabled-payment-due-card')).not.toBeInTheDocument())
  })

  it('Shows the payment due tile when showPaymentDueTile enabled', async () => {
    const routePayload = getOverviewRoutePayload()
    routePayload.showPaymentDueTile = true
    render(<OverviewPage />, {routePayload})
    expect(await screen.findByTestId('auto-pay-enabled-payment-due-card')).toBeInTheDocument()
  })

  it('Hides the volume spend tile when show_volume_license_spend_tile disabled', async () => {
    const routePayload = getOverviewRoutePayload()
    routePayload.showVolumeLicenseSpendTile = false
    render(<OverviewPage />, {routePayload})
    await waitFor(() => expect(screen.queryByTestId('volume-licenses-card')).not.toBeInTheDocument())
  })

  it('Shows the volume spend tile when show_volume_license_spend_tile enabled', async () => {
    const routePayload = getOverviewRoutePayload()
    routePayload.showVolumeLicenseSpendTile = true
    render(<OverviewPage />, {routePayload})
    expect(await screen.findByTestId('volume-licenses-card-combined')).toBeInTheDocument()
  })

  it('Shows the budgets section for a non-trial customer', async () => {
    const routePayload = getOverviewRoutePayload()
    render(
      <PageContext.Provider value={{isStafftoolsRoute: false, isEnterpriseRoute: true, isOrganizationRoute: false}}>
        <OverviewPage />
      </PageContext.Provider>,
      {routePayload},
    )
    await act(async () => {
      expect(await screen.findByTestId('budgets-section')).toBeInTheDocument()
    })
  })

  it('Does not show the budgets section for a trial customer', async () => {
    const routePayload = getOverviewRoutePayload()
    routePayload.customer.plan = 'enterprise_trial'
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<OverviewPage />, {routePayload})
      await waitFor(() => expect(screen.queryByTestId('budgets-section')).not.toBeInTheDocument())
    })
  })

  it('Hides the U.S. Sales Tax disclaimer when showUsaSalesTaxDisclaimer is disabled', async () => {
    const routePayload = getOverviewRoutePayload()
    routePayload.showUsaSalesTaxDisclaimer = false
    render(<OverviewPage />, {routePayload})
    await waitFor(() => expect(screen.queryByTestId('usa-sales-tax-disclaimer-fineprint')).not.toBeInTheDocument())
  })

  it('Shows the U.S. Sales Tax disclaimer when showUsaSalesTaxDisclaimer is enabled', async () => {
    const routePayload = getOverviewRoutePayload()
    routePayload.showUsaSalesTaxDisclaimer = true
    render(<OverviewPage />, {routePayload})
    expect(await screen.findByTestId('usa-sales-tax-disclaimer-fineprint')).toBeInTheDocument()
  })
})
