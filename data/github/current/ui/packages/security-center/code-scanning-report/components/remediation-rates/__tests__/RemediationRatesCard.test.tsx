import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import RemediationRatesCard from '../RemediationRatesCard'
import useRemediationRatesQuery from '../use-remediation-rates-query'

jest.mock('../use-remediation-rates-query')
function mockUseRemediationRatesQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useRemediationRatesQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: [],
    ...result,
  })
}

describe('RemediationRatesCard', () => {
  it('should render', () => {
    mockUseRemediationRatesQuery({
      isSuccess: true,
      data: {
        percentFixedWithAutofixSuggested: 99,
        percentFixedWithNoAutofixSuggested: 75,
      },
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<RemediationRatesCard {...props} />)
    expect(screen.getByText('Remediation rates')).toBeInTheDocument()
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseRemediationRatesQuery({
      isPending: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<RemediationRatesCard {...props} />)
    expect(screen.getByText('Remediation rates')).toBeInTheDocument()
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseRemediationRatesQuery({
      isError: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<RemediationRatesCard {...props} />)
    expect(screen.getByText('Remediation rates')).toBeInTheDocument()
    expect(screen.getByTestId('error-indicator')).toBeInTheDocument()
  })
})
