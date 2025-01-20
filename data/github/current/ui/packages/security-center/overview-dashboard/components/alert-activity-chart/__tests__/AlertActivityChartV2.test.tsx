import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import {AlertActivityChartV2} from '../AlertActivityChartV2'
import {useAlertActivityData, useAlertActivityQuery} from '../use-alert-activity-query'

afterEach(() => {
  jest.clearAllMocks()
})

window.performance.mark = jest.fn()
window.performance.measure = jest.fn()
window.performance.getEntriesByName = jest.fn().mockReturnValue([{duration: 100}])
window.performance.clearMarks = jest.fn()
window.performance.clearMeasures = jest.fn()

jest.mock('../use-alert-activity-query')
function mockUseAlertActivityQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useAlertActivityQuery as jest.Mock).mockReturnValue(
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
function mockUseAlertActivityData(): void {
  ;(useAlertActivityData as jest.Mock).mockReturnValue({
    data: [
      {
        opened: 30,
        closed: 12,
        date: 'Oct 1',
        endDate: 'Oct 31',
      },
      {
        opened: 15,
        closed: 6,
        date: 'Nov 1',
        endDate: 'Nov 30',
      },
    ],
    sum: 63,
  })
}
function mockUseAlertActivityDataEmpty(): void {
  ;(useAlertActivityData as jest.Mock).mockReturnValue({data: [], sum: 0})
}

describe('AlertActivityChartV2', () => {
  const query = 'archived:false'
  const startDate = '2023-01-01'
  const endDate = '2023-01-31'

  it('should render chart', () => {
    mockUseAlertActivityQuery({
      data: {
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
      },
    })
    mockUseAlertActivityData()
    render(<AlertActivityChartV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Alert activity')).toBeInTheDocument()
    expect(screen.getByTestId('chart-component')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseAlertActivityQuery({isPending: true})
    mockUseAlertActivityData()
    render(<AlertActivityChartV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Alert activity')).toBeInTheDocument()
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseAlertActivityQuery({isError: true})
    mockUseAlertActivityData()
    render(<AlertActivityChartV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Alert activity')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toBeInTheDocument()
  })

  it('should render no-data state', () => {
    mockUseAlertActivityQuery({
      data: {
        data: [],
      },
    })
    mockUseAlertActivityDataEmpty()
    render(<AlertActivityChartV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Alert activity')).toBeInTheDocument()
    expect(screen.getByTestId('no-data')).toBeInTheDocument()
  })
})
