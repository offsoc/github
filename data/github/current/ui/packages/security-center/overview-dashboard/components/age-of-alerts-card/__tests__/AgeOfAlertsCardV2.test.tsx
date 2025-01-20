import {render, screen} from '@testing-library/react'

import {calculatePreviousDateRange} from '../../../../common/utils/date-period'
import {AgeOfAlertsCardV2} from '../AgeOfAlertsCardV2'
import {type AgeOfAlertsData, getTrend, useAgeOfAlertsQuery} from '../use-age-of-alerts-query'

afterEach(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

jest.mock('../use-age-of-alerts-query')
function mockUseAgeOfAlertsQuery(): void {
  ;(useAgeOfAlertsQuery as jest.Mock)
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
function mockUseAgeOfAlertsQueryNonSuccess(result: Partial<AgeOfAlertsData>): void {
  ;(useAgeOfAlertsQuery as jest.Mock).mockReturnValue({
    isSuccess: false,
    ...result,
  })
}
function mockGetTrend(): void {
  ;(getTrend as jest.Mock).mockReturnValue(-50)
}

describe('AgeOfAlertsCardV2', () => {
  const query = 'archived: false'
  const startDate = '2023-01-01'
  const endDate = '2023-01-31'
  const previousDateRange = calculatePreviousDateRange(startDate, endDate)

  it('renders the component with the correct props', () => {
    mockUseAgeOfAlertsQuery()

    render(<AgeOfAlertsCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(useAgeOfAlertsQuery).toHaveBeenCalled()
    expect(useAgeOfAlertsQuery).toHaveBeenCalledWith({
      query,
      startDate,
      endDate,
    })
    expect(useAgeOfAlertsQuery).toHaveBeenCalledWith({
      query,
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
    })

    expect(screen.getByText('Age of alerts')).toBeInTheDocument()
  })

  it('fetches and displays the correct data', async () => {
    mockUseAgeOfAlertsQuery()
    mockGetTrend()

    render(<AgeOfAlertsCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(useAgeOfAlertsQuery).toHaveBeenCalled()
    expect(useAgeOfAlertsQuery).toHaveBeenCalledWith({
      query,
      startDate,
      endDate,
    })
    expect(useAgeOfAlertsQuery).toHaveBeenCalledWith({
      query,
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
    })

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('-50%')).toBeInTheDocument()
  })

  it('displays a no data state on error without parallel loading', async () => {
    mockUseAgeOfAlertsQueryNonSuccess({
      isError: true,
    })

    render(<AgeOfAlertsCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })

  it('displays a spinner if loading is true without parallel loading', async () => {
    mockUseAgeOfAlertsQueryNonSuccess({
      isPending: true,
    })

    render(<AgeOfAlertsCardV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    expect(screen.getByTestId('data-card-loading-skeleton')).toBeInTheDocument()
  })
})
