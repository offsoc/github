import {screen, waitFor, within} from '@testing-library/react'

import {JSON_HEADER} from '../../common/utils/fetch-json'
import {render} from '../../test-utils/Render'
import {PushProtectionMetrics, type PushProtectionMetricsProps} from '../components/PushProtectionMetrics'
import {AggregateCountType, type PushProtectionMetricsResponse} from '../types/push-protection-metrics'

describe('PushProtectionMetrics', () => {
  const startDate = '2023-01-01'
  const endDate = '2023-12-31'
  const query = ''

  test('renders a loading experience by default', () => {
    render(<PushProtectionMetrics startDate={startDate} endDate={endDate} query={query} />)
    expect(screen.getAllByTestId('data-card-loading-skeleton')).toHaveLength(3)
    expect(screen.getAllByTestId('metrics-list-loading-skeleton')).toHaveLength(5)
  })

  test('renders content with blankslate if noData input is set to true', async () => {
    render(<PushProtectionMetrics startDate={startDate} endDate={endDate} query={query} noData={true} />)
    await waitFor(() => {
      expect(screen.getAllByTestId('empty-metrics-list-blankslate')).toHaveLength(5)
    })
    expect(screen.queryByTestId('push-protection-metrics-loading')).not.toBeInTheDocument()
    expect(screen.queryByTestId('push-protection-metrics-request-error-blankslate')).not.toBeInTheDocument()
  })

  test('renders with blankslate if request fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({error: 'something'}),
      ok: false,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<PushProtectionMetrics startDate={startDate} endDate={endDate} query={query} />)

    expect(await screen.findByTestId('push-protection-metrics-request-error-blankslate')).toBeInTheDocument()
    expect(await screen.findByText('Secret scanning data could not be loaded right now')).toBeInTheDocument()
  })

  test('renders with blankslate if response contains nothing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => null,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<PushProtectionMetrics startDate={startDate} endDate={endDate} query={query} />)

    expect(await screen.findByTestId('push-protection-metrics-request-error-blankslate')).toBeInTheDocument()
    expect(await screen.findByText('Secret scanning data could not be loaded right now')).toBeInTheDocument()
  })

  test('renders with blankslate if response contains no metrics payload', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({payload: null}),
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<PushProtectionMetrics startDate={startDate} endDate={endDate} query={query} />)
    await waitFor(async () => {
      expect(await screen.findByTestId('push-protection-metrics-request-error-blankslate')).toBeInTheDocument()
    })
    expect(await screen.findByText('Secret scanning data could not be loaded right now')).toBeInTheDocument()
  })

  describe('when data is returned', () => {
    test('renders core metrics', async () => {
      renderComponentWithData({startDate, endDate, query})

      await waitFor(() => expect(screen.queryByTestId('data-card-loading-skeleton')).not.toBeInTheDocument())

      expect(await screen.findByText('Push protection')).toBeInTheDocument()

      const bypassedSecretsCard = await screen.findByTestId('bypassed-secrets-count')
      expect(bypassedSecretsCard).toBeInTheDocument()
      expect(within(bypassedSecretsCard).getByText('Bypassed secrets')).toBeInTheDocument()
      expect(within(bypassedSecretsCard).getByText('14 secrets blocked successfully')).toBeInTheDocument()

      const bypassRequestsCard = await screen.findByTestId('bypass-requests-by-status')
      expect(bypassRequestsCard).toBeInTheDocument()
      expect(within(bypassRequestsCard).getByText('Bypass requests')).toBeInTheDocument()
      expect(within(bypassRequestsCard).getByText('7')).toBeInTheDocument()

      const meanTimeToResponseCard = await screen.findByTestId('mean-time-to-response')
      expect(meanTimeToResponseCard).toBeInTheDocument()
      expect(within(meanTimeToResponseCard).getByText('Mean time to response')).toBeInTheDocument()
      expect(within(meanTimeToResponseCard).getByText('21.9')).toBeInTheDocument()
      expect(within(meanTimeToResponseCard).getByText('hours')).toBeInTheDocument()
    })

    test('renders blocks by token type metrics', async () => {
      renderComponentWithData({startDate, endDate, query})

      await waitFor(() => expect(screen.queryByTestId('metrics-list-loading-skeleton')).not.toBeInTheDocument())

      expect(await screen.findByText('Blocks')).toBeInTheDocument()

      const blocksByTokenTypeList = await screen.findByTestId('blocks-by-token-type')
      expect(blocksByTokenTypeList).toBeInTheDocument()

      expect(within(blocksByTokenTypeList).getByText(/Clojars Deploy Token/)).toBeInTheDocument()
      expect(within(blocksByTokenTypeList).getByText('10')).toBeInTheDocument()
      expect(within(blocksByTokenTypeList).getByText(/Adafruit IO Key/)).toBeInTheDocument()
      expect(within(blocksByTokenTypeList).getByText('5')).toBeInTheDocument()
      expect(within(blocksByTokenTypeList).getByText(/hello world \(custom pattern\)/)).toBeInTheDocument()
      expect(within(blocksByTokenTypeList).getByText('3')).toBeInTheDocument()
      expect(within(blocksByTokenTypeList).getByText('TOKEN_WITH_NO_METADATA')).toBeInTheDocument()
      expect(within(blocksByTokenTypeList).getByText('2')).toBeInTheDocument()
    })

    test('renders blocks by repository metrics', async () => {
      renderComponentWithData({startDate, endDate, query})

      await waitFor(() => expect(screen.queryByTestId('metrics-list-loading-skeleton')).not.toBeInTheDocument())

      expect(await screen.findByText('Blocks')).toBeInTheDocument()

      const blocksByRepoList = await screen.findByTestId('blocks-by-repo')
      expect(blocksByRepoList).toBeInTheDocument()

      expect(within(blocksByRepoList).getByText(/secret-scanning/)).toBeInTheDocument()
      expect(within(blocksByRepoList).getByText('17')).toBeInTheDocument()
      expect(within(blocksByRepoList).getByText(/token-scanning-service/)).toBeInTheDocument()
      expect(within(blocksByRepoList).getByText('3')).toBeInTheDocument()
    })

    test('renders bypasses by token type metrics', async () => {
      renderComponentWithData({startDate, endDate, query})

      await waitFor(() => expect(screen.queryByTestId('metrics-list-loading-skeleton')).not.toBeInTheDocument())

      expect(await screen.findByText('Bypasses')).toBeInTheDocument()

      const bypassesByTokenTypeList = await screen.findByTestId('bypasses-by-token-type')
      expect(bypassesByTokenTypeList).toBeInTheDocument()

      expect(within(bypassesByTokenTypeList).getByText(/Clojars Deploy Token/)).toBeInTheDocument()
      expect(within(bypassesByTokenTypeList).getByText('5')).toBeInTheDocument()
      expect(within(bypassesByTokenTypeList).getByText(/Adafruit IO Key/)).toBeInTheDocument()
      expect(within(bypassesByTokenTypeList).getByText('12')).toBeInTheDocument()
      expect(within(bypassesByTokenTypeList).getByText(/hello world \(custom pattern\)/)).toBeInTheDocument()
      expect(within(bypassesByTokenTypeList).getByText('7')).toBeInTheDocument()
      expect(within(bypassesByTokenTypeList).getByText('TOKEN_WITH_NO_METADATA')).toBeInTheDocument()
      expect(within(bypassesByTokenTypeList).getByText('1')).toBeInTheDocument()
    })

    test('renders bypasses by repository metrics', async () => {
      renderComponentWithData({startDate, endDate, query})

      await waitFor(() => expect(screen.queryByTestId('metrics-list-loading-skeleton')).not.toBeInTheDocument())

      expect(await screen.findByText('Bypasses')).toBeInTheDocument()

      const bypassesByRepoList = await screen.findByTestId('bypasses-by-repo')
      expect(bypassesByRepoList).toBeInTheDocument()

      expect(within(bypassesByRepoList).getByText(/secret-scanning/)).toBeInTheDocument()
      expect(within(bypassesByRepoList).getByText('45')).toBeInTheDocument()
      expect(within(bypassesByRepoList).getByText(/token-scanning-service/)).toBeInTheDocument()
      expect(within(bypassesByRepoList).getByText('12')).toBeInTheDocument()
    })

    test('renders bypasses by reason metrics', async () => {
      renderComponentWithData({startDate, endDate, query})

      await waitFor(() => expect(screen.queryByTestId('metrics-list-loading-skeleton')).not.toBeInTheDocument())

      expect(await screen.findByText('Bypasses')).toBeInTheDocument()

      const bypassesByReasonList = await screen.findByTestId('bypasses-by-reason')
      expect(bypassesByReasonList).toBeInTheDocument()

      expect(within(bypassesByReasonList).getByText('False positives')).toBeInTheDocument()
      expect(within(bypassesByReasonList).getByText('15 (75%)')).toBeInTheDocument()
      expect(within(bypassesByReasonList).getByText('Used in tests')).toBeInTheDocument()
      expect(within(bypassesByReasonList).getByText('5 (25%)')).toBeInTheDocument()
      expect(within(bypassesByReasonList).getByText('Fix later')).toBeInTheDocument()
      expect(within(bypassesByReasonList).getByText('0')).toBeInTheDocument()
    })
  })
})

function renderComponentWithData({startDate, endDate, query, noData = false}: PushProtectionMetricsProps): void {
  const payload: PushProtectionMetricsResponse = {
    totalBlocksCount: 20,
    successfulBlocksCount: 14,
    bypassedAlertsCount: 6,
    bypassRequestsCount: 7,
    meanResponseTime: 78923,
    blocksByTokenTypeCounts: [
      {
        type: AggregateCountType.TokenType,
        name: 'Clojars Deploy Token',
        slug: 'clojars_deploy_token',
        count: 10,
        isCustomPattern: false,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'Adafruit IO Key',
        slug: 'adafruit_io_key',
        count: 5,
        isCustomPattern: false,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'hello world',
        slug: 'hello_world',
        count: 3,
        isCustomPattern: true,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'TOKEN_WITH_NO_METADATA',
        slug: '',
        count: 2,
        isCustomPattern: false,
        hasMetadata: false,
      },
    ],
    blocksByRepositoryCounts: [
      {
        type: AggregateCountType.Repository,
        name: 'secret-scanning',
        count: 17,
      },
      {
        type: AggregateCountType.Repository,
        name: 'token-scanning-service',
        count: 3,
      },
    ],
    bypassesByTokenTypeCounts: [
      {
        type: AggregateCountType.TokenType,
        name: 'Clojars Deploy Token',
        slug: 'clojars_deploy_token',
        count: 5,
        isCustomPattern: false,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'Adafruit IO Key',
        slug: 'adafruit_io_key',
        count: 12,
        isCustomPattern: false,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'hello world',
        slug: 'hello_world',
        count: 7,
        isCustomPattern: true,
        hasMetadata: true,
      },
      {
        type: AggregateCountType.TokenType,
        name: 'TOKEN_WITH_NO_METADATA',
        slug: '',
        count: 1,
        isCustomPattern: false,
        hasMetadata: false,
      },
    ],
    bypassesByRepositoryCounts: [
      {
        type: AggregateCountType.Repository,
        name: 'secret-scanning',
        count: 45,
      },
      {
        type: AggregateCountType.Repository,
        name: 'token-scanning-service',
        count: 12,
      },
    ],
    bypassesByReasonCounts: [
      {
        type: AggregateCountType.BypassReason,
        name: 'False positives',
        count: 15,
        percent: 75,
      },
      {
        type: AggregateCountType.BypassReason,
        name: 'Fix later',
        count: 0,
        percent: 0,
      },
      {
        type: AggregateCountType.BypassReason,
        name: 'Used in tests',
        count: 5,
        percent: 25,
      },
    ],
    bypassesByRequestStatusCounts: [
      {
        type: AggregateCountType.BypassRequestStatus,
        name: 'Approved',
        count: 3,
        percent: 43,
      },
      {
        type: AggregateCountType.BypassRequestStatus,
        name: 'Rejected',
        count: 2,
        percent: 29,
      },
      {
        type: AggregateCountType.BypassRequestStatus,
        name: 'Cancelled',
        count: 1,
        percent: 14,
      },
      {
        type: AggregateCountType.BypassRequestStatus,
        name: 'Open',
        count: 1,
        percent: 14,
      },
    ],
  }

  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    json: async () => ({payload}),
    ok: true,
    headers: new Headers(JSON_HEADER),
  } as Response)

  render(<PushProtectionMetrics startDate={startDate} endDate={endDate} query={query} noData={noData} />)
}
