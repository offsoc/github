import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import {AlertTrendsChartV2} from '../AlertTrendsChartV2'
import {useAlertTrendsData, useAlertTrendsQuery, useTotalAlertCountData} from '../use-alert-trends-query'

afterEach(() => {
  jest.clearAllMocks()
})

window.performance.mark = jest.fn()
window.performance.measure = jest.fn()
window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}])
window.performance.clearMarks = jest.fn()
window.performance.clearMeasures = jest.fn()

jest.mock('../use-alert-trends-query')
function mockUseAlertTrendsQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useAlertTrendsQuery as jest.Mock).mockReturnValue(
    // Mock response from 3 parallel fetches within useQueries()
    new Array(3).fill({
      isSuccess: true,
      isPending: false,
      isError: false,
      data: {},
      ...result,
    }),
  )
}
function mockUseAlertTrendsData(): void {
  ;(useAlertTrendsData as jest.Mock).mockReturnValue(
    new Map([
      ['Low', [{x: '2024-01-10', y: 1}]],
      ['Medium', [{x: '2024-01-10', y: 2}]],
      ['High', [{x: '2024-01-10', y: 3}]],
      ['Critical', [{x: '2024-01-10', y: 4}]],
    ]),
  )
}
function mockUseAlertTrendsDataEmpty(): void {
  ;(useAlertTrendsData as jest.Mock).mockReturnValue(new Map([]))
}
function mockUseTotalalertCountData(): void {
  ;(useTotalAlertCountData as jest.Mock).mockReturnValue(10)
}
function mockUseTotalalertCountDataEmpty(): void {
  ;(useTotalAlertCountData as jest.Mock).mockReturnValue(0)
}

describe('AlertTrendsChartV2', () => {
  const query = 'archived:false'
  const startDate = '2023-01-01'
  const endDate = '2023-01-31'

  it('should render chart with open state', () => {
    mockUseAlertTrendsQuery({
      data: {
        alertTrends: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Low: [{x: '2024-01-10', y: 1}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Medium: [{x: '2024-01-10', y: 2}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          High: [{x: '2024-01-10', y: 3}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Critical: [{x: '2024-01-10', y: 4}],
        },
      },
    })
    mockUseAlertTrendsData()
    mockUseTotalalertCountData()
    render(
      <AlertTrendsChartV2
        query={query}
        startDate={startDate}
        endDate={endDate}
        isOpenSelected={true}
        grouping="severity"
      />,
    )

    expect(screen.getByText('Open alerts over time')).toBeInTheDocument()
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('grouping-selector')).toBeInTheDocument()
  })

  it('should render chart with closed state', () => {
    mockUseAlertTrendsQuery({
      data: {
        alertTrends: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Low: [{x: '2024-01-10', y: 1}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Medium: [{x: '2024-01-10', y: 2}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          High: [{x: '2024-01-10', y: 3}],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Critical: [{x: '2024-01-10', y: 4}],
        },
      },
    })
    mockUseAlertTrendsData()
    mockUseTotalalertCountData()
    render(
      <AlertTrendsChartV2
        query={query}
        startDate={startDate}
        endDate={endDate}
        isOpenSelected={false}
        grouping="severity"
      />,
    )

    expect(screen.getByText('Closed alerts over time')).toBeInTheDocument()
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('grouping-selector')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseAlertTrendsQuery({isPending: true})
    mockUseAlertTrendsData()
    mockUseTotalalertCountData()
    render(
      <AlertTrendsChartV2
        query={query}
        startDate={startDate}
        endDate={endDate}
        isOpenSelected={true}
        grouping="severity"
      />,
    )

    expect(screen.getByText('Open alerts over time')).toBeInTheDocument()
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseAlertTrendsQuery({isError: true})
    mockUseAlertTrendsData()
    mockUseTotalalertCountData()
    render(
      <AlertTrendsChartV2
        query={query}
        startDate={startDate}
        endDate={endDate}
        isOpenSelected={true}
        grouping="severity"
      />,
    )

    expect(screen.getByText('Open alerts over time')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toBeInTheDocument()
  })

  it('should render no-data state', () => {
    mockUseAlertTrendsQuery({
      data: {
        alertTrends: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Low: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Medium: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          High: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Critical: [],
        },
      },
    })
    mockUseAlertTrendsDataEmpty()
    mockUseTotalalertCountDataEmpty()
    render(
      <AlertTrendsChartV2
        query={query}
        startDate={startDate}
        endDate={endDate}
        isOpenSelected={true}
        grouping="severity"
      />,
    )

    expect(screen.getByText('Open alerts over time')).toBeInTheDocument()
    expect(screen.getByTestId('no-data')).toBeInTheDocument()
  })
})
