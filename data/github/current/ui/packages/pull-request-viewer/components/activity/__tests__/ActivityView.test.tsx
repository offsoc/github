import {CommentEditsContextProvider} from '@github-ui/commenting/CommentEditsContext'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {RELAY_CONSTANTS} from '../../../constants'
import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest} from '../../../test-utils/query-data'
import {ActivityView} from '../ActivityView'
import type {ActivityViewTestQuery} from './__generated__/ActivityViewTestQuery.graphql'

document.dispatchEvent = jest.fn()

jest.mock('@github-ui/ssr-utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  get ssrSafeLocation() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return jest.fn().mockImplementation(() => {
      return {origin: 'https://github.localhost', hash: `#event-133035124`}
    })()
  },
}))
jest.setTimeout(4_500)

interface ActivityViewTestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId: string
  timelinePageSize?: number
}

function ActivityViewTestComponent({
  environment,
  pullRequestId,
  timelinePageSize = RELAY_CONSTANTS.timelinePageSize,
}: ActivityViewTestComponentProps) {
  const WrappedActivityViewComponent = () => {
    const data = useLazyLoadQuery<ActivityViewTestQuery>(
      graphql`
        query ActivityViewTestQuery($pullRequestId: ID!, $timelinePageSize: Int!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ...ActivityView_pullRequest @arguments(timelinePageSize: $timelinePageSize)
          }
          viewer {
            ...ActivityView_viewer
          }
        }
      `,
      {pullRequestId, timelinePageSize},
    )

    if (data.pullRequest) return <ActivityView pullRequest={data.pullRequest} viewer={data.viewer} />
    return null
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
        <CommentEditsContextProvider>
          <WrappedActivityViewComponent />
        </CommentEditsContextProvider>
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

describe('adding a pull request comment', () => {
  describe('when viewer does have permission to comment', () => {
    test('shows the pull request input placeholder', async () => {
      const environment = createMockEnvironment()
      const pullRequest = buildPullRequest({viewerCanComment: true})

      render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            PullRequest() {
              return pullRequest
            },
          }),
        )
      })

      expect(screen.getByPlaceholderText('Leave a comment')).toBeVisible()
    })

    test('appends comment to timeline', async () => {
      const environment = createMockEnvironment()
      const pullRequest = buildPullRequest({viewerCanComment: true})

      const {user} = render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            PullRequest() {
              return pullRequest
            },
          }),
        )
      })

      await user.type(screen.getByPlaceholderText('Leave a comment'), 'test comment here')
      await user.click(screen.getByRole('button', {name: /Comment/}))

      const recentOperation = environment.mock.getMostRecentOperation()
      expect(recentOperation.fragment.node.name).toBe('addCommentMutation')

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            IssueTimelineItemEdge() {
              return {
                node: {
                  body: 'test comment here',
                  bodyHTML: 'test comment here',
                  createdAt: new Date(),
                  isHidden: false,
                  pendingMinimizedReason: null,
                },
              }
            },
          }),
        )
      })

      const input = screen.getByPlaceholderText('Leave a comment')
      expect((input as HTMLInputElement).value).toBe('')
      expect(screen.getByText('test comment here')).toBeVisible()
    })

    describe('when viewer has close pull request access', () => {
      test('shows the "Close pull request" button on an open pull request', async () => {
        const environment = createMockEnvironment()
        const pullRequest = buildPullRequest({viewerCanComment: true, viewerCanClose: true, state: 'OPEN'})

        render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return pullRequest
              },
            }),
          )
        })

        expect(screen.getByRole('button', {name: /Close pull request/})).toBeVisible()
      })

      test('shows alternate text "Close with comment" button on an open pull request if comment text is present', async () => {
        const environment = createMockEnvironment()
        const pullRequest = buildPullRequest({viewerCanComment: true, viewerCanClose: true, state: 'OPEN'})

        const {user} = render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return pullRequest
              },
            }),
          )
        })
        const commentTextBox = await screen.findByPlaceholderText('Leave a comment')
        await user.type(commentTextBox, 'This PR is no longer necessary')

        await screen.findByRole('button', {name: /Close with comment/})
        expect(screen.queryByRole('button', {name: /Close pull request/})).toBeNull()
      })
    })

    describe('when viewer does not have close pull request access', () => {
      test('it does not show the "Close pull request" button on an open pull request', async () => {
        const environment = createMockEnvironment()
        const pullRequest = buildPullRequest({viewerCanComment: true, viewerCanClose: false, state: 'OPEN'})

        render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return pullRequest
              },
            }),
          )
        })
        expect(screen.getByRole('button', {name: /Comment/})).toBeVisible()
        expect(screen.queryByRole('button', {name: /Close pull request/})).toBeNull()
      })
    })

    describe('when viewer has reopen pull request access', () => {
      test('shows the reopen pull request button on a closed pull request', async () => {
        const environment = createMockEnvironment()
        const pullRequest = buildPullRequest({viewerCanComment: true, viewerCanReopen: true, state: 'CLOSED'})

        render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return pullRequest
              },
            }),
          )
        })

        expect(screen.getByRole('button', {name: /Reopen pull request/})).toBeVisible()
      })
    })

    describe('when viewer does not have reopen pull request access', () => {
      test('it does not shows the reopen pull request button on a closed pull request', async () => {
        const environment = createMockEnvironment()
        const pullRequest = buildPullRequest({viewerCanComment: true, viewerCanReopen: false, state: 'CLOSED'})

        render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
          environment.mock.resolveMostRecentOperation(operation =>
            MockPayloadGenerator.generate(operation, {
              PullRequest() {
                return pullRequest
              },
            }),
          )
        })

        expect(screen.getByRole('button', {name: /Comment/})).toBeVisible()
        expect(screen.queryByRole('button', {name: /Reopen pull request/})).toBeNull()
      })
    })
  })

  describe('when viewer does not have permission to comment', () => {
    test('does not show the pull request input placeholder', async () => {
      const environment = createMockEnvironment()
      const pullRequest = buildPullRequest({viewerCanComment: false})

      render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation => {
          const stuff = MockPayloadGenerator.generate(operation, {
            PullRequest() {
              return pullRequest
            },
          })

          return stuff
        })
      })

      expect(screen.queryByText('Write a comment…')).toBeNull()
    })
  })
})

test('renders pull request commits', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    viewerCanComment: false,
  })

  render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              edges: [
                {
                  node: {
                    __typename: 'PullRequestCommit',
                    commit: {
                      abbreviatedOid: 'abc123',
                      oid: 'abc123edgeegegegef',
                      message: 'This is a commit message',
                      verificationStatus: 'VERIFIED',
                      authoredDate: '2021-01-01T00:00:00Z',
                      statusCheckRollup: {
                        state: 'SUCCESS',
                      },
                      authors: {
                        edges: [
                          {
                            node: {
                              user: {
                                login: 'test-user',
                                avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            }
          }
        },
      })
    })
  })

  expect(screen.getByText('This is a commit message')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: /abc123/})).toBeInTheDocument()
  expect(screen.getByText('Verified')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: new RegExp('test-user')})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Copy full SHA for abc123'})).toBeInTheDocument()
})

test('renders closed events', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    viewerCanComment: false,
  })

  render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              edges: [
                {
                  node: {
                    __typename: 'ClosedEvent',
                    databaseId: 123,
                    createdAt: '2021-01-01T00:00:00Z',
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                    closer: null,
                  },
                },
              ],
            }
          }
        },
      })
    })
  })

  expect(screen.getByText('closed this')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: new RegExp('test-user')})).toBeInTheDocument()
})

test('renders reopened events', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    viewerCanComment: false,
  })
  render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              edges: [
                {
                  node: {
                    __typename: 'ReopenedEvent',
                    databaseId: 123,
                    createdAt: '2021-01-01T00:00:00Z',
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                  },
                },
              ],
            }
          }
        },
      })
    })
  })
  expect(screen.getByText('reopened this')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: new RegExp('test-user')})).toBeInTheDocument()
})

test('renders merged events', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    viewerCanComment: false,
  })

  render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              edges: [
                {
                  node: {
                    __typename: 'MergedEvent',
                    databaseId: 123,
                    createdAt: '2021-01-01T00:00:00Z',
                    viaMergeQueue: false,
                    viaMergeQueueAPI: false,
                    mergeRefName: 'main',
                    mergeCommit: {
                      oid: '9e7341906dcde47785faee95f9bb41d57c7391fd',
                      abbreviatedOid: '9e73419',
                    },
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                  },
                },
              ],
            }
          }
        },
      })
    })
  })

  expect(screen.getByText('merged commit')).toBeInTheDocument()
  expect(screen.getByText('9e73419')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: new RegExp('test-user')})).toBeInTheDocument()
})

test('renders review requested events', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    viewerCanComment: false,
  })

  render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              edges: [
                {
                  node: {
                    __typename: 'ReviewRequestedEvent',
                    databaseId: 123,
                    createdAt: '2021-01-01T00:00:00Z',
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                    requestedReviewAssignedFromTeamName: null,
                    reviewRequest: {
                      codeOwnersResourcePath: null,
                      requestedReviewer: {
                        __typename: 'Team',
                        combinedSlug: 'org/some-team',
                        resourcePath: '/orgs/org/teams/some-team',
                      },
                    },
                  },
                },
              ],
            }
          }
        },
      })
    })
  })
  expect(screen.getByRole('link', {name: new RegExp('test-user')})).toBeInTheDocument()
  expect(screen.getByText('requested a review from')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: 'org/some-team'})).toBeInTheDocument()
})

test('renders review dismissed events', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    viewerCanComment: false,
  })

  render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              edges: [
                {
                  node: {
                    __typename: 'ReviewDismissedEvent',
                    databaseId: 123,
                    createdAt: '2021-01-01T00:00:00Z',
                    pullRequestCommit: {
                      commit: {
                        abbreviatedOid: '9e73419',
                      },
                      resourcePath: '/owner/repo/pull/42/commits/9e7341906dcde47785faee95f9bb41d57c7391fd',
                    },
                    review: {
                      fullDatabaseId: 42,
                      author: {
                        login: 'other-user',
                      },
                    },
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                  },
                },
              ],
            }
          }
        },
      })
    })
  })
  expect(screen.getByText('stale review')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: '9e73419'})).toBeInTheDocument()
  expect(screen.getByRole('link', {name: new RegExp('test-user')})).toBeInTheDocument()
})

test('loads backwards and forward timeline items', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({})

  render(<ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} timelinePageSize={1} />)

  // Mock initial fetch on component mount
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              totalCount: 4,
              edges: [
                {
                  node: {
                    __typename: 'ReviewDismissedEvent',
                    databaseId: 123,
                    createdAt: '2021-01-01T00:00:00Z',
                    pullRequestCommit: {
                      commit: {
                        abbreviatedOid: '9e73419',
                      },
                      resourcePath: '/owner/repo/pull/42/commits/9e7341906dcde47785faee95f9bb41d57c7391fd',
                    },
                    review: {
                      fullDatabaseId: 42,
                      author: {
                        login: 'other-user',
                      },
                    },
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                  },
                },
              ],
            }
          }
          if (context.alias === 'backwardTimeline') {
            return {
              edges: [],
            }
          }
        },
      })
    })
  })

  // Mock refetching timeline data after component mounts
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              edges: [],
            }
          }
          if (context.alias === 'backwardTimeline') {
            return {
              edges: [
                {
                  node: {
                    __typename: 'ReviewRequestedEvent',
                    databaseId: 1234,
                    createdAt: '2021-01-01T00:00:00Z',
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                    requestedReviewAssignedFromTeamName: null,
                    reviewRequest: {
                      codeOwnersResourcePath: null,
                      requestedReviewer: {
                        __typename: 'Team',
                        combinedSlug: 'org/some-team',
                        resourcePath: '/orgs/org/teams/some-team',
                      },
                    },
                  },
                },
              ],
            }
          }
        },
      })
    })
  })
  expect(screen.getByText('stale review')).toBeInTheDocument() // forward timeline item
  expect(screen.getByRole('button', {name: 'Load all'})).toBeInTheDocument()
  expect(
    screen.getByText((_, element) => element?.nodeName === 'H3' && element.textContent === '2 remaining items'),
  ).toBeInTheDocument()
  expect(screen.getByText('requested a review from')).toBeInTheDocument() // backward timeline item
})

test('finds items not initially loaded', async () => {
  const environment = createMockEnvironment()
  const pullRequest = buildPullRequest({
    viewerCanComment: false,
  })

  const {container} = render(
    <ActivityViewTestComponent environment={environment} pullRequestId={pullRequest.id} timelinePageSize={2} />,
  )

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'forwardTimeline') {
            return {
              totalCount: 4,
              edges: [
                {
                  node: {
                    __typename: 'ReviewDismissedEvent',
                    databaseId: 123,
                    createdAt: '2021-01-01T00:00:00Z',
                    pullRequestCommit: {
                      commit: {
                        abbreviatedOid: '9e73419',
                      },
                      resourcePath: '/owner/repo/pull/42/commits/9e7341906dcde47785faee95f9bb41d57c7391fd',
                    },
                    review: {
                      fullDatabaseId: 42,
                      author: {
                        login: 'other-user',
                      },
                    },
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                  },
                },
                {
                  node: {
                    __typename: 'ReviewRequestedEvent',
                    databaseId: 1234,
                    createdAt: '2021-01-01T00:00:00Z',
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                    requestedReviewAssignedFromTeamName: null,
                    reviewRequest: {
                      codeOwnersResourcePath: null,
                      requestedReviewer: {
                        __typename: 'Team',
                        combinedSlug: 'org/some-team',
                        resourcePath: '/orgs/org/teams/some-team',
                      },
                    },
                  },
                },
              ],
            }
          }
          if (context.alias === 'backwardTimeline') {
            return {
              edges: [],
            }
          }
        },
      })
    })
  })
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.querySelector('div[data-highlighted-event="true"]')).not.toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Load all'})).toBeInTheDocument()
  expect(
    screen.getByText((_, element) => element?.nodeName === 'H3' && element.textContent === '2 remaining items'),
  ).toBeInTheDocument()

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return pullRequest
        },
        PullRequestTimelineItemsConnection(context) {
          if (context.alias === 'backwardTimeline') {
            return {
              edges: [
                {
                  node: {
                    __typename: 'MergedEvent',
                    databaseId: 123,
                    createdAt: '2021-01-01T00:00:00Z',
                    viaMergeQueue: false,
                    viaMergeQueueAPI: false,
                    mergeRefName: 'main',
                    mergeCommit: {
                      oid: '9e7341906dcde47785faee95f9bb41d57c7391fd',
                      abbreviatedOid: '9e73419',
                    },
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                  },
                },
                {
                  node: {
                    __typename: 'ReopenedEvent',
                    databaseId: 133035124,
                    createdAt: '2021-01-01T00:00:00Z',
                    actor: {
                      login: 'test-user',
                      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
                    },
                  },
                },
              ],
            }
          }
        },
      })
    })
  })
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const highlightedEvent = container.querySelector('div[data-highlighted-event="true"]')
  expect(highlightedEvent).toHaveTextContent('reopened this')
})
