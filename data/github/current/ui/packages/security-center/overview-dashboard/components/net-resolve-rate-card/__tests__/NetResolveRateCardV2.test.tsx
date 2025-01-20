import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {calculatePreviousDateRange} from '../../../../common/utils/date-period'
import {render} from '../../../../test-utils/Render'
import {NetResolveRateCardV2} from '../NetResolveRateCardV2'
import {getTrend, useNetResolveRateQuery} from '../use-net-resolve-rate-query'

afterEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

jest.mock('../use-net-resolve-rate-query')
function mockUseNetResolveRateQuery(): void {
  ;(useNetResolveRateQuery as jest.Mock)
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
function mockUseNetResolveRateQueryNonSuccess<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useNetResolveRateQuery as jest.Mock).mockReturnValue({
    isSuccess: false,
    ...result,
  })
}
function mockGetTrend(): void {
  ;(getTrend as jest.Mock).mockReturnValue(-50)
}

describe('NetResolveRateCardV2', () => {
  const query = 'archived: false'
  const startDate = '2023-01-01'
  const endDate = '2023-01-31'
  const previousDateRange = calculatePreviousDateRange(startDate, endDate)

  it('renders the component with the correct props', () => {
    mockUseNetResolveRateQuery()

    render(<NetResolveRateCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(useNetResolveRateQuery).toHaveBeenCalled()
    expect(useNetResolveRateQuery).toHaveBeenCalledWith({query, startDate, endDate})
    expect(useNetResolveRateQuery).toHaveBeenCalledWith({
      query,
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
    })

    expect(screen.getByText('Net resolve rate')).toBeInTheDocument()
  })

  it('fetches and displays the correct data without parallel loading', async () => {
    mockUseNetResolveRateQuery()
    mockGetTrend()

    render(<NetResolveRateCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(useNetResolveRateQuery).toHaveBeenCalled()
    expect(useNetResolveRateQuery).toHaveBeenCalledWith({query, startDate, endDate})
    expect(useNetResolveRateQuery).toHaveBeenCalledWith({
      query,
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
    })

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('-50%')).toBeInTheDocument()
  })

  it('displays a no data state on error without parallel loading', async () => {
    mockUseNetResolveRateQueryNonSuccess({
      isError: true,
    })

    render(<NetResolveRateCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })

  it('displays a spinner if loading is true', async () => {
    mockUseNetResolveRateQueryNonSuccess({
      isPending: true,
    })

    render(<NetResolveRateCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByTestId('data-card-loading-skeleton')).toBeInTheDocument()
  })
})
