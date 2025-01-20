import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import useAlertsFixedQuery from '../../code-scanning-report/components/alerts-fixed-card/use-alerts-fixed-query'
import {render} from '../../test-utils/Render'
import AlertsFixedInPullRequestsCard from '../components/AlertsFixedInPullRequestsCard'

jest.mock('../../code-scanning-report/components/alerts-fixed-card/use-alerts-fixed-query')
function mockUseAlertsFixedQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useAlertsFixedQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: {},
    ...result,
  })
}

describe('AlertsFixedInPullRequestsCard', () => {
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
      customProperties: [],
    }
    render(<AlertsFixedInPullRequestsCard {...props} />)

    expect(screen.getByText('Vulnerabilities fixed in pull requests')).toBeInTheDocument()
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
      customProperties: [],
    }
    render(<AlertsFixedInPullRequestsCard {...props} />)

    expect(screen.getByText('Vulnerabilities fixed in pull requests')).toBeInTheDocument()
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
      customProperties: [],
    }
    render(<AlertsFixedInPullRequestsCard {...props} />)

    expect(screen.getByText('Vulnerabilities fixed in pull requests')).toBeInTheDocument()
    expect(screen.getByText('Data could not be loaded right now')).toBeInTheDocument()
  })
})
