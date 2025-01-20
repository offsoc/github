import type {UseQueryResult} from '@tanstack/react-query'
import {act, screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import MostPrevalentRulesCard, {SeeAllDialog} from '../MostPrevalentRulesCard'
import useMostPrevalentRulesQuery from '../use-most-prevalent-rules-query'

jest.mock('../use-most-prevalent-rules-query')
function mockUseMostPrevalentRulesQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useMostPrevalentRulesQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: false,
    data: [],
    ...result,
  })
}

describe('MostPrevalentRulesCard', () => {
  it('should render', async () => {
    mockUseMostPrevalentRulesQuery({
      isSuccess: true,
      data: {
        items: [
          {
            ruleName: 'Cross-site scripting',
            ruleSarifIdentifier: 'java/xss',
            count: 20,
          },
        ],
      },
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<MostPrevalentRulesCard {...props} />)

    expect(screen.getByText('Most prevalent rules')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUseMostPrevalentRulesQuery({
      isPending: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<MostPrevalentRulesCard {...props} />)

    expect(screen.getByText('Most prevalent rules')).toBeInTheDocument()
    expect(screen.getByTestId('loading-container')).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseMostPrevalentRulesQuery({
      isError: true,
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<MostPrevalentRulesCard {...props} />)

    expect(screen.getByText('Most prevalent rules')).toBeInTheDocument()
    expect(screen.getByTestId('error-blankslate')).toBeInTheDocument()
  })

  it('should render no-data state', () => {
    mockUseMostPrevalentRulesQuery({
      isSuccess: true,
      data: {
        items: [],
      },
    })

    const props = {
      query: '',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }
    render(<MostPrevalentRulesCard {...props} />)

    expect(screen.getByText('Most prevalent rules')).toBeInTheDocument()
    expect(screen.getByTestId('empty-blankslate')).toBeInTheDocument()
  })

  describe('SeeAllDialog', () => {
    it('should render', () => {
      mockUseMostPrevalentRulesQuery({
        isSuccess: true,
        data: {
          items: [
            {
              ruleName: 'Cross-site scripting',
              ruleSarifIdentifier: 'java/xss',
              count: 20,
            },
          ],
        },
      })

      renderOpenDialog()

      expect(screen.getByText('Most prevalent rules')).toBeInTheDocument()
    })

    it('should render loading state', () => {
      mockUseMostPrevalentRulesQuery({
        isPending: true,
      })

      renderOpenDialog()

      expect(screen.getByText('Most prevalent rules')).toBeInTheDocument()
      expect(screen.getByTestId('loading-container')).toBeInTheDocument()
    })

    it('should render error state', () => {
      mockUseMostPrevalentRulesQuery({
        isError: true,
      })

      renderOpenDialog()

      expect(screen.getByText('Most prevalent rules')).toBeInTheDocument()
      expect(screen.getByTestId('error-blankslate')).toBeInTheDocument()
    })

    it('should render no-data state', () => {
      mockUseMostPrevalentRulesQuery({
        isSuccess: true,
        data: {
          items: [],
        },
      })

      renderOpenDialog()

      expect(screen.getByText('Most prevalent rules')).toBeInTheDocument()
      expect(screen.getByTestId('empty-blankslate')).toBeInTheDocument()
    })

    function renderOpenDialog(): void {
      const props = {
        query: '',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }
      render(<SeeAllDialog {...props} />)

      // open the dialog
      const button = screen.getByTestId('trigger-button')
      expect(button).toBeInTheDocument()
      act(() => button.click())
    }
  })
})
