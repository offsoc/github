import {buildPullRequestDiffThread, buildStaticDiffLine} from '@github-ui/conversations'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {act, fireEvent, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'

import {PullRequestContextProvider} from '../../../../contexts/PullRequestContext'
import updatePullRequestReview from '../../../../mutations/update-pull-request-review-mutation'
import PullRequestsAppWrapper from '../../../../test-utils/PullRequestsAppWrapper'
import {buildComment, buildReview, buildReviewThread} from '../../../../test-utils/query-data'
import {PullRequestReview} from '../PullRequestReview'
import type {PullRequestReviewTestQuery} from './__generated__/PullRequestReviewTestQuery.graphql'

jest.mock('../../../../mutations/update-pull-request-review-mutation', () => ({
  __esModule: true,
  default: jest.fn(),
}))

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestReviewId: string
}

function TestComponent({environment, pullRequestReviewId}: TestComponentProps) {
  const WrappedComponent = () => {
    const data = useLazyLoadQuery<PullRequestReviewTestQuery>(
      graphql`
        query PullRequestReviewTestQuery($pullRequestReviewId: ID!) @relay_test_operation {
          pullRequestReview: node(id: $pullRequestReviewId) {
            ...PullRequestReview_pullRequestReview
          }
          viewer {
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...Thread_viewer
          }
        }
      `,
      {pullRequestReviewId},
    )

    if (!data.pullRequestReview) return null

    return <PullRequestReview navigate={noop} queryRef={data.pullRequestReview} viewer={data.viewer} />
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId="mock">
      <PullRequestContextProvider
        headRefOid="mock"
        isInMergeQueue={false}
        pullRequestId="mock"
        repositoryId="mock"
        state="OPEN"
      >
        <WrappedComponent />
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

test('The timeline shows a review with comments and threads', async () => {
  const environment = createMockEnvironment()
  const commentReply = {
    ...buildComment({bodyHTML: 'comment body'}),
    currentDiffResourcePath: '',
    path: 'path/to/file/comment.rb',
    pullRequestThread: {id: 'test-id', isOutdated: false, isResolved: false},
    __typename: 'PullRequestReviewComment',
  }
  const thread = buildReviewThread({
    comments: [buildComment({bodyHTML: 'thread comment body'}), buildComment({bodyHTML: 'thread comment body 1'})],
    isOutdated: false,
    isResolved: false,
    path: 'path/to/file/thread.rb',
    line: 3,
  })
  const review = buildReview({
    login: 'monalisa',
    threadsAndReplies: [thread, commentReply],
    state: 'APPROVED',
    bodyHTML: 'review with a comment',
    bodyText: 'review with a comment',
  })

  render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequestReview() {
          return review
        },
      }),
    )
  })

  const openCommentsButton = screen.getByRole('button', {name: 'Collapse 3 review comments in 2 threads'})
  expect(openCommentsButton).toBeVisible()

  const cachedReviewCollapsedStateKey = `timeline-pull-request-review-collapsed-state-${review.id}`
  expect(window.localStorage.getItem(cachedReviewCollapsedStateKey)).toBe(null)

  expect(screen.getByText('path/to/file/comment.rb')).toBeVisible()
  expect(screen.getByText('path/to/file/thread.rb')).toBeVisible()
  expect(screen.getByText('Line 3')).toBeVisible()
  expect(screen.getByText('thread comment body')).toBeVisible()
  expect(screen.getByText('thread comment body 1')).toBeVisible()
  expect(screen.getByText('comment body')).toBeVisible()
  expect(screen.getByText('review with a comment')).toBeVisible()
  expect(screen.getByText('approved these changes')).toBeVisible()
  expect(screen.getByText('Contributor')).toBeVisible()

  const closeCommentsButtons = screen.getAllByLabelText('Close review comment')
  expect(closeCommentsButtons).toHaveLength(2)
  userEvent.click(closeCommentsButtons[0]!)

  expect(screen.getByLabelText('Open review comment')).toBeVisible()
  const cachedReviewThreadCollapsedStateKey = `timeline-pull-request-review-thread-collapsed-state-${thread.id}`
  expect(window.localStorage.getItem(cachedReviewThreadCollapsedStateKey)).toBe('true')
})

test('A timeline thread shows diffline information preview for review associated to diffline(s)', async () => {
  const environment = createMockEnvironment()
  const commentReply = {
    ...buildComment({bodyHTML: 'comment body'}),
    currentDiffResourcePath: '',
    path: 'path/to/file/comment.rb',
    pullRequestThread: {id: 'test-id', isOutdated: false, isResolved: false},
    __typename: 'PullRequestReviewComment',
  }
  const diffLineOneText = '@@ -0,0 +1 @@'
  const diffLineTwoText = 'def drive'
  const diffLineThreeText = 'puts "still driving"'
  const diffLineFourText = 'end'
  const diffLineFiveText = '- // todo delete me'
  const diffLineSixText = '+ it was deleted and changed'
  const thread = buildReviewThread({
    comments: [buildComment({bodyHTML: 'thread comment body'})],
    isOutdated: false,
    isResolved: false,
    path: 'path/to/file/thread.rb',
    line: 3,
    subject: buildPullRequestDiffThread({
      abbreviatedOid: '1234567',
      startDiffSide: 'RIGHT',
      endDiffSide: 'RIGHT',
      originalStartLine: 4,
      originalEndLine: 4,
      diffLines: [
        buildStaticDiffLine({
          type: 'HUNK',
          text: diffLineOneText,
          left: 0,
          right: 0,
          html: '@@ -0,0 +1 @@',
        }),
        buildStaticDiffLine({
          type: 'CONTEXT',
          text: diffLineTwoText,
          left: 1,
          right: 1,
          html: '<span>def drive</span>',
        }),
        buildStaticDiffLine({
          type: 'CONTEXT',
          text: diffLineThreeText,
          left: 2,
          right: 2,
          html: '<span>puts "still driving"</span>',
        }),
        buildStaticDiffLine({
          type: 'CONTEXT',
          text: diffLineFourText,
          left: 3,
          right: 3,
          html: `<span>end</span>`,
        }),
        buildStaticDiffLine({
          type: 'DELETION',
          text: diffLineFiveText,
          left: 4,
          right: 3,
          html: `<span>- // todo delete me</span>`,
        }),
        buildStaticDiffLine({
          type: 'ADDITION',
          text: diffLineSixText,
          right: 4,
          left: 4,
          html: `<span>+ it was deleted and changed</span>`,
        }),
      ],
    }),
  })
  const review = buildReview({
    login: 'monalisa',
    threadsAndReplies: [thread, commentReply],
  })

  render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequestReview() {
          return review
        },
      }),
    )
  })

  const openCommentsButton = screen.getByRole('button', {name: 'Collapse 2 review comments in 2 threads'})
  expect(openCommentsButton).toBeVisible()

  // Assert Diff Preview Table Headers
  screen.getByText('Original file line number')
  screen.getByText('Diff line number')
  screen.getByText('Diff line change')

  // Assert Diff Preview Table Rows text content
  screen.getByText(diffLineOneText)
  screen.getByText(diffLineTwoText)
  screen.getByText(diffLineThreeText)
  screen.getByText(diffLineFourText)
  screen.getByText(diffLineFiveText)
  screen.getByText(diffLineSixText)
})

test(`A timeline thread doesn't show diffline information preview for reviews not associated to diffline(s)`, async () => {
  const environment = createMockEnvironment()
  const commentReply = {
    ...buildComment({bodyHTML: 'comment body'}),
    currentDiffResourcePath: '',
    path: 'path/to/file/comment.rb',
    pullRequestThread: {id: 'test-id', isOutdated: false, isResolved: false},
    __typename: 'PullRequestReviewComment',
  }
  const thread = buildReviewThread({
    comments: [buildComment({bodyHTML: 'thread comment body'})],
    isOutdated: false,
    isResolved: false,
    path: 'path/to/file/thread.rb',
  })
  const review = buildReview({
    login: 'monalisa',
    threadsAndReplies: [thread, commentReply],
  })

  render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequestReview() {
          return review
        },
      }),
    )
  })

  const openCommentsButton = screen.getByRole('button', {name: 'Collapse 2 review comments in 2 threads'})
  expect(openCommentsButton).toBeVisible()

  // Assert Diff Preview Table Headers
  expect(screen.queryByText('Original file line number')).toBeNull()
  expect(screen.queryByText('Diff line number')).toBeNull()
  expect(screen.queryByText('Diff line change')).toBeNull()
})

describe('asserting outdated and resolved thread labels', () => {
  test(`A timeline thread shows the outdated label`, async () => {
    const environment = createMockEnvironment()
    const thread = buildReviewThread({
      comments: [buildComment({bodyHTML: 'thread comment body'})],
      isOutdated: true,
      isResolved: false,
      path: 'path/to/file/thread.rb',
    })
    const review = buildReview({
      login: 'monalisa',
      threadsAndReplies: [thread],
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.getByText('Outdated')).toBeVisible()
  })

  test(`A timeline thread shows the resolved label`, async () => {
    const environment = createMockEnvironment()
    const thread = buildReviewThread({
      comments: [buildComment({bodyHTML: 'thread comment body'})],
      isOutdated: false,
      isResolved: true,
      path: 'path/to/file/thread.rb',
    })
    const review = buildReview({
      login: 'monalisa',
      threadsAndReplies: [thread],
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.getByText('Resolved')).toBeVisible()
  })

  test(`A timeline thread either shows resolved or outdated, never both`, async () => {
    const environment = createMockEnvironment()
    const thread = buildReviewThread({
      comments: [buildComment({bodyHTML: 'thread comment body'})],
      isOutdated: true,
      isResolved: true,
      path: 'path/to/file/thread.rb',
    })
    const review = buildReview({
      login: 'monalisa',
      threadsAndReplies: [thread],
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.queryByText('Outdated')).toBeNull()
    expect(screen.getByText('Resolved')).toBeVisible()
  })
})

describe('editing reviews', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('when review has no text, Edit option is not visible in action menu', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({
      bodyHTML: '',
      bodyText: '',
      viewerCanUpdate: true,
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.queryByLabelText('Comment actions')).not.toBeInTheDocument()
  })

  test('when review has text, Edit option is visible in action menu', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({
      bodyHTML: 'review with a comment',
      bodyText: 'review with a comment',
      viewerCanUpdate: true,
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    expect(screen.getByLabelText('Comment actions')).toBeInTheDocument()
  })

  test('submitting saves the updated review text', async () => {
    const environment = createMockEnvironment()
    const review = buildReview({
      bodyHTML: 'review with a comment',
      bodyText: 'review with a comment',
      viewerCanUpdate: true,
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    const actionMenu = screen.getByLabelText('Comment actions')
    fireEvent.click(actionMenu)

    const editMenuOption = await screen.findByLabelText('Edit')
    fireEvent.click(editMenuOption)

    const updatedReviewText = 'This is an updated review'
    const editReviewTextbox = screen.getByRole('textbox')
    // clear the input before typing
    userEvent.clear(editReviewTextbox)
    userEvent.type(editReviewTextbox, updatedReviewText)

    const updateButton = screen.getByRole('button', {name: 'Update'})
    fireEvent.click(updateButton)

    // verify mutation was called with the new updated text and correct review id.
    expect(updatePullRequestReview).toHaveBeenCalledWith(
      expect.objectContaining({input: {body: updatedReviewText, pullRequestReviewId: review.id}}),
    )
  })

  test('cancelling does not save the updated review text and hides the text editor', async () => {
    const environment = createMockEnvironment()
    const originalReviewText = 'review with a comment'
    const review = buildReview({
      bodyHTML: originalReviewText,
      bodyText: originalReviewText,
      viewerCanUpdate: true,
    })

    render(<TestComponent environment={environment} pullRequestReviewId="test-id" />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReview() {
            return review
          },
        }),
      )
    })

    const actionMenu = screen.getByLabelText('Comment actions')
    fireEvent.click(actionMenu)

    const editMenuOption = await screen.findByLabelText('Edit')
    fireEvent.click(editMenuOption)

    const updatedReviewText = 'This is an updated review'
    const editReviewTextbox = screen.getByRole('textbox')
    // clear the input before typing
    userEvent.clear(editReviewTextbox)
    userEvent.type(editReviewTextbox, updatedReviewText)

    const cancelButton = screen.getByRole('button', {name: 'Cancel'})
    fireEvent.click(cancelButton)

    // the editor should be hidden
    expect(screen.queryByRole('textbox')).toBeNull()

    // the review should not have been updated
    expect(screen.getByText(originalReviewText)).toBeVisible()
  })
})
