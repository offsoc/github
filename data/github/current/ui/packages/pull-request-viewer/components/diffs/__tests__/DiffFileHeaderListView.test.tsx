import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor} from '@testing-library/react'
import React from 'react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import {PullRequestMarkersDialogContextProvider} from '../../../contexts/PullRequestMarkersContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildDiffEntry, buildPullRequest, buildViewer} from '../../../test-utils/query-data'
import type {PullRequestsTargetType} from '../../../types/analytics-events-types'
import DiffFileHeaderListView from '../diff-file-header-list-view/DiffFileHeaderListView'
import type {DiffFileHeaderListViewTestQuery} from './__generated__/DiffFileHeaderListViewTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
  commitRangeFilterApplied: boolean
  viewerCanComment?: boolean
}

function TestComponent({
  environment,
  pullRequestId = 'PR_kwAEAg',
  viewerCanComment = true,
  commitRangeFilterApplied,
}: TestComponentProps) {
  const DiffFileHeaderListViewWithRelayQuery = () => {
    const data = useLazyLoadQuery<DiffFileHeaderListViewTestQuery>(
      graphql`
        query DiffFileHeaderListViewTestQuery(
          $pullRequestId: ID!
          $singleCommitOid: String
          $endOid: String
          $startOid: String
        ) @relay_test_operation {
          viewer {
            ...DiffFileHeaderListView_viewer
          }
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...DiffFileHeaderListView_pullRequest
              comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
                diffEntries(first: 20) {
                  nodes {
                    ...DiffFileHeaderListView_diffEntry
                  }
                }
              }
            }
          }
        }
      `,
      {
        pullRequestId,
      },
    )

    const diffEntry = data.pullRequest?.comparison?.diffEntries.nodes?.[0]
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const handleToggleCollapsed = () => setIsCollapsed(!isCollapsed)
    if (diffEntry) {
      return (
        <DiffFileHeaderListView
          activeGlobalMarkerID={undefined}
          canExpandOrCollapseLines={true}
          commitRangeFilterApplied={commitRangeFilterApplied}
          diffEntry={diffEntry}
          diffLinesManuallyExpanded={false}
          isCollapsed={isCollapsed}
          pullRequest={data.pullRequest}
          pullRequestId={pullRequestId}
          viewer={data.viewer}
          onActivateGlobalMarkerNavigation={jest.fn()}
          onToggleExpandAllLines={() => {}}
          onToggleFileCollapsed={handleToggleCollapsed}
        />
      )
    }

    return null
  }

  return (
    <PullRequestContextProvider
      headRefOid="mock"
      isInMergeQueue={false}
      pullRequestId="test-id"
      repositoryId="test-id"
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
          <DiffFileHeaderListViewWithRelayQuery />
        </PullRequestMarkersDialogContextProvider>
      </PullRequestsAppWrapper>
    </PullRequestContextProvider>
  )
}

describe('file name copy button', () => {
  test('copies file name to clipboard', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent commitRangeFilterApplied={false} environment={environment} />)
    const pullRequest = buildPullRequest({diffEntries: [buildDiffEntry({path: 'README'})]})
    const fileName = 'README'

    expect(fileName).not.toBeFalsy()

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    const copyButton = await screen.findByLabelText(`Copy file name to clipboard`, {selector: 'button'})
    await user.click(copyButton)

    await expect(navigator.clipboard.readText()).resolves.toEqual(fileName)
    expectAnalyticsEvents<PullRequestsTargetType>({
      type: 'file_entry.copy_path',
      target: 'COPY_TO_CLIPBOARD_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    })
  })
})

test('mark file as Viewed shows toast error when it fails', async () => {
  const environment = createMockEnvironment()
  const {user} = render(<TestComponent commitRangeFilterApplied={false} environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            diffEntries: [buildDiffEntry({path: 'path/file1.md', linesAdded: 0, linesChanged: 15, linesDeleted: 15})],
          })
        },
      }),
    )
  })

  const viewedButton = screen.getByRole('button', {name: 'Viewed'})
  await user.click(viewedButton)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    // Mock an error from API
    environment.mock.rejectMostRecentOperation(new Error('whoops'))
  })

  await expect(screen.findByText('Failed to mark file1.md as viewed: whoops')).resolves.toBeInTheDocument()
})

describe('file mode changes', () => {
  test('displays the mode if only the mode has changed', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent commitRangeFilterApplied={false} environment={environment} />)

    const oldTreeEntry = {path: 'path/file1.md', mode: 100644}
    const newTreeEntry = {path: 'path/file1.md', mode: 100755}

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              diffEntries: [buildDiffEntry({path: 'path/file1.md', status: 'MODIFIED', oldTreeEntry, newTreeEntry})],
            })
          },
        }),
      )
    })

    await expect(screen.findByText(oldTreeEntry.mode)).resolves.toBeInTheDocument()
    await expect(screen.findByText(newTreeEntry.mode)).resolves.toBeInTheDocument()
  })

  test('does not display the mode if the mode has not changed', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent commitRangeFilterApplied={false} environment={environment} />)

    const oldTreeEntry = {path: 'path/file1.md', mode: 100644}
    const newTreeEntry = {path: 'path/file1.md', mode: 100644}

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              diffEntries: [buildDiffEntry({path: 'path/file1.md', oldTreeEntry, newTreeEntry})],
            })
          },
        }),
      )
    })

    await waitFor(() => expect(screen.queryByText(oldTreeEntry.mode)).not.toBeInTheDocument())
    await waitFor(() => expect(screen.queryByText(newTreeEntry.mode)).not.toBeInTheDocument())
  })
})

describe('marking files as viewed', () => {
  test('does not display checkbox if commit range filter is applied', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent commitRangeFilterApplied={true} environment={environment} />)

    const oldTreeEntry = {path: 'path/file1.md', mode: 100644}
    const newTreeEntry = {path: 'path/file1.md', mode: 100644}

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              diffEntries: [buildDiffEntry({path: 'path/file1.md', oldTreeEntry, newTreeEntry})],
            })
          },
        }),
      )
    })

    await waitFor(() => expect(screen.queryByRole('button', {name: 'Viewed'})).not.toBeInTheDocument())
  })

  test('displays checkbox if commit range filter is not applied', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent commitRangeFilterApplied={false} environment={environment} />)

    const oldTreeEntry = {path: 'path/file1.md', mode: 100644}
    const newTreeEntry = {path: 'path/file1.md', mode: 100644}

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest({
              diffEntries: [buildDiffEntry({path: 'path/file1.md', oldTreeEntry, newTreeEntry})],
            })
          },
        }),
      )
    })

    expect(screen.getByRole('button', {name: 'Viewed'})).toBeInTheDocument()
  })
})

describe('File level comments', () => {
  test('displays the number of file level comments is there are any', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent commitRangeFilterApplied={false} environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return buildPullRequest({
              diffEntries: [
                buildDiffEntry({
                  newTreeEntry: {
                    path: 'README.md',
                    lineCount: 2,
                  },
                  threads: {
                    totalCommentsCount: 7,
                  },
                  outdatedThreads: {
                    totalCommentsCount: 2,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    const fileLevelCommentsButton = await screen.findByLabelText(
      'View file comments and outdated comments. This file has 7 comments and 2 outdated comments.',
    )
    expect(fileLevelCommentsButton).toBeInTheDocument()
    expect(fileLevelCommentsButton).toHaveTextContent('9')
  })

  test('aria-label when there is 1 comment', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent commitRangeFilterApplied={false} environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return buildPullRequest({
              diffEntries: [
                buildDiffEntry({
                  newTreeEntry: {
                    path: 'README.md',
                    lineCount: 2,
                  },
                  threads: {
                    totalCommentsCount: 1,
                  },
                  outdatedThreads: {
                    totalCommentsCount: 0,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    const fileLevelCommentsButton = await screen.findByLabelText(
      'View file comments and outdated comments. This file has 1 comment and 0 outdated comments.',
    )
    expect(fileLevelCommentsButton).toBeInTheDocument()
    expect(fileLevelCommentsButton).toHaveTextContent('1')
  })

  test('only displays the file level comments button if there are no file level comments', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent commitRangeFilterApplied={false} environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return buildPullRequest({
              diffEntries: [
                buildDiffEntry({
                  newTreeEntry: {
                    path: 'README.md',
                    lineCount: 2,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    const fileLevelCommentsButton = await screen.findByLabelText('Add a file comment')
    expect(fileLevelCommentsButton).toBeInTheDocument()
    expect(fileLevelCommentsButton).toHaveTextContent('')
  })

  test('hides file level comments button when viewing a commit range', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent commitRangeFilterApplied environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return buildPullRequest({
              diffEntries: [
                buildDiffEntry({
                  newTreeEntry: {
                    path: 'README.md',
                    lineCount: 2,
                  },
                }),
              ],
            })
          },
        }),
      )
    })

    expect(screen.queryByLabelText('Add a file comment')).not.toBeInTheDocument()
  })
})
