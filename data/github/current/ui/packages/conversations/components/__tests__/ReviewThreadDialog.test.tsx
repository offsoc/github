import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {
  buildComment,
  buildReviewThread,
  flattenThreadsForNavigation,
  mockCommentingImplementation,
  mockMarkerNavigationImplementation,
  threadSummary,
} from '../../test-utils/query-data'
import type {CommentingImplementation, MarkerNavigationImplementation, Thread, ThreadSummary} from '../../types'
import {ReviewThreadDialog} from '../ReviewThreadDialog'

// Mock child components that fetch data on render, since we're not testing that functionality here
jest.mock('@github-ui/markdown-edit-history-viewer/MarkdownEditHistoryViewer', () => ({
  MarkdownEditHistoryViewer: () => null,
}))

jest.mock('@github-ui/reaction-viewer/ReactionViewer', () => ({
  ReactionViewer: () => null,
}))

interface TestComponentProps {
  commentingImplementation?: CommentingImplementation
  markerNavigationImplementation?: MarkerNavigationImplementation
  filePath?: string
  thread: Thread
  threads: ThreadSummary[]
}

function TestComponent({
  thread,
  threads,
  commentingImplementation,
  markerNavigationImplementation,
  filePath = 'README.md',
}: TestComponentProps) {
  return (
    <AnalyticsProvider appName="test-app" category="test-category" metadata={{}}>
      <ReviewThreadDialog
        batchingEnabled={false}
        batchPending={false}
        repositoryId="repository-test-id"
        subjectId="pullRequest-test-id"
        thread={thread}
        commentingImplementation={commentingImplementation ?? mockCommentingImplementation}
        markerNavigationImplementation={markerNavigationImplementation ?? mockMarkerNavigationImplementation}
        filePath={filePath}
        threads={threads}
        onClose={noop}
        onRefreshThread={noop}
        onThreadSelected={noop}
      />
    </AnalyticsProvider>
  )
}

describe('review thread dialog', () => {
  test('renders the comment in the thread dialog', async () => {
    const markerNavigationImplementation = {
      incrementActiveMarker: jest.fn(),
      decrementActiveMarker: jest.fn(),
      filteredMarkers: [],
    }

    const thread = buildReviewThread({
      comments: [buildComment({id: 'comment-1', bodyHTML: 'hello world', body: 'hello world'})],
    })

    render(
      <TestComponent
        thread={thread}
        markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
        threads={threadSummary([thread])}
      />,
    )

    expect(screen.getByText('hello world')).toBeVisible()
  })

  test('renders resolved label if thread is resolved', async () => {
    const markerNavigationImplementation = {
      incrementActiveMarker: jest.fn(),
      decrementActiveMarker: jest.fn(),
      filteredMarkers: [],
    }

    const thread = buildReviewThread({
      comments: [buildComment({id: 'comment-1', bodyHTML: 'hello world', body: 'hello world'})],
      isResolved: true,
    })

    render(
      <TestComponent
        thread={thread}
        markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
        threads={threadSummary([thread])}
      />,
    )

    expect(screen.getByText('Resolved')).toBeVisible()
  })

  test('does not render resolved label if thread is unresolved', async () => {
    const markerNavigationImplementation = {
      incrementActiveMarker: jest.fn(),
      decrementActiveMarker: jest.fn(),
      filteredMarkers: [],
    }

    const thread = buildReviewThread({
      comments: [buildComment({id: 'comment-1', bodyHTML: 'hello world', body: 'hello world'})],
      isResolved: false,
    })

    render(
      <TestComponent
        thread={thread}
        markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
        threads={threadSummary([thread])}
      />,
    )

    expect(screen.queryByText('Resolved')).toBeNull()
  })

  test('shows thread resolve action by default', async () => {
    const thread = buildReviewThread({
      comments: [buildComment({id: 'comment-1', bodyHTML: 'hello world', body: 'hello world'})],
      isResolved: false,
    })

    render(<TestComponent thread={thread} threads={threadSummary([thread])} />)

    expect(screen.getByText('Resolve conversation')).toBeInTheDocument()
  })

  test('can disable thread resolving with commenting implementation', async () => {
    const thread = buildReviewThread({
      comments: [buildComment({id: 'comment-1', bodyHTML: 'hello world', body: 'hello world'})],
      isResolved: false,
    })

    render(
      <TestComponent
        thread={thread}
        threads={threadSummary([thread])}
        commentingImplementation={{...mockCommentingImplementation, resolvingEnabled: false}}
      />,
    )

    expect(screen.queryByText('Resolve conversation')).not.toBeInTheDocument()
  })
})

describe('review thread dialog header for global marker navigation', () => {
  test('does not render the left/right arrows if there is only one marker to navigate through', () => {
    const thread = buildReviewThread({
      comments: [buildComment({id: 'comment-1', bodyHTML: 'hello world', body: 'hello world'})],
      isResolved: false,
    })

    const markerNavigationImplementation = {
      incrementActiveMarker: jest.fn(),
      decrementActiveMarker: jest.fn(),
      filteredMarkers: flattenThreadsForNavigation([thread]),
    }

    render(
      <TestComponent
        thread={thread}
        markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
        threads={threadSummary([thread])}
      />,
    )

    expect(screen.queryByLabelText('Load previous marker')).toBeNull()
    expect(screen.queryByLabelText('Load next marker')).toBeNull()
  })

  test('renders the left/right arrows and position if the thread is in the collection of navigable markers and there is more than one navigable marker', () => {
    const thread1 = buildReviewThread({
      comments: [buildComment({id: 'comment-1'})],
      isResolved: false,
    })
    const thread2 = buildReviewThread({
      comments: [buildComment({id: 'comment-2'})],
      isResolved: false,
    })

    const markerNavigationImplementation = {
      incrementActiveMarker: jest.fn(),
      decrementActiveMarker: jest.fn(),
      filteredMarkers: flattenThreadsForNavigation([thread1, thread2]),
    }

    render(
      <TestComponent
        thread={thread2}
        markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
        threads={threadSummary([thread1, thread2])}
      />,
    )

    expect(screen.getByLabelText('Load previous marker')).toBeInTheDocument()
    expect(screen.getByLabelText('Load next marker')).toBeInTheDocument()
    // e.g. 2 of 2
    expect(screen.getAllByText('2')).toHaveLength(2)
  })

  test('does not render the left/right arrows if the thread is not in the collection of navigable markers, e.g. the thread is resolved', () => {
    const thread1 = buildReviewThread({
      comments: [buildComment({id: 'comment-1'})],
      isResolved: true,
    })
    const thread2 = buildReviewThread({
      comments: [buildComment({id: 'comment-2'})],
      isResolved: false,
    })
    const thread3 = buildReviewThread({
      comments: [buildComment({id: 'comment-3'})],
      isResolved: false,
    })

    const markerNavigationImplementation = {
      incrementActiveMarker: jest.fn(),
      decrementActiveMarker: jest.fn(),
      filteredMarkers: flattenThreadsForNavigation([thread2, thread3]),
    }

    render(
      <TestComponent
        thread={thread1}
        markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
        threads={threadSummary([thread1, thread2, thread3])}
      />,
    )

    expect(screen.queryByLabelText('Load previous marker')).toBeNull()
    expect(screen.queryByLabelText('Load next marker')).toBeNull()
  })
})
