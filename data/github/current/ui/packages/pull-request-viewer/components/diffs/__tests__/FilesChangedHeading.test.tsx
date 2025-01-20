import {buildComment} from '@github-ui/conversations/test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import {PullRequestMarkersDialogContextProvider} from '../../../contexts/PullRequestMarkersContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildReviewThread} from '../../../test-utils/query-data'
import {buildDiffEntry, buildPullRequest, type PullRequestThread} from '../../../test-utils/query-data'
import FilesChangedHeading from '../FilesChangedHeading'
import type {FilesChangedHeadingTestQuery} from './__generated__/FilesChangedHeadingTestQuery.graphql'

jest.mock('@github-ui/copilot-code-chat/CopilotDiffChatHeaderMenu', () => ({
  CopilotDiffChatHeaderMenu: () => null,
}))

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
}

function TestComponent({environment, pullRequestId = 'PR_kwAEAg'}: TestComponentProps) {
  const FilesChangedHeadingWithRelayQuery = () => {
    const data = useLazyLoadQuery<FilesChangedHeadingTestQuery>(
      graphql`
        query FilesChangedHeadingTestQuery(
          $pullRequestId: ID!
          $startOid: String
          $endOid: String
          $singleCommitOid: String
        ) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...FilesChangedHeading_pullRequest
            }
          }
          viewer {
            ...FilesChangedHeading_viewer
          }
        }
      `,
      {
        pullRequestId,
      },
    )

    if (data.pullRequest) {
      return <FilesChangedHeading pullRequest={data.pullRequest} viewer={data.viewer} />
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
        <PullRequestMarkersDialogContextProvider
          annotationMap={{}}
          diffAnnotations={[]}
          filteredFiles={new Set()}
          setGlobalMarkerNavigationState={jest.fn()}
          threads={[]}
        >
          <FilesChangedHeadingWithRelayQuery />
        </PullRequestMarkersDialogContextProvider>
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

describe('comparison data', () => {
  test('shows the comparison data', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({comparison: {linesAdded: 13, linesChanged: 5, linesDeleted: 28}})
          },
        }),
      )
    })
    expect(screen.getByText('+13')).toBeInTheDocument()
    expect(screen.getByText('-28')).toBeInTheDocument()
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })
})

describe('viewed file count', () => {
  test('shows the viewed file count', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              diffEntries: [
                buildDiffEntry({path: 'path/file1.md'}),
                buildDiffEntry({path: 'pathA'}),
                buildDiffEntry({path: 'pathB'}),
              ],
            })
          },
        }),
      )
    })
    // We need to use element type and textContent mapper here as the "# / # viewed" is wrapped in a parent <SPAN> element and broken up by multiple children <span> elements.
    expect(
      screen.getByText((_, element) => element?.nodeName === 'SPAN' && element.textContent === '0 / 3 viewed'),
    ).toBeInTheDocument()
  })

  test('shows the viewed file count based on the state of the diff entries', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              viewerViewedFiles: 1,
              diffEntries: [
                buildDiffEntry({path: 'path/file1.md'}),
                buildDiffEntry({path: 'pathA'}),
                buildDiffEntry({path: 'pathB'}),
              ],
            })
          },
        }),
      )
    })

    // We need to use element type and textContent mapper here as the "# / # viewed" is wrapped in a parent <SPAN> element and broken up by multiple children <span> elements.
    expect(
      screen.getByText((_, element) => element?.nodeName === 'SPAN' && element.textContent === '1 / 3 viewed'),
    ).toBeInTheDocument()
  })
})

describe('diff view settings', () => {
  test('shows the diff view settings button', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest()
          },
        }),
      )
    })

    expect(screen.getByLabelText('Diff view settings')).toBeInTheDocument()
  })
})

describe('Comments button', () => {
  test('shows the number of threads', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    const comment1 = buildComment({
      bodyHTML: 'test comment',
    })

    const comment2 = buildComment({
      bodyHTML: 'test comment',
    })

    const thread1 = buildReviewThread({
      isResolved: true,
      comments: [comment1],
      firstComment: comment1,
      threadPreviewComments: [comment1],
    })

    const thread2 = buildReviewThread({
      isResolved: false,
      comments: [comment2],
      firstComment: comment2,
      threadPreviewComments: [comment2],
    })

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              allThreads: {threads: [thread1, thread2], totalCommentsCount: 2},
            })
          },
        }),
      )
    })

    // get comments button
    const commentsButton = await screen.findByLabelText('Open comments sidesheet')
    expect(commentsButton).toBeInTheDocument()

    // get total comments count
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  // TODO: Figure out how to load data when component is calling another preloaded query
  test.skip('renders the CommentsSidesheet when clicked', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

    const comment1 = buildComment({
      bodyHTML: 'test comment',
    })

    const thread1 = buildReviewThread({
      firstComment: comment1,
      threadPreviewComments: [comment1],
    })

    // get comments button
    const commentsButton = await screen.findByLabelText('Open comments sidesheet')
    expect(commentsButton).toBeInTheDocument()

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              allThreads: {threads: [thread1 as unknown as PullRequestThread], totalCommentsCount: 1},
            })
          },
        }),
      )
    })

    // click the comments button
    await user.click(commentsButton)

    // get comments sidesheet
    const commentsSidesheet = await screen.findByLabelText('Threads')
    expect(commentsSidesheet).toBeInTheDocument()
  })
})
