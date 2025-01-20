import {render, screen} from '@testing-library/react'

import {UsageChart} from '../../../components/usage/UsageChart'

import {RequestState} from '../../../enums'

import {DEFAULT_FILTERS, GROUP_SELECTIONS, MOCK_LINE_ITEMS, PERIOD_SELECTIONS} from '../../../test-utils/mock-data'

describe('UsageChart', () => {
  let filters = DEFAULT_FILTERS

  it('Renders a loading component while usage is being requested', async () => {
    render(
      <UsageChart filters={filters} requestState={RequestState.LOADING} usage={[]} useUsageChartDataEndpoint={false} />,
    )

    expect(await screen.findByTestId('usage-loading-spinner')).toBeVisible()
  })

  it('Renders an error component when the usage request fails', async () => {
    render(
      <UsageChart filters={filters} requestState={RequestState.ERROR} usage={[]} useUsageChartDataEndpoint={false} />,
    )

    expect(await screen.findByTestId('usage-loading-error')).toBeVisible()
  })

  it('Renders a no data component when no usage is returned', async () => {
    render(
      <UsageChart filters={filters} requestState={RequestState.IDLE} usage={[]} useUsageChartDataEndpoint={false} />,
    )

    expect(await screen.findByTestId('no-usage-data')).toBeInTheDocument()
  })

  it('Renders a chart with data', async () => {
    render(
      <UsageChart
        filters={filters}
        requestState={RequestState.IDLE}
        usage={MOCK_LINE_ITEMS}
        useUsageChartDataEndpoint={false}
      />,
    )

    expect(await screen.findByTestId('chart-card')).toBeInTheDocument()
  })

  describe('UsageChart title', () => {
    it('shows all usage when an empty search query is provided', async () => {
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('Metered usage')).toBeInTheDocument()
    })

    it('shows all usage when an incomplete search query is provided', async () => {
      filters = {...DEFAULT_FILTERS, searchQuery: 'org:'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )

      expect(await screen.findByText('Metered usage')).toBeInTheDocument()
    })

    it('shows product usage when product search query is provided', async () => {
      filters = {...DEFAULT_FILTERS, searchQuery: 'product:actions'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('Actions usage')).toBeInTheDocument()
    })

    it('shows sku usage when sku search query is provided', async () => {
      filters = {...DEFAULT_FILTERS, searchQuery: 'sku:actions_linux'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('Actions_linux usage')).toBeInTheDocument()
    })

    it('shows org usage when org search query is provided', async () => {
      filters = {...DEFAULT_FILTERS, searchQuery: 'org:github'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('github usage')).toBeInTheDocument()
    })

    it('shows repo usage when repo search query is provided', async () => {
      filters = {...DEFAULT_FILTERS, searchQuery: 'repo:github/private-server'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('github/private-server usage')).toBeInTheDocument()
    })

    it('shows product AND sku usage when product and SKU search query is provided', async () => {
      filters = {...DEFAULT_FILTERS, searchQuery: 'product:actions sku:actions_linux'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('Actions Actions_linux usage')).toBeInTheDocument()
    })

    it('shows grouped by when group by is provided', async () => {
      filters = {...DEFAULT_FILTERS, group: GROUP_SELECTIONS[2]}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('Metered usage grouped by SKU')).toBeInTheDocument()
    })

    it('shows grouped by when group by is provided AND org search query is specified', async () => {
      filters = {...DEFAULT_FILTERS, group: GROUP_SELECTIONS[1], searchQuery: 'org:github'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('github usage grouped by Product')).toBeInTheDocument()
    })

    it('shows cost center name when cost center search query is specified', async () => {
      filters = {...DEFAULT_FILTERS, searchQuery: 'cost_center:testcenter'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('testcenter usage')).toBeInTheDocument()
    })

    it('shows cost center name with spaces in quotes escaped properly', async () => {
      filters = {...DEFAULT_FILTERS, searchQuery: 'cost_center:"test cost center"'}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      expect(await screen.findByText('test cost center usage')).toBeInTheDocument()
    })
  })

  describe('subtitle', () => {
    it('shows the year when period is yearly', async () => {
      filters = {...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[3]}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      const date = new Date()
      expect(
        await screen.findByText(date.toLocaleDateString('en-US', {timeZone: 'UTC', year: 'numeric'})),
      ).toBeInTheDocument()
    })

    it('shows the month date range when period is monthly', async () => {
      filters = {...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[2]}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      const date = new Date()
      const month = date.toLocaleDateString('en-US', {timeZone: 'UTC', month: 'short'})
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDate()
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

      expect(
        await screen.findByText(`${month} ${firstDay} - ${month} ${lastDay}, ${date.getFullYear()}`),
      ).toBeInTheDocument()
    })

    it('shows the full date when period is daily', async () => {
      filters = {...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[1]}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      const date = new Date()
      const dateString = date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
      expect(await screen.findByText(`${dateString} (All times in UTC)`)).toBeInTheDocument()
    })

    it('shows the year when period is last year', async () => {
      filters = {...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[5]}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      const date = new Date()
      date.setFullYear(date.getFullYear() - 1)
      const dateString = date.toLocaleDateString('en-US', {timeZone: 'UTC', year: 'numeric'})
      expect(await screen.findByText(`${dateString} (All times in UTC)`)).toBeInTheDocument()
    })

    it('shows the month date range when period is last month', async () => {
      filters = {...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[4]}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      const date = new Date()
      date.setMonth(date.getMonth() - 1)
      const month = date.toLocaleDateString('en-US', {timeZone: 'UTC', month: 'short'})
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDate()
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

      expect(
        await screen.findByText(`${month} ${firstDay} - ${month} ${lastDay}, ${date.getFullYear()}`),
      ).toBeInTheDocument()
    })

    it('shows the full date with hour when period is hourly', async () => {
      filters = {...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[0]}
      render(
        <UsageChart
          filters={filters}
          requestState={RequestState.IDLE}
          usage={MOCK_LINE_ITEMS}
          useUsageChartDataEndpoint={false}
        />,
      )
      const date = new Date()
      const dateString = date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
      })
      expect(await screen.findByText(`${dateString} UTC`)).toBeInTheDocument()
    })
  })
})
