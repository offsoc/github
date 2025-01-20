import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {calculatePreviousDateRange} from '../../../../common/utils/date-period'
import {render} from '../../../../test-utils/Render'
import {ReopenedAlertsCardV2} from '../ReopenedAlertsCardV2'
import {getTrend, useReopenedAlertsQuery} from '../use-reopened-alerts-query'

afterEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}
jest.mock('../use-reopened-alerts-query')
function mockUseReopenedAlertsQuery(): void {
  ;(useReopenedAlertsQuery as jest.Mock)
    .mockReturnValueOnce({
      count: 100,
      isSuccess: true,
      isPending: false,
      isError: false,
    })
    .mockReturnValueOnce({
      count: 200,
      isSuccess: true,
      isPending: false,
      isError: false,
    })
}
function mockUseReopenedAlertsQueryNonSuccess<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useReopenedAlertsQuery as jest.Mock).mockReturnValue({
    isSuccess: false,
    ...result,
  })
}
function mockGetTrend(): void {
  ;(getTrend as jest.Mock).mockReturnValue(50)
}

describe('ReopenedAlertsCardV2', () => {
  const query = 'archived: false'
  const startDate = '2023-01-01'
  const endDate = '2023-01-31'
  const previousDateRange = calculatePreviousDateRange(startDate, endDate)

  it('renders the component with the correct props', () => {
    mockUseReopenedAlertsQuery()

    render(<ReopenedAlertsCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(useReopenedAlertsQuery).toHaveBeenCalled()
    expect(useReopenedAlertsQuery).toHaveBeenCalledWith({query, startDate, endDate})
    expect(useReopenedAlertsQuery).toHaveBeenCalledWith({
      query,
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
    })

    expect(screen.getByText('Reopened alerts')).toBeInTheDocument()
  })

  it('fetches and displays the correct data', async () => {
    mockUseReopenedAlertsQuery()
    mockGetTrend()

    render(<ReopenedAlertsCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(useReopenedAlertsQuery).toHaveBeenCalled()
    expect(useReopenedAlertsQuery).toHaveBeenCalledWith({query, startDate, endDate})
    expect(useReopenedAlertsQuery).toHaveBeenCalledWith({
      query,
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
    })

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('displays a no data state on error', async () => {
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', false)
    mockUseReopenedAlertsQueryNonSuccess({
      isError: true,
    })

    render(<ReopenedAlertsCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })

  it('displays a spinner if loading is true', async () => {
    mockUseReopenedAlertsQueryNonSuccess({
      isPending: true,
    })

    render(<ReopenedAlertsCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    expect(screen.getByTestId('data-card-loading-skeleton')).toBeInTheDocument()
  })
})
