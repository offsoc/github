import {screen} from '@testing-library/react'

import {calculatePreviousDateRange} from '../../../../common/utils/date-period'
import {render} from '../../../../test-utils/Render'
import {MeanTimeToRemediateCardV2} from '../MeanTimeToRemediateCardV2'
import {getTrend, type MeanTimeToRemediateData, useMeanTimeToRemediateQuery} from '../use-mean-time-to-remediate-query'

afterEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

jest.mock('../use-mean-time-to-remediate-query')
function mockUseMeanTimeToRemediateQuery(): void {
  ;(useMeanTimeToRemediateQuery as jest.Mock)
    .mockReturnValueOnce({
      count: 2,
      isSuccess: true,
      isPending: false,
      isError: false,
    })
    .mockReturnValueOnce({
      count: 4,
      isSuccess: true,
      isPending: false,
      isError: false,
    })
}
function mockUseMeanTimeToRemediateQueryNonSuccess(result: Partial<MeanTimeToRemediateData>): void {
  ;(useMeanTimeToRemediateQuery as jest.Mock).mockReturnValue({
    isSuccess: false,
    ...result,
  })
}
function mockGetTrend(): void {
  ;(getTrend as jest.Mock).mockReturnValue(-50)
}

describe('MeanTimeToRemediateCardV2', () => {
  const query = 'archived: false'
  const startDate = '2023-01-01'
  const endDate = '2023-01-31'
  const previousDateRange = calculatePreviousDateRange(startDate, endDate)

  it('renders the component with the correct props', () => {
    mockUseMeanTimeToRemediateQuery()

    render(<MeanTimeToRemediateCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(useMeanTimeToRemediateQuery).toHaveBeenCalled()
    expect(useMeanTimeToRemediateQuery).toHaveBeenCalledWith({query, startDate, endDate})
    expect(useMeanTimeToRemediateQuery).toHaveBeenCalledWith({
      query,
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
    })

    expect(screen.getByText('Mean time to remediate')).toBeInTheDocument()
  })

  it('fetches and displays the correct data without parallel loading', async () => {
    mockUseMeanTimeToRemediateQuery()
    mockGetTrend()

    render(<MeanTimeToRemediateCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(useMeanTimeToRemediateQuery).toHaveBeenCalled()
    expect(useMeanTimeToRemediateQuery).toHaveBeenCalledWith({query, startDate, endDate})
    expect(useMeanTimeToRemediateQuery).toHaveBeenCalledWith({
      query,
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
    })

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('-50%')).toBeInTheDocument()
  })

  it('displays a no data state on error without parallel loading', async () => {
    mockUseMeanTimeToRemediateQueryNonSuccess({
      isError: true,
    })

    render(<MeanTimeToRemediateCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })

  it('displays a spinner if loading is true', async () => {
    mockUseMeanTimeToRemediateQueryNonSuccess({
      isPending: true,
    })

    render(<MeanTimeToRemediateCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByTestId('data-card-loading-skeleton')).toBeInTheDocument()
  })
})
