import type {UseQueryResult} from '@tanstack/react-query'
import {screen, waitFor} from '@testing-library/react'

import type {CustomProperty} from '../../../common/filter-providers/types'
import {render} from '../../../test-utils/Render'
import {SecretsBypassedCardV2} from '../../components/secrets-bypassed/SecretsBypassedCardV2'
import useSecretsBypassedQuery from '../../components/secrets-bypassed/use-secrets-bypassed-query'

jest.mock('../../components/secrets-bypassed/use-secrets-bypassed-query')
function mockUseSecretsBypassedQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useSecretsBypassedQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: [],
    ...result,
  })
}

describe('SecretsBypassedCardV2', () => {
  const query = 'archived: false'
  const customProperties: CustomProperty[] = [
    {name: 'foo', type: 'string'},
    {name: 'bar', type: 'single_select'},
    {name: 'baz', type: 'multi_select'},
    {name: 'qux', type: 'true_false'},
  ]
  const startDate = '2024-01-01'
  const endDate = '2024-01-31'

  it('renders the component with the correct props', () => {
    mockUseSecretsBypassedQuery({
      isPending: true,
      isSuccess: false,
    })

    render(
      <SecretsBypassedCardV2
        query={query}
        customProperties={customProperties}
        startDate={startDate}
        endDate={endDate}
      />,
    )

    expect(screen.getByText('Secrets bypassed')).toBeInTheDocument()
    expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument()
  })

  it('renders the component with no data experience for invalidate date inputs', () => {
    mockUseSecretsBypassedQuery({
      data: {noData: 'no data message'},
    })

    render(
      <SecretsBypassedCardV2
        query={query}
        customProperties={customProperties}
        startDate="2023-01-01"
        endDate="2023-01-31"
      />,
    )

    expect(screen.getByText('No data exists for this metric with the given filters.')).toBeInTheDocument()
    expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument()
  })

  it('renders the component with fetched data', async () => {
    mockUseSecretsBypassedQuery({
      isSuccess: true,
      data: {
        totalBlocksCount: 1337,
        successfulBlocksCount: 7331,
        bypassedAlertsCount: 1234,
      },
    })

    render(
      <SecretsBypassedCardV2
        query={query}
        customProperties={customProperties}
        startDate={startDate}
        endDate={endDate}
      />,
    )

    expect(await screen.findByText(`1,234`)).toBeInTheDocument()
    expect(await screen.findByText(`/ 1,337`)).toBeInTheDocument()
    expect(await screen.findByText(`7,331 secrets blocked successfully`)).toBeInTheDocument()
    expect(await screen.findByTestId('data-card-action-link')).toBeInTheDocument()
  })

  it('displays a no data state on error', async () => {
    mockUseSecretsBypassedQuery({
      isSuccess: false,
      isError: true,
    })

    render(
      <SecretsBypassedCardV2
        query={query}
        customProperties={customProperties}
        startDate={startDate}
        endDate={endDate}
      />,
    )

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument())
  })

  it('displays error state when html is returned from server instead of json', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: async () => '<DOCUMENT',
      ok: true,
      headers: new Headers({'Content-Type': 'text/html'}),
    } as Response)

    render(
      <SecretsBypassedCardV2
        query={query}
        customProperties={customProperties}
        startDate={startDate}
        endDate={endDate}
      />,
    )

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument())
  })

  describe('renders action link', () => {
    it('with only supported query filters', async () => {
      mockUseSecretsBypassedQuery({
        isSuccess: true,
        data: {
          totalBlocksCount: 1337,
          successfulBlocksCount: 7331,
          bypassedAlertsCount: 1234,
        },
      })

      render(
        <SecretsBypassedCardV2
          query="archived:false tool:github secret-scanning.provider:test secret-scanning.bypassed:true severity:critical props.woof:123"
          customProperties={customProperties}
          startDate={startDate}
          endDate={endDate}
        />,
      )

      expect(await screen.findByTestId('data-card-action-link')).toBeInTheDocument()
      const expectedHref =
        '/orgs/my-org/security/metrics/secret-scanning?startDate=2024-01-01&endDate=2024-01-31&query=archived%3Afalse+provider%3Atest'
      expect(await screen.findByTestId('data-card-action-link')).toHaveAttribute('href', expectedHref)
    })

    it('with date period if provided', async () => {
      mockUseSecretsBypassedQuery({
        isSuccess: true,
        data: {
          totalBlocksCount: 1337,
          successfulBlocksCount: 7331,
          bypassedAlertsCount: 1234,
        },
      })

      render(
        <SecretsBypassedCardV2
          query="archived:false tool:github secret-scanning.provider:test secret-scanning.bypassed:true severity:critical props.woof:123"
          customProperties={customProperties}
          startDate={startDate}
          endDate={endDate}
          datePeriod={{period: 'last14days'}}
        />,
      )

      expect(await screen.findByTestId('data-card-action-link')).toBeInTheDocument()
      const expectedHref =
        '/orgs/my-org/security/metrics/secret-scanning?period=last14days&query=archived%3Afalse+provider%3Atest'
      expect(await screen.findByTestId('data-card-action-link')).toHaveAttribute('href', expectedHref)
    })

    it('without date span param if provided date period is the same as default', async () => {
      mockUseSecretsBypassedQuery({
        isSuccess: true,
        data: {
          totalBlocksCount: 1337,
          successfulBlocksCount: 7331,
          bypassedAlertsCount: 1234,
        },
      })

      render(
        <SecretsBypassedCardV2
          query="archived:false tool:github secret-scanning.provider:test secret-scanning.bypassed:true severity:critical props.woof:123"
          customProperties={customProperties}
          startDate={startDate}
          endDate={endDate}
          datePeriod={{period: 'last30days'}}
        />,
      )

      expect(await screen.findByTestId('data-card-action-link')).toBeInTheDocument()
      const expectedHref = '/orgs/my-org/security/metrics/secret-scanning?query=archived%3Afalse+provider%3Atest'
      expect(await screen.findByTestId('data-card-action-link')).toHaveAttribute('href', expectedHref)
    })
  })
})
