import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import {render} from '@github-ui/react-core/test-utils'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {act, screen, waitFor} from '@testing-library/react'
import {useRef} from 'react'
import {ConnectionHandler, graphql, RelayEnvironmentProvider, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {CommentEditsContextProvider, useCommentEditsContext} from '../../../contexts/CommentEditsContext'
import type {MarkdownComposerRef} from '../../../hooks/use-markdown-body'
import {PullRequestCommentComposer} from '../PullRequestCommentComposer'
import type {PullRequestCommentComposerTestQuery} from './__generated__/PullRequestCommentComposerTestQuery.graphql'

jest.setTimeout(15_000)

const testPullRequestId = 'PR_kwAECA'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
}

function TestComponent({environment}: TestComponentProps) {
  const TestComponentWithQuery = () => {
    const data = useLazyLoadQuery<PullRequestCommentComposerTestQuery>(
      graphql`
        query PullRequestCommentComposerTestQuery($id: ID!) @relay_test_operation {
          pullRequest: node(id: $id) {
            ... on PullRequest {
              # eslint-disable-next-line relay/unused-fields
              backwardTimeline: timelineItems(last: 10, itemTypes: [ISSUE_COMMENT, PULL_REQUEST_REVIEW])
                @connection(key: "PullRequestTimelineBackwardPagination_backwardTimeline") {
                # eslint-disable-next-line relay/unused-fields
                edges {
                  # eslint-disable-next-line relay/unused-fields
                  node {
                    __id
                    __typename
                    # eslint-disable-next-line relay/must-colocate-fragment-spreads
                    ...IssueComment_issueComment
                    # eslint-disable-next-line relay/must-colocate-fragment-spreads
                    ...ReactionViewerGroups
                  }
                }
              }
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...PullRequestCommentComposer_pullRequest
            }
          }
        }
      `,
      {id: testPullRequestId},
    )

    const appPayload = useAppPayload<
      | {
          current_user_settings?: {
            use_monospace_font: boolean
          }
          paste_url_link_as_plain_text: boolean
        }
      | undefined
    >()

    const pullRequest = data.pullRequest
    const composerRef = useRef<MarkdownComposerRef>(null)
    const {startCommentEdit, cancelCommentEdit} = useCommentEditsContext()
    const pasteUrlsAsPlainText = appPayload?.paste_url_link_as_plain_text || true
    const useMonospaceFont = appPayload?.current_user_settings?.use_monospace_font || true

    const commentBoxConfig: CommentBoxConfig = {
      pasteUrlsAsPlainText,
      useMonospaceFont,
    }

    if (!pullRequest) {
      return null
    }

    return (
      <PullRequestCommentComposer
        ref={composerRef}
        commentBoxConfig={commentBoxConfig}
        connectionId={ConnectionHandler.getConnectionID(
          testPullRequestId,
          `PullRequestTimelineBackwardPagination_backwardTimeline`,
          {
            itemTypes: ['ISSUE_COMMENT', 'PULL_REQUEST_REVIEW'],
          },
        )}
        pullRequest={pullRequest}
        onCancel={() => cancelCommentEdit('new-comment')}
        onChange={() => startCommentEdit('new-comment')}
        onSave={() => cancelCommentEdit('new-comment')}
      />
    )
  }

  return (
    <RelayEnvironmentProvider environment={environment}>
      <CommentEditsContextProvider>
        <TestComponentWithQuery />
      </CommentEditsContextProvider>
    </RelayEnvironmentProvider>
  )
}

afterEach(() => {
  sessionStorage.clear()
})

test('can submit a PR level comment', async () => {
  const environment = createMockEnvironment()
  const commentBodyText = 'comment to test clearing out textarea'

  const {user} = render(<TestComponent environment={environment} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            id: testPullRequestId,
            state: 'OPEN',
            viewerCanComment: true,
          }
        },
      }),
    )
  })

  const commentTextBox = screen.getByPlaceholderText('Leave a comment')
  expect(commentTextBox).toHaveValue('')

  await user.type(commentTextBox, commentBodyText)
  expect(commentTextBox).toHaveValue(commentBodyText)

  const commentButton = screen.getByRole('button', {name: 'Comment'})
  await screen.findByPlaceholderText('Leave a comment')
  await user.click(commentButton)

  expect(commentButton).toBeDisabled()

  const recentOperation = environment.mock.getMostRecentOperation()
  expect(recentOperation.fragment.node.name).toBe('addCommentMutation')

  // mock mutation response
  act(() => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation)
    })
  })

  await waitFor(() => expect(commentTextBox.textContent).toBe(''))
})

test('can close a PR', async () => {
  const environment = createMockEnvironment()

  const {user} = render(<TestComponent environment={environment} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            id: testPullRequestId,
            state: 'OPEN',
            viewerCanComment: true,
            viewerCanReopen: true,
            viewerCanClose: true,
          }
        },
      }),
    )
  })

  const closeButton = screen.getByRole('button', {name: 'Close pull request'})

  expect(closeButton).toHaveTextContent('Close pull request')
  await user.click(closeButton)

  // mock mutation response
  act(() => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            id: testPullRequestId,
            state: 'CLOSED',
            viewerCanReopen: true,
          }
        },
      })
    })
  })

  const reopenButton = await screen.findByRole('button', {name: 'Reopen pull request'})
  expect(reopenButton).toBeDefined()
})

test('can close a PR with a comment', async () => {
  const environment = createMockEnvironment()

  const {user} = render(<TestComponent environment={environment} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            id: testPullRequestId,
            state: 'OPEN',
            viewerCanComment: true,
            viewerCanReopen: true,
            viewerCanClose: true,
          }
        },
      }),
    )
  })

  const commentTextBox = screen.getByPlaceholderText('Leave a comment')
  expect(commentTextBox).toHaveValue('')

  await user.type(commentTextBox, 'Closing with comment')
  expect(commentTextBox).toHaveValue('Closing with comment')

  const closeButton = await screen.findByRole('button', {name: 'Close with comment'})

  expect(closeButton).toHaveTextContent('Close with comment')

  await user.click(closeButton)

  // mock mutation response
  act(() => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            id: testPullRequestId,
            state: 'CLOSED',
            viewerCanReopen: true,
          }
        },
      })
    })
  })

  await screen.findByRole('button', {name: 'Reopen pull request'})
})

test('can reopen a PR', async () => {
  const environment = createMockEnvironment()

  const {user} = render(<TestComponent environment={environment} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            id: testPullRequestId,
            state: 'CLOSED',
            viewerCanComment: true,
            viewerCanReopen: true,
            viewerCanClose: true,
          }
        },
      }),
    )
  })

  const reopenButton = screen.getByRole('button', {name: 'Reopen pull request'})

  await user.click(reopenButton)

  // mock mutation response
  act(() => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return {
            id: testPullRequestId,
            state: 'OPEN',
            viewerCanClose: true,
          }
        },
      })
    })
  })

  const closeButton = await screen.findByRole('button', {name: 'Close pull request'})
  expect(closeButton).toBeDefined()
})
