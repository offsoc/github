import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import AlertsFixedWithAutofixCard from '../AlertsFixedWithAutofixCard'
import useAlertsFixedWithAutofixQuery from '../use-alerts-fixed-with-autofix-query'

jest.mock('../use-alerts-fixed-with-autofix-query')
function mockUseAlertsFixedWithAutofixQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useAlertsFixedWithAutofixQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: [],
    ...result,
  })
}

describe('AlertsFixedWithAutofixCard', () => {
  it('should render', async () => {
    mockUseAlertsFixedWithAutofixQuery({
      isSuccess: true,
      data: {
        accepted: 1,
        suggested: 2,
      },
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFixedWithAutofixCard {...props} />)
    expect(screen.getByText('Alerts fixed with autofix suggestions')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseAlertsFixedWithAutofixQuery({
      isPending: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFixedWithAutofixCard {...props} />)
    expect(screen.getByText('Alerts fixed with autofix suggestions')).toBeInTheDocument()
    expect(screen.getByTestId('data-card-loading-skeleton')).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseAlertsFixedWithAutofixQuery({
      isError: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AlertsFixedWithAutofixCard {...props} />)
    expect(screen.getByText('Alerts fixed with autofix suggestions')).toBeInTheDocument()
    expect(screen.getByText('Data could not be loaded right now')).toBeInTheDocument()
  })
})
