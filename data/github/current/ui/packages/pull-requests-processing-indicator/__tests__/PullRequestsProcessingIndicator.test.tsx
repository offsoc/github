import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {PullRequestsProcessingIndicatorWithDataFetching} from '../PullRequestsProcessingIndicator'
import {getPullRequestsProcessingIndicatorProps} from '../test-utils/mock-data'
import {mockFetch} from '@github-ui/mock-fetch'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'

describe('Renders the PullRequestsProcessingIndicatorWithDataFetching', () => {
  test('renders nothing when PR is not stale', async () => {
    const props = getPullRequestsProcessingIndicatorProps()

    render(<PullRequestsProcessingIndicatorWithDataFetching {...props} />)

    await act(() => {
      mockFetch.resolvePendingRequest(props.processingIndicatorUrl, {
        stale: false,
        latest_unsynced_push_to_head_ref_at: null,
      })
    })

    expect(screen.queryByText('Processing updates')).toBeNull()
  })

  test('renders nothing when PR is stale but it has been less than 20 seconds since the last push to the head ref', async () => {
    const props = getPullRequestsProcessingIndicatorProps()

    jest.useFakeTimers()
    const currTime = new Date('2023-08-31T00:00:00Z')
    jest.setSystemTime(currTime)
    const pushedAtTime = new Date(currTime.getTime() - 19000)

    render(<PullRequestsProcessingIndicatorWithDataFetching {...props} />)

    await act(() => {
      mockFetch.resolvePendingRequest(props.processingIndicatorUrl, {
        stale: true,
        latest_unsynced_push_to_head_ref_at: pushedAtTime,
      })
    })

    expect(screen.queryByText('Processing updates')).toBeNull()
  })

  test('renders the processing message when PR is stale and it has been 20 seconds since the last push to the head ref but less than a day', async () => {
    const props = getPullRequestsProcessingIndicatorProps()

    jest.useFakeTimers()
    const currTime = new Date('2023-08-31T00:00:00Z')
    jest.setSystemTime(currTime)
    const pushedAtTime = new Date(currTime.getTime() - 20000)

    render(<PullRequestsProcessingIndicatorWithDataFetching {...props} />)

    await act(() => {
      mockFetch.resolvePendingRequest(props.processingIndicatorUrl, {
        stale: true,
        latest_unsynced_push_to_head_ref_at: pushedAtTime,
      })
    })

    expect(screen.getByText('Processing updates')).toBeVisible()
    expectAnalyticsEvents({
      type: 'pull_requests.processing_indicator',
      target: '',
      data: {
        repositoryId: props.repositoryId.toString(),
        pullRequestId: props.pullRequestId.toString(),
        secondsSinceLastPush: '20',
      },
    })
  })

  test('renders nothing when PR is stale and it has been more than a day since the last push to the head ref', async () => {
    const props = getPullRequestsProcessingIndicatorProps()

    jest.useFakeTimers()
    const currTime = new Date('2023-08-31T00:00:00Z')
    jest.setSystemTime(currTime)
    const oneDayAgoMilliseconds = 24 * 60 * 60 * 1000
    const pushedAtTime = new Date(currTime.getTime() - oneDayAgoMilliseconds)

    render(<PullRequestsProcessingIndicatorWithDataFetching {...props} />)

    await act(() => {
      mockFetch.resolvePendingRequest(props.processingIndicatorUrl, {
        stale: true,
        latest_unsynced_push_to_head_ref_at: pushedAtTime,
      })
    })

    expect(screen.queryByText('Processing updates')).toBeNull()
  })

  test('renders nothing if the API call fails', async () => {
    const props = getPullRequestsProcessingIndicatorProps()

    render(<PullRequestsProcessingIndicatorWithDataFetching {...props} />)

    await act(() => {
      mockFetch.rejectPendingRequest(props.processingIndicatorUrl, 'whoops!')
    })

    expect(screen.queryByText('Processing updates')).toBeNull()
  })
})
