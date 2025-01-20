import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import AlertsFixedCard from '../AlertsFixedCard'
import useAlertsFixedQuery from '../use-alerts-fixed-query'

jest.mock('../use-alerts-fixed-query')
function mockUseAlertsFixedQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useAlertsFixedQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: {},
    ...result,
  })
}

describe('AlertsFixedCard', () => {
  it('should render', async () => {
    mockUseAlertsFixedQuery({
      isSuccess: true,
      data: {
        count: 100,
        percentage: 99,
      },
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFixedCard {...props} />)

    expect(screen.getByText('Alerts fixed')).toBeInTheDocument()
    expect(screen.getByText(100)).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseAlertsFixedQuery({
      isPending: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFixedCard {...props} />)

    expect(screen.getByText('Alerts fixed')).toBeInTheDocument()
    expect(screen.getByTestId('data-card-loading-skeleton')).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseAlertsFixedQuery({
      isError: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFixedCard {...props} />)

    expect(screen.getByText('Alerts fixed')).toBeInTheDocument()
    expect(screen.getByText('Data could not be loaded right now')).toBeInTheDocument()
  })
})
