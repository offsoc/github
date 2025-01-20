import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'

import {buildComment, buildReviewThread, mockCommentingImplementation} from '../../test-utils/query-data'
import type {Thread} from '../../types'
import {ReviewThread} from '../ReviewThread'

// Mock child components that fetch data on render, since we're not testing that functionality here
jest.mock('@github-ui/markdown-edit-history-viewer/MarkdownEditHistoryViewer', () => ({
  MarkdownEditHistoryViewer: () => null,
}))

jest.mock('@github-ui/reaction-viewer/ReactionViewer', () => ({
  ReactionViewer: () => null,
}))

function TestComponent({thread}: {thread: Thread}) {
  return (
    <AnalyticsProvider appName="test-app" category="test-category" metadata={{}}>
      <ReviewThread
        batchingEnabled={false}
        batchPending={false}
        commentingImplementation={mockCommentingImplementation}
        filePath="README.md"
        thread={thread}
        repositoryId="test-id"
        subjectId="test-id"
      />
    </AnalyticsProvider>
  )
}

test('renders the comments in the thread', async () => {
  const comment1 = buildComment({bodyHTML: 'test comment 1'})
  const comment2 = buildComment({bodyHTML: 'test comment 2'})
  const thread = buildReviewThread({
    isResolved: true,
    comments: [comment1, comment2],
  })

  render(<TestComponent thread={thread} />)

  expect(screen.getByText('test comment 1')).toBeVisible()
  expect(screen.getByText('test comment 2')).toBeVisible()
})

test('renders the reply box if the viewer has the ability to reply to a thread and sends analytics', async () => {
  const comment1 = buildComment({bodyHTML: 'test comment 1'})
  const comment2 = buildComment({bodyHTML: 'test comment 2'})
  const thread = buildReviewThread({
    isResolved: true,
    viewerCanReply: true,
    comments: [comment1, comment2],
  })

  render(<TestComponent thread={thread} />)

  const replyButton = screen.getByRole('button', {name: 'Write a reply'})
  expect(replyButton).toBeVisible()

  act(() => {
    replyButton.click()
  })

  const cancelButton = screen.getByRole('button', {name: 'Cancel'})
  expect(cancelButton).toBeVisible()

  act(() => {
    cancelButton.click()
  })

  expectAnalyticsEvents(
    {
      type: 'comments.start_thread_reply',
      target: 'REPLY_TO_THREAD_INPUT_BUTTON',
      data: {
        app_name: 'test-app',
      },
    },
    {
      type: 'comments.cancel_thread_reply',
      target: 'CANCEL_REVIEW_THREAD_BUTTON',
      data: {
        app_name: 'test-app',
      },
    },
  )
})

test('does not render the reply box if the viewer does not have the ability to reply to a thread', async () => {
  const comment1 = buildComment({bodyHTML: 'test comment 1'})
  const comment2 = buildComment({bodyHTML: 'test comment 2'})
  const thread = buildReviewThread({
    isResolved: true,
    viewerCanReply: false,
    comments: [comment1, comment2],
  })

  render(<TestComponent thread={thread} />)

  expect(screen.queryByRole('button', {name: 'Write a reply'})).not.toBeInTheDocument()
})
