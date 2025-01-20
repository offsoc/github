import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import AlertsFoundCard from '../AlertsFoundCard'
import useAlertsFoundQuery from '../use-alerts-found-query'

jest.mock('../use-alerts-found-query')
function mockUseAlertsFoundQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useAlertsFoundQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: {},
    ...result,
  })
}

describe('AlertsFoundCard', () => {
  it('should render', async () => {
    mockUseAlertsFoundQuery({
      isSuccess: true,
      data: {
        count: 100,
      },
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFoundCard {...props} />)

    expect(screen.getByText('Alerts found')).toBeInTheDocument()
    expect(screen.getByText(100)).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseAlertsFoundQuery({
      isPending: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFoundCard {...props} />)

    expect(screen.getByText('Alerts found')).toBeInTheDocument()
    expect(screen.getByTestId('data-card-loading-skeleton')).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseAlertsFoundQuery({
      isError: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFoundCard {...props} />)

    expect(screen.getByText('Alerts found')).toBeInTheDocument()
    expect(screen.getByText('Data could not be loaded right now')).toBeInTheDocument()
  })
})
