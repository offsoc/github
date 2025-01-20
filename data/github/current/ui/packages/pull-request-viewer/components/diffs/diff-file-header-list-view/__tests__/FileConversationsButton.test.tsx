import {ensurePreviousActiveDialogIsClosed} from '@github-ui/conversations/ensure-previous-active-dialog-is-closed'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../../../contexts/PullRequestContext'
import {PullRequestMarkersDialogContextProvider} from '../../../../contexts/PullRequestMarkersContext'
import PullRequestsAppWrapper from '../../../../test-utils/PullRequestsAppWrapper'
import {
  buildComment,
  buildCommentAuthor,
  buildDiffEntry,
  buildPullRequest,
  buildReviewThread,
  buildViewer,
  type PullRequestThread,
} from '../../../../test-utils/query-data'
import FileConversationsButton from '../FileConversationsButton'
import type {FileConversationsButtonTestQuery} from './__generated__/FileConversationsButtonTestQuery.graphql'

jest.setTimeout(4000)

jest.mock('@github-ui/conversations/ensure-previous-active-dialog-is-closed')
const ensurePreviousActiveDialogIsClosedMock = jest.mocked(ensurePreviousActiveDialogIsClosed)

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
  viewerCanComment?: boolean
}

function TestComponent({environment, pullRequestId = 'PR_kwAEAg', viewerCanComment = true}: TestComponentProps) {
  const FileConversationsButtonWithRelayQuery = () => {
    const data = useLazyLoadQuery<FileConversationsButtonTestQuery>(
      graphql`
        query FileConversationsButtonTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              comparison {
                diffEntries(first: 20) {
                  nodes {
                    ...FileConversationsButton_diffEntry
                  }
                }
              }
            }
          }
          viewer {
            ...FileConversationsButton_viewer
          }
        }
      `,
      {
        pullRequestId,
      },
    )

    const diffEntry = data.pullRequest?.comparison?.diffEntries.nodes?.[0]
    if (!diffEntry) {
      return null
    }

    return (
      <FileConversationsButton
        activeGlobalMarkerID={undefined}
        diffEntry={diffEntry}
        viewer={data.viewer}
        onActivateGlobalMarkerNavigation={jest.fn()}
      />
    )
  }

  return (
    <PullRequestContextProvider
      headRefOid="mock"
      isInMergeQueue={false}
      pullRequestId="test"
      repositoryId="test"
      state="OPEN"
      viewerCanComment={viewerCanComment}
    >
      <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
        <PullRequestMarkersDialogContextProvider
          annotationMap={{}}
          diffAnnotations={[]}
          filteredFiles={new Set()}
          setGlobalMarkerNavigationState={jest.fn()}
          threads={[]}
        >
          <FileConversationsButtonWithRelayQuery />
        </PullRequestMarkersDialogContextProvider>
      </PullRequestsAppWrapper>
    </PullRequestContextProvider>
  )
}

describe('Adding a file level comment', () => {
  test('Renders add a file comment button if there are no conversations and the viewer has permission to comment', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry()],
            })
          },
        }),
      )
    })

    expect(screen.getByLabelText('Add a file comment')).toBeInTheDocument()
  })

  test('Does not render add a file comment button if there are no conversations and the viewer does not have permission to comment', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} viewerCanComment={false} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry()],
            })
          },
        }),
      )
    })

    expect(screen.queryByLabelText('Add a file comment')).not.toBeInTheDocument()
  })

  test('ensures that previous active dialog is closed when clicked', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} viewerCanComment={true} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {viewerCanEditFiles: true}
          },
        }),
      )
    })

    await user.click(screen.getByLabelText('Add a file comment'))
    expect(ensurePreviousActiveDialogIsClosedMock).toHaveBeenCalled()
  })

  test('Renders add a file comment button with plus icon if there are conversations', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    const reviewThread = buildReviewThread({comments: [buildComment({bodyHTML: 'test comment'})]})

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [
                buildDiffEntry({
                  threads: {
                    threads: [reviewThread as unknown as PullRequestThread],
                    totalCommentsCount: 1,
                  },
                  outdatedThreads: {
                    threads: [],
                    totalCommentsCount: 0,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    expect(screen.getByLabelText('Add a file comment')).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        'View file comments and outdated comments. This file has 1 comment and 0 outdated comments.',
      ),
    ).toBeInTheDocument()
  })

  test('Renders add a file comment button but no plus icon if there are conversations and the viewer does not have permission to comment', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} viewerCanComment={false} />)

    const reviewThread = buildReviewThread({comments: [buildComment({bodyHTML: 'test comment'})]})

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [
                buildDiffEntry({
                  threads: {
                    threads: [reviewThread as unknown as PullRequestThread],
                    totalCommentsCount: 1,
                  },
                  outdatedThreads: {
                    threads: [],
                    totalCommentsCount: 0,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    expect(screen.queryByLabelText('Add a file comment')).not.toBeInTheDocument()
    expect(
      screen.getByLabelText(
        'View file comments and outdated comments. This file has 1 comment and 0 outdated comments.',
      ),
    ).toBeInTheDocument()
  })

  test('Opens add comment dialog', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry()],
            })
          },
        }),
      )
    })

    const trigger = screen.getByLabelText('Add a file comment')
    expect(trigger).toBeInTheDocument()

    await user.click(trigger)

    const dialogTitle = screen.getByText('Add a comment')
    expect(dialogTitle).toBeInTheDocument()
    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()

    await user.click(cancelButton)

    expect(screen.queryByText('Add a comment')).not.toBeInTheDocument()
  })

  // TODO: fix on seperate issue update test to remove builders and instead use mocks with minimal explicit returns for mocks
  test.skip('Adding a new comment and thread closes the dialog then renders the newly added comment', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)
    const viewer = buildViewer({id: 'monalisa', login: 'monalisa'})
    const author = {id: 'monalisa', login: 'monalisa'}
    const pullRequestId = 'pr-id'
    const comment = buildComment({
      id: 'review-comment-id',
      bodyHTML: 'my file level comment',
    })
    const threads = [
      buildReviewThread({
        firstComment: comment,
        comments: [comment],
      }) as unknown as PullRequestThread,
    ]

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              id: pullRequestId,
              author,
              viewerCanEditFiles: true,
              diffEntries: [buildDiffEntry()],
            })
          },
          Viewer() {
            return viewer
          },
        }),
      )
    })

    const trigger = screen.getByLabelText('Add a file comment')
    expect(trigger).toBeInTheDocument()

    await user.click(trigger)

    const markdownEditorInput = screen.getByPlaceholderText('Leave a comment')
    expect(markdownEditorInput).toBeInTheDocument()

    await user.type(markdownEditorInput, 'my file level comment')
    expect(markdownEditorInput).toHaveValue('my file level comment')

    const submitButton = screen.getByText('Add comment')
    expect(submitButton).toBeInTheDocument()

    await user.click(submitButton)

    // Mock the mutation
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.node.name).toEqual('addPullRequestReviewThreadMutation')
        return MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              id: pullRequestId,
              author,
              viewerCanEditFiles: true,
              diffEntries: [
                buildDiffEntry({
                  threads: {
                    threads,
                    totalCommentsCount: 1,
                  },
                }),
              ],
            })
          },
          PullRequestReviewComment() {
            return comment
          },
          Viewer() {
            return viewer
          },
        })
      })
    })

    // The dialog should be closed
    expect(screen.queryByText('Add a comment')).not.toBeInTheDocument()

    // Mock fetching the thread
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.node.name).toEqual('useFetchThreadQuery')
        return MockPayloadGenerator.generate(operation, {
          PullRequestThread() {
            return threads[0]
          },
        })
      })
    })

    // The comment is visible
    expect(screen.getByText('my file level comment')).toBeInTheDocument()
  })
})

describe('Viewing conversations', () => {
  test('Opens single conversation in a dialog if there is only one', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    const reviewThread = buildReviewThread({comments: [buildComment({bodyHTML: 'test comment'})]})

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [
                buildDiffEntry({
                  threads: {
                    threads: [reviewThread as unknown as PullRequestThread],
                    totalCommentsCount: 1,
                  },
                  outdatedThreads: {
                    threads: [],
                    totalCommentsCount: 0,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText(
      'View file comments and outdated comments. This file has 1 comment and 0 outdated comments.',
    )
    await user.click(trigger)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequestThread() {
            return reviewThread
          },
        })
      })
    })

    expect(await screen.findByText('test comment')).toBeInTheDocument()
  })

  test('ensures that previous active dialog is closed when clicked', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} viewerCanComment={true} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return {viewerCanEditFiles: true}
          },
          PullRequestReviewComment() {
            return {body: 'test comment'}
          },
        }),
      )
    })

    await user.click(screen.getByLabelText(/View file comments and outdated comments/))
    expect(ensurePreviousActiveDialogIsClosedMock).toHaveBeenCalled()
  })

  test('Opens conversation list if there are multiple comments', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [
                buildDiffEntry({
                  threads: {
                    threads: [
                      buildReviewThread({
                        comments: [
                          buildComment({
                            author: buildCommentAuthor({login: 'mona'}),
                            bodyHTML: 'test comment',
                          }),
                        ],
                      }) as unknown as PullRequestThread,
                      buildReviewThread({
                        comments: [
                          buildComment({
                            author: buildCommentAuthor({login: 'lisa'}),
                            bodyHTML: 'test comment',
                          }),
                        ],
                      }) as unknown as PullRequestThread,
                    ],
                    totalCommentsCount: 2,
                  },
                  outdatedThreads: {
                    threads: [],
                    totalCommentsCount: 0,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText(
      'View file comments and outdated comments. This file has 2 comments and 0 outdated comments.',
    )
    await user.click(trigger)

    expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
    expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
  })

  test('Opens conversation list if there is one outdated comment', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)
    const outdatedReviewThread = buildReviewThread({
      isOutdated: true,
      comments: [buildComment({author: buildCommentAuthor({login: 'lisa'}), bodyHTML: 'old news!'})],
    })

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [
                buildDiffEntry({
                  threads: {
                    threads: [],
                    totalCommentsCount: 0,
                  },
                  outdatedThreads: {
                    threads: [outdatedReviewThread as unknown as PullRequestThread],
                    totalCommentsCount: 1,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText(
      'View file comments and outdated comments. This file has 0 comments and 1 outdated comment.',
    )
    await user.click(trigger)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequestThread() {
            return outdatedReviewThread
          },
        })
      })
    })

    expect(await screen.findByText('old news!')).toBeInTheDocument()
    // SKIP for now, see https://github.com/github/pull-requests/issues/9022
    // expect(await screen.findByText('Outdated')).toBeInTheDocument()
  })

  test('Opens conversation list if there is one outdated comment and one comment', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [
                buildDiffEntry({
                  threads: {
                    threads: [
                      buildReviewThread({
                        comments: [
                          buildComment({
                            author: buildCommentAuthor({login: 'lisa'}),
                            bodyHTML: 'test comment',
                          }),
                        ],
                      }) as unknown as PullRequestThread,
                    ],
                    totalCommentsCount: 1,
                  },
                  outdatedThreads: {
                    threads: [
                      buildReviewThread({
                        isOutdated: true,
                        comments: [
                          buildComment({
                            author: buildCommentAuthor({login: 'mona'}),
                            bodyHTML: 'test comment',
                          }),
                        ],
                      }) as unknown as PullRequestThread,
                    ],
                    totalCommentsCount: 1,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText(
      'View file comments and outdated comments. This file has 1 comment and 1 outdated comment.',
    )
    await user.click(trigger)

    expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
    expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
  })

  test('Opens conversation list if there are multiple outdated comments', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerCanEditFiles: true,
              diffEntries: [
                buildDiffEntry({
                  threads: {
                    threads: [],
                    totalCommentsCount: 0,
                  },
                  outdatedThreads: {
                    threads: [
                      buildReviewThread({
                        comments: [
                          buildComment({
                            author: buildCommentAuthor({login: 'mona'}),
                            bodyHTML: 'test comment',
                          }),
                        ],
                      }) as unknown as PullRequestThread,
                      buildReviewThread({
                        comments: [
                          buildComment({
                            author: buildCommentAuthor({login: 'lisa'}),
                            bodyHTML: 'test comment',
                          }),
                        ],
                      }) as unknown as PullRequestThread,
                    ],
                    totalCommentsCount: 2,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    const trigger = await screen.findByLabelText(
      'View file comments and outdated comments. This file has 0 comments and 2 outdated comments.',
    )
    await user.click(trigger)

    expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
    expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
  })
})
