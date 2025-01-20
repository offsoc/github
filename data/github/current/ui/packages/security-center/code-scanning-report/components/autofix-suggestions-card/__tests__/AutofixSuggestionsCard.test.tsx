import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import AutofixSuggestionsCard from '../AutofixSuggestionsCard'
import useAutofixSuggestionsQuery from '../use-autofix-suggestions-query'

jest.mock('../use-autofix-suggestions-query')
function mockUseAutofixSuggestionsQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useAutofixSuggestionsQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: {},
    ...result,
  })
}

describe('AutofixSuggestionsCard', () => {
  it('should render', async () => {
    mockUseAutofixSuggestionsQuery({
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
    render(<AutofixSuggestionsCard {...props} />)

    expect(screen.getByText('Copilot Autofix suggestions')).toBeInTheDocument()
    expect(screen.getByText(100)).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseAutofixSuggestionsQuery({
      isPending: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AutofixSuggestionsCard {...props} />)

    expect(screen.getByText('Copilot Autofix suggestions')).toBeInTheDocument()
    expect(screen.getByTestId('data-card-loading-skeleton')).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseAutofixSuggestionsQuery({
      isError: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<AutofixSuggestionsCard {...props} />)

    expect(screen.getByText('Copilot Autofix suggestions')).toBeInTheDocument()
    expect(screen.getByText('Data could not be loaded right now')).toBeInTheDocument()
  })
})
