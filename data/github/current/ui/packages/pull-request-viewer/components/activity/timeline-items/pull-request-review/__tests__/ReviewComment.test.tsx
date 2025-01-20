import {render} from '@github-ui/react-core/test-utils'
import {act, screen, within} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../../../../contexts/PullRequestContext'
import {decrementConnectionCount, updateTotalCommentsCount} from '../../../../../helpers/mutation-helpers'
import PullRequestsAppWrapper from '../../../../../test-utils/PullRequestsAppWrapper'
import {buildComment, buildReviewThread} from '../../../../../test-utils/query-data'
import {ReviewComment} from '../ReviewComment'
import type {ReviewCommentTestQuery} from './__generated__/ReviewCommentTestQuery.graphql'

jest.mock('../../../../../helpers/mutation-helpers', () => {
  return {
    decrementConnectionCount: jest.fn(),
    updateTotalCommentsCount: jest.fn(),
  }
})

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId: string
}

function TestComponent({environment, pullRequestId}: TestComponentProps) {
  const WrappedComponent = () => {
    const data = useLazyLoadQuery<ReviewCommentTestQuery>(
      graphql`
        query ReviewCommentTestQuery($pullRequestReviewId: ID!) @relay_test_operation {
          pullRequestReviewComment: node(id: $pullRequestReviewId) {
            ...ReviewComment_pullRequestReviewComment
          }
        }
      `,
      {pullRequestReviewId: 'mock'},
    )

    if (!data.pullRequestReviewComment) return null

    return <ReviewComment comment={data.pullRequestReviewComment} />
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <PullRequestContextProvider
        headRefOid="mock"
        isInMergeQueue={false}
        pullRequestId={pullRequestId}
        repositoryId="mock"
        state="OPEN"
      >
        <WrappedComponent />
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

describe('deleting a review comment', () => {
  test('updates total comment count', async () => {
    const environment = createMockEnvironment()
    const pullRequestId = 'test-id'
    const comment = buildComment({bodyHTML: 'test comment 1'})
    const thread = buildReviewThread({comments: [comment]})

    const {user} = render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequestReviewComment() {
            return {
              ...comment,
              path: 'README.md',
              pullRequestThread: thread,
            }
          },
        }),
      )
    })

    const actionMenu = await screen.findByLabelText('Comment actions')
    await user.click(actionMenu)

    const deleteAction = screen.getByLabelText('Delete')

    await user.click(deleteAction)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation))
    })

    expect(decrementConnectionCount).toHaveBeenCalledWith(
      // Relay store
      expect.anything(),
      // Threads Connection ID, which doesn't exist on this object currently
      undefined,
      'totalCommentsCount',
    )
    expect(updateTotalCommentsCount).toHaveBeenCalledWith(
      // Relay store
      expect.anything(),
      pullRequestId,
      'README.md',
      'decrement',
    )
  })
})
test('comment is reactable', async () => {
  const environment = createMockEnvironment()
  const pullRequestId = 'test-id'
  const comment = buildComment({bodyHTML: 'test comment 1'})
  const thread = buildReviewThread({comments: [comment]})

  const {user} = render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequestReviewComment() {
          return {
            ...comment,
            path: 'README.md',
            pullRequestThread: thread,
          }
        },
      }),
    )
  })
  expect(screen.getByRole('button', {name: 'All reactions'})).toBeVisible()

  const reactionButton = screen.getByRole('button', {name: 'All reactions'})
  await user.click(reactionButton)
  const reactionsToolbar = screen.getByRole('menu')
  const confusedEmoji = within(reactionsToolbar).getByText('😕')
  await user.click(confusedEmoji)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.fragment.node.name).toEqual('addReactionMutation')
      return MockPayloadGenerator.generate(operation)
    })
  })
})
