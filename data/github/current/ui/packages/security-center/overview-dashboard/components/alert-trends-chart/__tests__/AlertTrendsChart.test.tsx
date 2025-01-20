import {screen} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {render} from '../../../../test-utils/Render'
import {AlertTrendsChart} from '..'

// Mock chart component to capture the data passed to chartjs, since we don't have shallow renderer
interface ChartData {
  data: {
    datasets: Array<{
      label: string
      data: Array<{
        x: number
        y: number
      }>
    }>
  }
}

jest.mock('react-chartjs-2', () => ({
  Line: (data: ChartData): JSX.Element => <div data-testid="chart-component">{JSON.stringify(data)}</div>,
}))
jest.mock('../../../../common/hooks/use-click-logging', () => ({
  useClickLogging: (): {logClick: jest.Mock} => ({logClick: jest.fn()}),
}))

window.performance.mark = jest.fn()
window.performance.measure = jest.fn()
window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}])
window.performance.clearMarks = jest.fn()
window.performance.clearMeasures = jest.fn()

describe('AlertTrendsChart', () => {
  const query = 'archived:false'
  const startDate = '2022-01-01'
  const endDate = '2023-01-31'

  it('renders the loading spinner', () => {
    render(
      <AlertTrendsChart
        query={query}
        startDate={startDate}
        endDate={endDate}
        isOpenSelected={true}
        grouping="severity"
      />,
    )

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
  })

  describe('when grouping is "severity"', () => {
    it('fetches tools in parallel and displays the data', async () => {
      // Check that the fetch is called 3 times
      // Each call will have separate tool in front of the query string - ['secret-scanning', 'dependabot', 'codeql']
      const mockData = {
        alertTrends: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Low: [{x: 10, y: 4}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Medium: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          High: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Critical: [],
        },
      }

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)

      render(
        <AlertTrendsChart
          query={query}
          startDate={startDate}
          endDate={endDate}
          isOpenSelected={true}
          grouping="severity"
        />,
      )

      const chartComponent = await screen.findByTestId('chart-component')
      const output = JSON.parse(chartComponent.textContent || '{}') as ChartData
      expect(output.data.datasets.length).toEqual(4)
      // Tripling the values, since we are calling the fetch 3 times
      expect(output.data.datasets[0]!.label).toEqual('Low')
      expect(output.data.datasets[0]!.data).toEqual([{x: 10, y: 12}])
      expect(output.data.datasets[1]!.label).toEqual('Medium')
      expect(output.data.datasets[1]!.data).toEqual([])
      expect(output.data.datasets[2]!.label).toEqual('High')
      expect(output.data.datasets[2]!.data).toEqual([])
      expect(output.data.datasets[3]!.label).toEqual('Critical')
      expect(output.data.datasets[3]!.data).toEqual([])
    })

    it('fetches tools specified in query in parallel and displays the data', async () => {
      // Check that the fetch is called 2 times
      // Each call will have separate tool in front of the query string - ['secret-scanning', 'dependabot', 'codeql']
      const mockData = {
        alertTrends: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Low: [{x: 10, y: 4}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Medium: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          High: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Critical: [],
        },
      }

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)

      render(
        <AlertTrendsChart
          query="archived:false tool:secret-scanning,codeql"
          startDate={startDate}
          endDate={endDate}
          isOpenSelected={true}
          grouping="severity"
        />,
      )

      const chartComponent = await screen.findByTestId('chart-component')
      const output = JSON.parse(chartComponent.textContent || '{}') as ChartData
      expect(output.data.datasets.length).toEqual(4)
      // Doubling the values, since we are calling the fetch 2 times
      expect(output.data.datasets[0]!.label).toEqual('Low')
      expect(output.data.datasets[0]!.data).toEqual([{x: 10, y: 8}])
      expect(output.data.datasets[1]!.label).toEqual('Medium')
      expect(output.data.datasets[1]!.data).toEqual([])
      expect(output.data.datasets[2]!.label).toEqual('High')
      expect(output.data.datasets[2]!.data).toEqual([])
      expect(output.data.datasets[3]!.label).toEqual('Critical')
      expect(output.data.datasets[3]!.data).toEqual([])
    })

    it('does not fetch tools excluded in query when running in parallel and displays the data', async () => {
      // Check that the fetch is called 2 times
      // Each call will have separate tool in front of the query string - ['secret-scanning', 'dependabot', 'codeql']
      const mockData = {
        alertTrends: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Low: [{x: 10, y: 4}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Medium: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          High: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Critical: [],
        },
      }

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)

      render(
        <AlertTrendsChart
          query="archived:false -tool:secret-scanning"
          startDate={startDate}
          endDate={endDate}
          isOpenSelected={true}
          grouping="severity"
        />,
      )

      const chartComponent = await screen.findByTestId('chart-component')
      const output = JSON.parse(chartComponent.textContent || '{}') as ChartData
      expect(output.data.datasets.length).toEqual(4)
      // Doubling the values, since we are calling the fetch 2 times
      expect(output.data.datasets[0]!.label).toEqual('Low')
      expect(output.data.datasets[0]!.data).toEqual([{x: 10, y: 8}])
      expect(output.data.datasets[1]!.label).toEqual('Medium')
      expect(output.data.datasets[1]!.data).toEqual([])
      expect(output.data.datasets[2]!.label).toEqual('High')
      expect(output.data.datasets[2]!.data).toEqual([])
      expect(output.data.datasets[3]!.label).toEqual('Critical')
      expect(output.data.datasets[3]!.data).toEqual([])
    })

    it('displays a error state on network error in one of parallel queries', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => {},
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => {},
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => {},
        headers: new Headers(JSON_HEADER),
        ok: false,
      } as Response)

      render(
        <AlertTrendsChart
          query={query}
          startDate={startDate}
          endDate={endDate}
          isOpenSelected={true}
          grouping="severity"
        />,
      )

      expect(await screen.findByTestId('error')).toBeInTheDocument()
    })

    it('displays a no data state when no data is returned with parallel queries', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        json: async () => ({alertTrends: [[], [], [], []]}),
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)

      render(
        <AlertTrendsChart
          query={query}
          startDate={startDate}
          endDate={endDate}
          isOpenSelected={true}
          grouping="severity"
        />,
      )

      // Does not yet test that previous state has been reset
      expect(await screen.findByTestId('no-data')).toBeInTheDocument()
    })

    it('displays no data state when noData is returned from server in parallel queries', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        json: async () => ({noData: 'foo'}),
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)

      render(
        <AlertTrendsChart
          query={query}
          startDate={startDate}
          endDate={endDate}
          isOpenSelected={true}
          grouping="severity"
        />,
      )

      expect(await screen.findByTestId('no-data')).toBeInTheDocument()
    })

    it('displays error state when html is returned from server instead of json in parallel queries', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        text: async () => '<DOCUMENT',
        ok: true,
        headers: new Headers({'Content-Type': 'text/html'}),
      } as Response)

      render(
        <AlertTrendsChart
          query={query}
          startDate={startDate}
          endDate={endDate}
          isOpenSelected={true}
          grouping="severity"
        />,
      )

      expect(await screen.findByTestId('error')).toBeInTheDocument()
    })
  })

  describe('when grouping is "age"', () => {
    it('fetches and displays the data', async () => {
      const mockData = {
        alertTrends: {
          '< 30 days': [{x: 1, y: 2}],
          '31 - 59 days': [{x: 3, y: 4}],
          '60 - 89 days': [{x: 5, y: 6}],
          '90+ days': [{x: 7, y: 8}],
        },
      }

      jest.spyOn(global, 'fetch').mockResolvedValue({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)

      render(
        <AlertTrendsChart query={query} startDate={startDate} endDate={endDate} isOpenSelected={true} grouping="age" />,
      )

      const chartComponent = await screen.findByTestId('chart-component')
      const output = JSON.parse(chartComponent.textContent || '{}') as ChartData

      expect(output.data.datasets.length).toEqual(4)
      expect(output.data.datasets[0]!.label).toEqual('90+ days')
      expect(output.data.datasets[0]!.data).toEqual([{x: 7, y: 24}])
      expect(output.data.datasets[1]!.label).toEqual('60 - 89 days')
      expect(output.data.datasets[1]!.data).toEqual([{x: 5, y: 18}])
      expect(output.data.datasets[2]!.label).toEqual('31 - 59 days')
      expect(output.data.datasets[2]!.data).toEqual([{x: 3, y: 12}])
      expect(output.data.datasets[3]!.label).toEqual('< 30 days')
      expect(output.data.datasets[3]!.data).toEqual([{x: 1, y: 6}])
    })
  })
})
