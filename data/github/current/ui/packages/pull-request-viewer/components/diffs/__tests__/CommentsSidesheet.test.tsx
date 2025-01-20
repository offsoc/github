import {buildComment} from '@github-ui/conversations/test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {useRef, useState} from 'react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import {PullRequestMarkersDialogContextProvider} from '../../../contexts/PullRequestMarkersContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest, buildReviewThread} from '../../../test-utils/query-data'
import {CommentsSidesheet} from '../CommentsSidesheet'
import type {CommentsSidesheetTestQuery} from './__generated__/CommentsSidesheetTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
}

function TestComponent({environment, pullRequestId = 'PR_kwAEAg'}: TestComponentProps) {
  const CommentsSidesheetWithRelayQuery = () => {
    const data = useLazyLoadQuery<CommentsSidesheetTestQuery>(
      graphql`
        query CommentsSidesheetTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...CommentsSidesheet_pullRequest
            }
          }
          viewer {
            ...CommentsSidesheet_viewer
          }
        }
      `,
      {
        pullRequestId,
      },
    )
    const [, setCommentsSidesheetIsOpen] = useState(true)
    const toggleSidesheetRef = useRef<HTMLButtonElement>(null)

    const exitOverlay = () => {
      setCommentsSidesheetIsOpen(false)
    }

    if (data.pullRequest) {
      return (
        <PullRequestMarkersDialogContextProvider
          annotationMap={{}}
          diffAnnotations={[]}
          filteredFiles={new Set()}
          setGlobalMarkerNavigationState={jest.fn()}
          threads={[]}
        >
          <CommentsSidesheet
            isOpen
            pullRequest={data.pullRequest}
            toggleSidesheetRef={toggleSidesheetRef}
            viewer={data.viewer}
            onClose={exitOverlay}
          />
        </PullRequestMarkersDialogContextProvider>
      )
    }
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
        <CommentsSidesheetWithRelayQuery />
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

test('renders the thread preview for a thread', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  const comment1 = buildComment({
    bodyHTML: 'thread preview text',
  })

  const thread1 = buildReviewThread({
    firstComment: comment1,
    threadPreviewComments: [comment1],
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            allThreads: {threads: [thread1], totalCommentsCount: 1},
          })
        },
      }),
    )
  })

  // get thread preview
  const threadPreview = await screen.findByText('thread preview text')
  expect(threadPreview).toBeInTheDocument()
})

test('renders a thread preview for every thread', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  const comment1 = buildComment({
    bodyHTML: 'thread preview text',
  })

  const thread1 = buildReviewThread({
    firstComment: comment1,
    threadPreviewComments: [comment1],
  })

  const comment2 = buildComment({
    bodyHTML: 'second thread preview text',
  })

  const thread2 = buildReviewThread({
    firstComment: comment2,
    threadPreviewComments: [comment2],
  })

  const comment3 = buildComment({
    bodyHTML: 'third thread preview text',
  })

  const thread3 = buildReviewThread({
    firstComment: comment3,
    threadPreviewComments: [comment3],
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            author: {
              login: 'author',
              id: 'author-id-123',
            },
            allThreads: {threads: [thread1, thread2, thread3], totalCommentsCount: 3},
          })
        },
      }),
    )
  })

  // get thread summaries
  const threadSummary1 = await screen.findByText('thread preview text')
  expect(threadSummary1).toBeInTheDocument()

  const threadSummary2 = await screen.findByText('second thread preview text')
  expect(threadSummary2).toBeInTheDocument()

  const threadSummary3 = await screen.findByText('third thread preview text')
  expect(threadSummary3).toBeInTheDocument()
})

describe('filtering threads', () => {
  test('by text filter', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    const comment1 = buildComment({
      author: {
        avatarUrl: '',
        id: '',
        login: 'mona',
        url: '',
      },
      bodyHTML: 'abc',
      body: 'abc',
    })

    const thread1 = buildReviewThread({
      firstComment: comment1,
      threadPreviewComments: [comment1],
      path: 'path/to/file1',
    })

    const comment2 = buildComment({
      author: {
        avatarUrl: '',
        id: '',
        login: 'lisa',
        url: '',
      },
      bodyHTML: 'jkl',
      body: 'jkl',
    })

    const thread2 = buildReviewThread({
      firstComment: comment2,
      threadPreviewComments: [comment2],
      path: 'path/to/file2',
    })

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              author: {
                login: 'author',
                id: 'author-id-123',
              },
              allThreads: {threads: [thread1, thread2], totalCommentsCount: 2},
            })
          },
        }),
      )
    })

    const assertBothThreadsPresent = async () => {
      expect(await screen.findByText('abc')).toBeInTheDocument()
      expect(await screen.findByText('jkl')).toBeInTheDocument()
    }

    // both threads are present
    await assertBothThreadsPresent()

    // filter to just the first comment by matching body
    const filterInput = await screen.findByPlaceholderText('Filter threads')
    await user.type(filterInput, 'abc')

    // only the first thread is present
    expect(await screen.findByText('abc')).toBeInTheDocument()
    expect(screen.queryByText('jkl')).not.toBeInTheDocument()

    await user.clear(filterInput)
    await assertBothThreadsPresent()

    // filter to just the second comment by matching path
    await user.type(filterInput, 'file2')

    // only the second thread is present
    expect(await screen.findByText('jkl')).toBeInTheDocument()
    expect(screen.queryByText('abc')).not.toBeInTheDocument()

    await user.clear(filterInput)
    await assertBothThreadsPresent()

    // filter to just the first comment by matching author
    await user.type(filterInput, 'mona')

    // only the first thread is present
    expect(await screen.findByText('abc')).toBeInTheDocument()
    expect(screen.queryByText('jkl')).not.toBeInTheDocument()

    await user.clear(filterInput)
    await assertBothThreadsPresent()

    // filter with no matches
    await user.type(filterInput, 'no matches')
    expect(screen.queryByText('abc')).not.toBeInTheDocument()
    expect(screen.queryByText('jkl')).not.toBeInTheDocument()

    // zero state is displayed
    expect(await screen.findByText('No comments match the current filter')).toBeInTheDocument()
    expect(await screen.findByText('Comments will show up here as soon as there are some.')).toBeInTheDocument()
  })

  test('by resolved state', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    const comment1 = buildComment({
      author: {
        avatarUrl: '',
        id: '',
        login: 'mona',
        url: '',
      },
      bodyHTML: 'abc',
      body: 'abc',
    })

    const thread1 = buildReviewThread({
      firstComment: comment1,
      threadPreviewComments: [comment1],
      path: 'path/to/file1',
      isResolved: true,
    })

    const comment2 = buildComment({
      author: {
        avatarUrl: '',
        id: '',
        login: 'lisa',
        url: '',
      },
      bodyHTML: 'jkl',
      body: 'jkl',
    })

    const thread2 = buildReviewThread({
      firstComment: comment2,
      threadPreviewComments: [comment2],
      path: 'path/to/file2',
      isResolved: false,
    })

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              author: {
                login: 'author',
                id: 'author-id-123',
              },
              allThreads: {threads: [thread1, thread2], totalCommentsCount: 2},
            })
          },
        }),
      )
    })

    const assertBothThreadsPresent = async () => {
      expect(await screen.findByText('abc')).toBeInTheDocument()
      expect(await screen.findByText('jkl')).toBeInTheDocument()
    }

    // both threads are present
    await assertBothThreadsPresent()

    const filterOptionsMenu = await screen.findByLabelText('Additional thread filters')
    await user.click(filterOptionsMenu)
    let filterResolvedToggle = await screen.findByLabelText('Resolved threads')
    await user.click(filterResolvedToggle)

    // only the second thread is present
    expect(await screen.findByText('jkl')).toBeInTheDocument()
    expect(screen.queryByText('abc')).not.toBeInTheDocument()

    await user.click(filterOptionsMenu)
    filterResolvedToggle = await screen.findByLabelText('Resolved threads')
    await user.click(filterResolvedToggle)

    await assertBothThreadsPresent()
  })
})

test('sidesheet shows zero state when there are no threads', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            allThreads: {threads: [], totalCommentsCount: 0},
          })
        },
      }),
    )
  })

  // zero state is displayed
  expect(await screen.findByText('No comments on changes yet')).toBeInTheDocument()
  expect(await screen.findByText('Comments will show up here as soon as there are some.')).toBeInTheDocument()
})
