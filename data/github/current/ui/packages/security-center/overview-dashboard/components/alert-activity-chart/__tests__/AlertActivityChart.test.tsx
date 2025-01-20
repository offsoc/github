import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {screen} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {render} from '../../../../test-utils/Render'
import {AlertActivityChart} from '..'

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}

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
  Chart: (data: ChartData): JSX.Element => <div data-testid="chart-component">{JSON.stringify(data)}</div>,
}))

describe('AlertActivityChart', () => {
  const query = 'archived:false'
  const startDate = '2022-01-01'
  const endDate = '2023-01-31'

  beforeEach(() => {
    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', false)
  })

  it('renders the component title', () => {
    render(<AlertActivityChart query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Alert activity')).toBeInTheDocument()
  })

  it('fetches tools in parallel and displays the data', async () => {
    // Check that the fetch is called 3 times
    // Each call will have separate tool in front of the query string - ['secret-scanning', 'dependabot', 'codeql']
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            opened: 10,
            closed: 4,
            date: 'Oct 1',
            endDate: 'Oct 31',
          },
          {
            opened: 5,
            closed: 2,
            date: 'Nov 1',
            endDate: 'Nov 30',
          },
        ],
      }),
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            opened: 10,
            closed: 4,
            date: 'Oct 1',
            endDate: 'Oct 31',
          },
          {
            opened: 5,
            closed: 2,
            date: 'Nov 1',
            endDate: 'Nov 30',
          },
        ],
      }),
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            opened: 10,
            closed: 4,
            date: 'Oct 1',
            endDate: 'Oct 31',
          },
          {
            opened: 5,
            closed: 2,
            date: 'Nov 1',
            endDate: 'Nov 30',
          },
        ],
      }),
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)

    render(<AlertActivityChart query={query} startDate={startDate} endDate={endDate} />)

    const chartComponent = await screen.findByTestId('chart-component')
    const output = JSON.parse(chartComponent.textContent || '{}') as ChartData
    expect(output.data.datasets.length).toEqual(3)
    // Tripling the values, since we are calling the fetch 3 times
    expect(output.data.datasets[0]!.label).toEqual('Net alert activity')
    expect(output.data.datasets[0]!.data).toEqual([18, 9])
    expect(output.data.datasets[1]!.label).toEqual('Closed')
    expect(output.data.datasets[1]!.data).toEqual([-12, -6])
    expect(output.data.datasets[2]!.label).toEqual('New')
    expect(output.data.datasets[2]!.data).toEqual([30, 15])
  })

  it('fetches tools and slices in parallel and displays the data when parallelQueriesBy4Slices=true', async () => {
    // Check that the fetch is done over 4 slices for each tool
    for (let i = 0; i < 4; i++) {
      // Check that the fetch is called 3 times
      // Each call will have separate tool in front of the query string - ['secret-scanning', 'dependabot', 'codeql']
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => ({
          data: [
            {
              opened: 10,
              closed: 4,
              date: 'Oct 1',
              endDate: 'Oct 31',
            },
            {
              opened: 5,
              closed: 2,
              date: 'Nov 1',
              endDate: 'Nov 30',
            },
          ],
        }),
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => ({
          data: [
            {
              opened: 10,
              closed: 4,
              date: 'Oct 1',
              endDate: 'Oct 31',
            },
            {
              opened: 5,
              closed: 2,
              date: 'Nov 1',
              endDate: 'Nov 30',
            },
          ],
        }),
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => ({
          data: [
            {
              opened: 10,
              closed: 4,
              date: 'Oct 1',
              endDate: 'Oct 31',
            },
            {
              opened: 5,
              closed: 2,
              date: 'Nov 1',
              endDate: 'Nov 30',
            },
          ],
        }),
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
    }
    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

    render(<AlertActivityChart query={query} startDate={startDate} endDate={endDate} />)

    const chartComponent = await screen.findByTestId('chart-component')
    const output = JSON.parse(chartComponent.textContent || '{}') as ChartData
    expect(output.data.datasets.length).toEqual(3)
    // 4 * 3 the values, since we are calling the fetch 4 * 3 times
    expect(output.data.datasets[0]!.label).toEqual('Net alert activity')
    expect(output.data.datasets[0]!.data).toEqual([6 * 3 * 4, 3 * 3 * 4])
    expect(output.data.datasets[1]!.label).toEqual('Closed')
    expect(output.data.datasets[1]!.data).toEqual([-12 * 4, -6 * 4])
    expect(output.data.datasets[2]!.label).toEqual('New')
    expect(output.data.datasets[2]!.data).toEqual([30 * 4, 15 * 4])
  })

  it('fetches tools specified in query in parallel and displays the data', async () => {
    // Check that the fetch is called 3 times
    // Each call will have separate tool in front of the query string - ['secret-scanning', 'dependabot', 'codeql']
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            opened: 10,
            closed: 4,
            date: 'Oct 1',
            endDate: 'Oct 31',
          },
          {
            opened: 5,
            closed: 2,
            date: 'Nov 1',
            endDate: 'Nov 30',
          },
        ],
      }),
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            opened: 10,
            closed: 4,
            date: 'Oct 1',
            endDate: 'Oct 31',
          },
          {
            opened: 5,
            closed: 2,
            date: 'Nov 1',
            endDate: 'Nov 30',
          },
        ],
      }),
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)

    render(
      <AlertActivityChart query="archived:false tool:secret-scanning,codeql" startDate={startDate} endDate={endDate} />,
    )

    const chartComponent = await screen.findByTestId('chart-component')
    const output = JSON.parse(chartComponent.textContent || '{}') as ChartData
    expect(output.data.datasets.length).toEqual(3)
    // Tripling the values, since we are calling the fetch 3 times
    expect(output.data.datasets[0]!.label).toEqual('Net alert activity')
    expect(output.data.datasets[0]!.data).toEqual([12, 6])
    expect(output.data.datasets[1]!.label).toEqual('Closed')
    expect(output.data.datasets[1]!.data).toEqual([-8, -4])
    expect(output.data.datasets[2]!.label).toEqual('New')
    expect(output.data.datasets[2]!.data).toEqual([20, 10])
  })

  it('does not fetch tools excluded in query when running in parallel and displays the data', async () => {
    // Check that the fetch is called 3 times
    // Each call will have separate tool in front of the query string - ['secret-scanning', 'dependabot', 'codeql']
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            opened: 10,
            closed: 4,
            date: 'Oct 1',
            endDate: 'Oct 31',
          },
          {
            opened: 5,
            closed: 2,
            date: 'Nov 1',
            endDate: 'Nov 30',
          },
        ],
      }),
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            opened: 10,
            closed: 4,
            date: 'Oct 1',
            endDate: 'Oct 31',
          },
          {
            opened: 5,
            closed: 2,
            date: 'Nov 1',
            endDate: 'Nov 30',
          },
        ],
      }),
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)

    render(<AlertActivityChart query="archived:false -tool:secret-scanning" startDate={startDate} endDate={endDate} />)

    const chartComponent = await screen.findByTestId('chart-component')
    const output = JSON.parse(chartComponent.textContent || '{}') as ChartData
    expect(output.data.datasets.length).toEqual(3)
    // Tripling the values, since we are calling the fetch 3 times
    expect(output.data.datasets[0]!.label).toEqual('Net alert activity')
    expect(output.data.datasets[0]!.data).toEqual([12, 6])
    expect(output.data.datasets[1]!.label).toEqual('Closed')
    expect(output.data.datasets[1]!.data).toEqual([-8, -4])
    expect(output.data.datasets[2]!.label).toEqual('New')
    expect(output.data.datasets[2]!.data).toEqual([20, 10])
  })

  it('displays error state on network error in one of parallel queries', async () => {
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

    render(<AlertActivityChart query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByTestId('error')).toBeInTheDocument()
  })

  it('displays error state when html is returned from server instead of json in parallel queries', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: async () => '<DOCUMENT',
      ok: true,
      headers: new Headers({'Content-Type': 'text/html'}),
    } as Response)

    render(<AlertActivityChart query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByTestId('error')).toBeInTheDocument()
  })
})
