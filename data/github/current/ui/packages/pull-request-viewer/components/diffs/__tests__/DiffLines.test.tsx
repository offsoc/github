import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {mockClientEnv} from '@github-ui/client-env/mock'
import {DiffAnnotationLevels} from '@github-ui/conversations'
import {SelectedDiffRowRangeContextProvider} from '@github-ui/diff-lines'
import {render as testRender} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor, within} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {useLocation} from 'react-router-dom'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'

import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import {PullRequestMarkersDialogContextProvider} from '../../../contexts/PullRequestMarkersContext'
import type {DiffAnnotationsByEndLineMap} from '../../../helpers/annotation-helpers'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {
  buildComment,
  buildDiffAnnotation,
  buildDiffEntry,
  buildDiffLine,
  buildPullRequest,
  buildReviewThread,
  buildViewer,
  mockUUID,
  type PullRequestThread,
} from '../../../test-utils/query-data'
import type {DiffLinesTestQuery} from '../__tests__/__generated__/DiffLinesTestQuery.graphql'
import DiffLines, {type DiffLinesProps} from '../DiffLines'

jest.mock('react-router-dom', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual('react-router-dom')

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    useLocation: jest.fn(),
  }
})
const mockedUseLocation = jest.mocked(useLocation)

const providedHelpUrl = 'https://docs.github.com'

interface TestComponentProps {
  annotations?: DiffAnnotationsByEndLineMap
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId: string
  onSetAnchorFile?: () => void
  diffMetadata?: Partial<DiffLinesProps['diffMetadata']>
}

function render(Component: ReturnType<typeof TestComponent>) {
  return testRender(Component, {routePayload: {helpUrl: providedHelpUrl}})
}

function TestComponent({annotations = {}, diffMetadata, environment, pullRequestId}: TestComponentProps) {
  const DiffLinesWithRelayQuery = () => {
    const data = useLazyLoadQuery<DiffLinesTestQuery>(
      graphql`
        query DiffLinesTestQuery($injectedContextLines: [DiffLineRange!], $inlineThreadCount: Int = 20)
        @relay_test_operation {
          viewer {
            ...DiffLines_viewer
          }
          pullRequest: node(id: "test-id") {
            ... on PullRequest {
              comparison {
                diffEntries(first: 20) {
                  nodes {
                    ...DiffLines_diffEntry
                  }
                }
              }
            }
          }
        }
      `,
      {
        injectedContextLines: [{start: 0, end: 0}],
      },
    )

    if (data.pullRequest?.comparison?.diffEntries.nodes?.[0]) {
      return (
        <DiffLines
          activeGlobalMarkerID={undefined}
          annotations={annotations}
          diffEntry={data.pullRequest.comparison.diffEntries.nodes[0]}
          diffLinesManuallyUnhidden={false}
          viewer={data.viewer}
          diffMetadata={{
            isBinary: false,
            isTooBig: false,
            linesChanged: 1,
            path: 'path',
            pathDigest: 'file-anchor',
            newTreeEntry: {isGenerated: false, mode: 1, lineCount: 1},
            newCommitOid: 'new-commit-oid',
            objectId: 'object-id',
            oldTreeEntry: {mode: 1, lineCount: 1},
            oldCommitOid: 'old-commit-oid',
            status: 'status',
            truncatedReason: undefined,
            ...diffMetadata,
          }}
          onHandleLoadDiff={jest.fn()}
        />
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
        viewerCanComment={true}
      >
        <SelectedDiffRowRangeContextProvider>
          <PullRequestMarkersDialogContextProvider
            annotationMap={{}}
            diffAnnotations={[]}
            filteredFiles={new Set()}
            setGlobalMarkerNavigationState={jest.fn()}
            threads={[]}
          >
            <div id="js-global-screen-reader-notice" />
            <DiffLinesWithRelayQuery />
          </PullRequestMarkersDialogContextProvider>
        </SelectedDiffRowRangeContextProvider>
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

beforeEach(() => {
  mockClientEnv({
    featureFlags: ['prx'],
  })
})

test('lines render in split diff view when user prefers the split view', async () => {
  mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [
              buildDiffEntry({
                pathDigest: 'file-anchor',
                diffLines: [
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 1,
                    right: 1,
                    blobLineNumber: 1,
                    type: 'ADDITION',
                    html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
                  }),
                ],
                newTreeEntry: {path: '', lineCount: 1},
              }),
            ],
          })
        },
      }),
    )
  })

  // check that 4 cells are rendered for a split diff layout
  const cells = await screen.findAllByRole('gridcell')
  expect(cells.length).toBe(4)

  // check that only one row was rendered
  const rows = await screen.findAllByRole('row')
  // the heading is included in the row count
  expect(rows.length).toBe(2)
})

test('lines render in unified diff view when user prefers the unified view', async () => {
  mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer({pullRequestUserPreferences: {diffView: 'unified', ignoreWhitespace: false}})
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [
              buildDiffEntry({
                pathDigest: 'file-anchor',
                diffLines: [
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 1,
                    right: 1,
                    blobLineNumber: 1,
                    type: 'ADDITION',
                    html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
                  }),
                ],
                newTreeEntry: {path: '', lineCount: 1},
              }),
            ],
          })
        },
      }),
    )
  })

  // check that 3 cells are rendered for a unified diff layout
  const cells = await screen.findAllByRole('gridcell')
  expect(cells.length).toBe(3)

  // check that only one row was rendered
  const rows = await screen.findAllByRole('row')
  // the heading is included in the row count
  expect(rows.length).toBe(2)
})

test('when binary file, renders message', async () => {
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(<TestComponent diffMetadata={{isBinary: true}} environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer()
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [buildDiffEntry({isBinary: true})],
          })
        },
      }),
    )
  })
  await expect(screen.findByText('Binary file not shown.')).resolves.toBeInTheDocument()
})

test('when only file mode has changed, renders message', async () => {
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  const oldTreeEntry = {path: 'path/file1.md', mode: 100644, lineCount: 1}
  const newTreeEntry = {path: 'path/file1.md', mode: 100755, lineCount: 1, isGenerated: false}

  render(
    <TestComponent
      diffMetadata={{status: 'MODIFIED', oldTreeEntry, newTreeEntry}}
      environment={environment}
      pullRequestId={pullRequestId}
    />,
  )

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer()
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [buildDiffEntry({status: 'MODIFIED', oldTreeEntry, newTreeEntry})],
          })
        },
      }),
    )
  })
  await expect(screen.findByText('File mode changed.')).resolves.toBeInTheDocument()
})

test('when only file name has changed, renders message', async () => {
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(
    <TestComponent
      diffMetadata={{status: 'RENAMED', linesChanged: 0}}
      environment={environment}
      pullRequestId={pullRequestId}
    />,
  )

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer()
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [buildDiffEntry({status: 'RENAMED', linesChanged: 0})],
          })
        },
      }),
    )
  })
  await expect(screen.findByText('File renamed without changes.')).resolves.toBeInTheDocument()
})

test('when the file has only been copied, renders message', async () => {
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(
    <TestComponent
      diffMetadata={{status: 'COPIED', linesChanged: 0}}
      environment={environment}
      pullRequestId={pullRequestId}
    />,
  )

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer()
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [buildDiffEntry({status: 'COPIED', linesChanged: 0})],
          })
        },
      }),
    )
  })
  await expect(screen.findByText('File copied without changes.')).resolves.toBeInTheDocument()
})

test('when given a whitespace-only change, renders message', async () => {
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(<TestComponent diffMetadata={{linesChanged: 0}} environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer()
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [buildDiffEntry({path: 'file1', linesChanged: 0})],
          })
        },
      }),
    )
  })

  await expect(screen.findByText('Whitespace-only changes.')).resolves.toBeInTheDocument()
})

describe('interacting with the ActionBar from a content cell', () => {
  const pullRequestId = 'PR_RELAY_ID'
  const mockPullRequestPayload = {
    User() {
      return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
    },
    PullRequest() {
      return buildPullRequest({
        id: pullRequestId,
        diffEntries: [
          buildDiffEntry({
            pathDigest: 'file-anchor',
            diffLines: [
              buildDiffLine({
                __id: `diff-${mockUUID()}`,
                left: 1,
                right: 1,
                blobLineNumber: 1,
                type: 'CONTEXT',
                html: ` <span>existing code</span>`,
              }),
              buildDiffLine({
                __id: `diff-${mockUUID()}`,
                left: 2,
                right: 2,
                blobLineNumber: 2,
                type: 'CONTEXT',
                html: ` <span>more existing code</span>`,
              }),
              buildDiffLine({
                __id: `diff-${mockUUID()}`,
                left: null,
                right: 3,
                blobLineNumber: 3,
                type: 'ADDITION',
                html: `+<span>new code code</span>`,
              }),
            ],
            newTreeEntry: {path: 'file-anchor', lineCount: 3},
          }),
        ],
      })
    },
  }

  test('focusing on a content cell shows the action bar', async () => {
    const environment = createMockEnvironment()
    render(
      <>
        <TestComponent environment={environment} pullRequestId={pullRequestId} />
      </>,
    )

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, mockPullRequestPayload),
      )
    })

    // the action bar is not visible until the cell is focused
    expect(screen.queryByLabelText('Start conversation')).not.toBeInTheDocument()

    // Tab into first diff table grid
    userEvent.tab()
    // Navigate to the right side of the diff and focus on the first content cell
    userEvent.keyboard('[ArrowRight][ArrowRight][ArrowRight][ArrowDown]')

    // eslint-disable-next-line testing-library/no-node-access
    const secondRowRightSideCell = document.querySelector(
      'td[data-grid-cell-id="diff-file-anchor-2-2-3"]',
    ) as HTMLTableCellElement
    expect(secondRowRightSideCell).toHaveFocus()

    userEvent.tab()
    const newThreadButton = await screen.findByLabelText('Start conversation')
    expect(newThreadButton).toHaveFocus()
    userEvent.tab()
    const moreActionsButton = await screen.findByLabelText('More actions')
    expect(moreActionsButton).toHaveFocus()

    // shift-tabbing back out will focus on the cell again
    userEvent.tab({shift: true})
    expect(newThreadButton).toHaveFocus()
    userEvent.tab({shift: true})
    expect(secondRowRightSideCell).toHaveFocus()
  })

  test('clicking on additional actions icon shows context menu', async () => {
    const environment = createMockEnvironment()
    render(
      <>
        <TestComponent environment={environment} pullRequestId={pullRequestId} />
      </>,
    )

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, mockPullRequestPayload),
      )
    })

    // the action bar is not visible until the cell is focused
    expect(screen.queryByLabelText('Start conversation')).not.toBeInTheDocument()

    // Tab into first diff table grid
    userEvent.tab()
    // Navigate to the right side of the diff and focus on the first content cell
    userEvent.keyboard('[ArrowRight][ArrowRight][ArrowRight][ArrowDown]')

    // eslint-disable-next-line testing-library/no-node-access
    const secondRowRightSideCell = document.querySelector(
      'td[data-grid-cell-id="diff-file-anchor-2-2-3"]',
    ) as HTMLTableCellElement
    expect(secondRowRightSideCell).toHaveFocus()

    userEvent.tab()
    const newThreadButton = await screen.findByLabelText('Start conversation')
    expect(newThreadButton).toHaveFocus()

    userEvent.tab()
    const moreActionsButton = await screen.findByLabelText('More actions')
    expect(moreActionsButton).toHaveFocus()
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      moreActionsButton.click()
    })
    const contextMenu = await screen.findByRole('menu')
    expect(contextMenu).toBeInTheDocument()

    const contextMenuItems = await screen.findAllByRole('menuitem')
    const itemContents = contextMenuItems.map(item => item.textContent)
    const expected = [
      expect.stringContaining('Start conversation'),
      expect.stringContaining('Copy'),
      expect.stringContaining('Select all'),
      expect.stringContaining('Copy anchor link'),
    ]
    expect(itemContents).toEqual(expect.arrayContaining(expected))
  })

  test('clicking on the "Start conversation" plus icon will add a comment box below', async () => {
    const environment = createMockEnvironment()
    mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
    render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          User() {
            return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
          },
          PullRequest() {
            return buildPullRequest({
              id: pullRequestId,
              diffEntries: [
                buildDiffEntry({
                  pathDigest: 'file-anchor',
                  diffLines: [
                    buildDiffLine({
                      __id: `diff-${mockUUID()}`,
                      left: 1,
                      right: 1,
                      blobLineNumber: 1,
                      type: 'ADDITION',
                      html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
                    }),
                  ],
                  newTreeEntry: {path: '', lineCount: 1},
                }),
              ],
            })
          },
        }),
      )
    })
    // eslint-disable-next-line testing-library/no-node-access
    const firstRowRightSideCell = document.querySelector(
      'td[data-grid-cell-id="diff-file-anchor-empty-1-3"]',
    ) as HTMLTableCellElement
    userEvent.click(firstRowRightSideCell)
    const iconButton = await screen.findByLabelText('Start conversation')
    userEvent.click(iconButton)

    expect(await screen.findByPlaceholderText('Leave a comment')).toBeInTheDocument()

    // send analytics events
    expectAnalyticsEvents({
      type: 'diff.start_new_conversation',
      target: 'PLUS_ICON',
      data: {
        app_name: 'pull_request',
      },
    })
  })

  test('diff lines render persisted comments in the comment box below', async () => {
    mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
    const environment = createMockEnvironment()
    const line = 1
    const filePath = 'example.go'
    const commentCacheKey = `PullRequest:${pullRequestId}-File:${filePath}-Line:${line}-DiffSide:RIGHT`
    const persistedCommentText = 'pre-existing comment text'
    window.localStorage.setItem(commentCacheKey, JSON.stringify({text: persistedCommentText}))
    render(
      <TestComponent
        environment={environment}
        pullRequestId={pullRequestId}
        diffMetadata={{
          newTreeEntry: {isGenerated: false, mode: 0, lineCount: 1},
          path: 'example.go',
          pathDigest: 'file-anchor',
        }}
      />,
    )

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          User() {
            return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
          },
          PullRequest() {
            return buildPullRequest({
              id: pullRequestId,
              diffEntries: [
                buildDiffEntry({
                  path: 'example.go',
                  pathDigest: 'file-anchor',
                  oid: 'c7fcd4099fc2ca8f60276a65a735cc21',
                  diffLines: [
                    buildDiffLine({
                      __id: `diff-${mockUUID()}`,
                      left: line,
                      right: line,
                      blobLineNumber: line,
                      type: 'ADDITION',
                      html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
                    }),
                  ],
                  newTreeEntry: {path: 'example.go', lineCount: 1},
                }),
              ],
            })
          },
        }),
      )
    })

    // eslint-disable-next-line testing-library/no-node-access
    const firstRowRightSideCell = document.querySelector(
      'td[data-grid-cell-id="diff-file-anchor-empty-1-3"]',
    ) as HTMLTableCellElement
    userEvent.click(firstRowRightSideCell)

    const iconButton = await screen.findByLabelText('Start conversation (comment in progress)')
    userEvent.click(iconButton)

    const commentEditor = await screen.findByPlaceholderText('Leave a comment')
    expect(commentEditor).toHaveValue(persistedCommentText)

    window.localStorage.clear()
  })

  test('after closing the start conversation dialog, focus returns to the action bar plus icon', async () => {
    // Return focus to the action bar so that action bar blur effects will occur
    const environment = createMockEnvironment()
    mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
    render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          User() {
            return {
              pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false},
            }
          },
          PullRequest() {
            return buildPullRequest({
              id: pullRequestId,
              diffEntries: [
                buildDiffEntry({
                  pathDigest: 'file-anchor',
                  diffLines: [
                    buildDiffLine({
                      __id: `diff-${mockUUID()}`,
                      left: 1,
                      right: 1,
                      blobLineNumber: 1,
                      type: 'ADDITION',
                      html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
                    }),
                  ],
                  newTreeEntry: {path: '', lineCount: 1},
                }),
              ],
            })
          },
        }),
      )
    })
    // eslint-disable-next-line testing-library/no-node-access
    const firstRowRightSideCell = document.querySelector(
      'td[data-grid-cell-id="diff-file-anchor-empty-1-3"]',
    ) as HTMLTableCellElement
    userEvent.click(firstRowRightSideCell)
    const iconButton = await screen.findByLabelText('Start conversation')
    userEvent.click(iconButton)

    expect(await screen.findByPlaceholderText('Leave a comment')).toBeInTheDocument()

    const cancelButton = screen.getByText('Cancel')
    userEvent.click(cancelButton)

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.activeElement).toBe(iconButton)
  })
})

// Skipping due to failure in React 18 - https://github.com/github/web-systems/issues/1064
// eslint-disable-next-line jest/expect-expect
test.skip('when file has been truncated, renders message', async () => {
  const pullRequestId = 'PR_RELAY_ID'
  const testCases = [
    {
      reason: 'maximum diff size exceeded.',
      outcome:
        'Sorry, we could not display the changes to this file because there were too many other changes to display.',
    },
    {
      reason: 'maximum number of lines exceeded.',
      outcome:
        'Sorry, we could not display the changes to this file because there were too many other changes to display.',
    },
    {
      reason: 'maximum file count exceeded',
      outcome:
        'Sorry, we could not display the changes to this file because there were too many other files to display.',
    },
    {reason: 'truncated', outcome: 'truncated'},
  ]

  for (const {reason, outcome} of testCases) {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          User() {
            return buildViewer()
          },
          PullRequest() {
            return buildPullRequest({
              id: pullRequestId,
              diffEntries: [buildDiffEntry({truncatedReason: reason})],
            })
          },
        }),
      )
    })

    await waitFor(() => screen.findByText(outcome))
  }
})

test('large files do not render by default', async () => {
  const pullRequestId = 'PR_RELAY_ID'
  const environment = createMockEnvironment()
  render(<TestComponent diffMetadata={{isTooBig: true}} environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer()
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [buildDiffEntry({isTooBig: true})],
          })
        },
      }),
    )
  })

  expect(screen.getByRole('button')).toHaveTextContent('Load Diff')
  screen.getByText('Large diffs are not rendered by default.')
})

test('deleted files do not render by default', async () => {
  const pullRequestId = 'PR_RELAY_ID'
  const environment = createMockEnvironment()
  render(<TestComponent diffMetadata={{newTreeEntry: null}} environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer()
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [buildDiffEntry({newTreeEntry: null})],
          })
        },
      }),
    )
  })

  expect(screen.getByRole('button')).toHaveTextContent('Load Diff')
  screen.getByText('This file was deleted.')
})

test('generated files do not render by default', async () => {
  const pullRequestId = 'PR_RELAY_ID'
  const helpURL =
    'https://docs.github.com/github/administering-a-repository/customizing-how-changed-files-appear-on-github'

  const environment = createMockEnvironment()
  render(
    <TestComponent
      environment={environment}
      pullRequestId={pullRequestId}
      diffMetadata={{
        newTreeEntry: {
          isGenerated: true,
          lineCount: 1,
          mode: 0o755,
        },
      }}
    />,
  )

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer()
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [
              buildDiffEntry({
                newTreeEntry: {
                  path: 'README.md',
                  isGenerated: true,
                  lineCount: 1,
                  mode: 0o755,
                },
              }),
            ],
          })
        },
      }),
    )
  })

  expect(screen.getByRole('button')).toHaveTextContent('Load Diff')
  screen.getByText('Some generated files are not rendered by default. Learn more about', {exact: false})
  const link = screen.getByRole('link')
  expect(link).toHaveAttribute('href', helpURL)
  expect(link).toHaveTextContent('customizing how changed files appear on GitHub.')
})

describe('when selecting lines of a split diff from a left side cell', () => {
  describe('as a mouse user using shift + click', () => {
    test('it announces the selected lines of the diff as L1-L2', async () => {
      const environment = createMockEnvironment()
      const pullRequestId = 'PR_RELAY_ID'
      render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            User() {
              return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
            },
            PullRequest() {
              return buildPullRequest({
                id: pullRequestId,
                diffEntries: [
                  buildDiffEntry({
                    pathDigest: 'file-anchor',
                    diffLines: [
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 1,
                        right: 1,
                        blobLineNumber: 1,
                        type: 'CONTEXT',
                        html: ` <span>existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 2,
                        right: 2,
                        blobLineNumber: 2,
                        type: 'CONTEXT',
                        html: ` <span>more existing code</span>`,
                      }),
                    ],
                    newTreeEntry: {path: 'file-anchor', lineCount: 3},
                  }),
                ],
              })
            },
          }),
        )
      })

      // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
      // eslint-disable-next-line testing-library/no-node-access
      const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

      // Assert when one left side line is selected
      // eslint-disable-next-line testing-library/no-node-access
      const firstRowLeftSideCell = document.querySelector(
        'td[data-grid-cell-id="diff-file-anchor-1-1-0"]',
      ) as HTMLTableCellElement
      userEvent.click(firstRowLeftSideCell)
      expect(announcements.textContent).toEqual('L1 selected.')

      // Assert when two adjacent left side lines are selected
      // eslint-disable-next-line testing-library/no-node-access
      const secondRowLeftSide = document.querySelector(
        'td[data-grid-cell-id="diff-file-anchor-2-2-0"]',
      ) as HTMLTableCellElement
      userEvent.click(secondRowLeftSide, {shiftKey: true})
      expect(announcements.textContent).toEqual('L1 to L2 selected.')
    })
  })

  describe('as a keyboard user using shift + ArrowDown/ArrowUp', () => {
    test('it announces the selected lines of the diff', async () => {
      const environment = createMockEnvironment()
      const pullRequestId = 'PR_RELAY_ID'
      render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            User() {
              return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
            },
            PullRequest() {
              return buildPullRequest({
                id: pullRequestId,
                diffEntries: [
                  buildDiffEntry({
                    pathDigest: 'file-anchor',
                    diffLines: [
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 1,
                        right: 1,
                        blobLineNumber: 1,
                        type: 'CONTEXT',
                        html: ` <span>existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 2,
                        right: 2,
                        blobLineNumber: 2,
                        type: 'CONTEXT',
                        html: ` <span>more existing code</span>`,
                      }),
                    ],
                    newTreeEntry: {path: 'file-anchor', lineCount: 3},
                  }),
                ],
              })
            },
          }),
        )
      })

      // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
      // eslint-disable-next-line testing-library/no-node-access
      const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

      // Tab into first diff table grid cell
      userEvent.tab()
      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        'diff-file-anchor-1-1-0',
      )

      // Select the first two left lines
      userEvent.keyboard('{Shift>}[ArrowDown]')
      expect(announcements.textContent).toEqual('L1 to L2 selected.')
    })
  })
})

describe('when selecting lines of a split diff from a right side cell', () => {
  describe('as a mouse user using shift + click', () => {
    test('it announces the selected lines of the diff as R1-R2', async () => {
      const environment = createMockEnvironment()
      const pullRequestId = 'PR_RELAY_ID'
      render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            User() {
              return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
            },
            PullRequest() {
              return buildPullRequest({
                id: pullRequestId,
                diffEntries: [
                  buildDiffEntry({
                    pathDigest: 'file-anchor',
                    diffLines: [
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 1,
                        right: 1,
                        blobLineNumber: 1,
                        type: 'CONTEXT',
                        html: ` <span>existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 2,
                        right: 2,
                        blobLineNumber: 2,
                        type: 'CONTEXT',
                        html: ` <span>more existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: null,
                        right: 3,
                        blobLineNumber: 3,
                        type: 'ADDITION',
                        html: `+<span>new code code</span>`,
                      }),
                    ],
                    newTreeEntry: {path: 'file-anchor', lineCount: 3},
                  }),
                ],
              })
            },
          }),
        )
      })

      // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
      // eslint-disable-next-line testing-library/no-node-access
      const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

      // Assert when one right side line is selected
      // eslint-disable-next-line testing-library/no-node-access
      const firstRowRightSideCell = document.querySelector(
        'td[data-grid-cell-id="diff-file-anchor-1-1-3"]',
      ) as HTMLTableCellElement
      userEvent.click(firstRowRightSideCell)
      expect(announcements.textContent).toEqual('R1 selected.')

      // Assert when two right side lines are selected
      // eslint-disable-next-line testing-library/no-node-access
      const secondRowRightSideCell = document.querySelector(
        'td[data-grid-cell-id="diff-file-anchor-2-2-3"]',
      ) as HTMLTableCellElement
      userEvent.click(secondRowRightSideCell, {shiftKey: true})
      expect(announcements.textContent).toEqual('R1 to R2 selected.')
    })
  })

  describe('as a keyboard user using shift + ArrowDown/ArrowUp', () => {
    test('it announces the selected lines of the diff', async () => {
      const environment = createMockEnvironment()
      const pullRequestId = 'PR_RELAY_ID'
      render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            User() {
              return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
            },
            PullRequest() {
              return buildPullRequest({
                id: pullRequestId,
                diffEntries: [
                  buildDiffEntry({
                    pathDigest: 'file-anchor',
                    diffLines: [
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 1,
                        right: 1,
                        blobLineNumber: 1,
                        type: 'CONTEXT',
                        html: ` <span>existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 2,
                        right: 2,
                        blobLineNumber: 2,
                        type: 'CONTEXT',
                        html: ` <span>more existing code</span>`,
                      }),
                    ],
                    newTreeEntry: {path: 'file-anchor', lineCount: 3},
                  }),
                ],
              })
            },
          }),
        )
      })

      // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
      // eslint-disable-next-line testing-library/no-node-access
      const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

      // Tab into first diff table grid
      userEvent.tab()
      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        'diff-file-anchor-1-1-0',
      )

      // Navigate to the right side of the diff
      userEvent.keyboard('[ArrowRight][ArrowRight]')
      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        'diff-file-anchor-1-1-2',
      )

      // Select the first two right lines
      userEvent.keyboard('{Shift>}[ArrowDown]')
      expect(announcements.textContent).toEqual('R1 to R2 selected.')
    })
  })
})

describe('when selecting lines of a split diff from a left side cell, but the last line is an empty cell', () => {
  describe('as a mouse user using shift + click', () => {
    test('nothing happens as empty cells are not selectable with a mouse', async () => {
      const environment = createMockEnvironment()
      const pullRequestId = 'PR_RELAY_ID'
      render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            User() {
              return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
            },
            PullRequest() {
              return buildPullRequest({
                id: pullRequestId,
                diffEntries: [
                  buildDiffEntry({
                    pathDigest: 'file-anchor',
                    diffLines: [
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 1,
                        right: 1,
                        blobLineNumber: 1,
                        type: 'CONTEXT',
                        html: ` <span>existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 2,
                        right: 2,
                        blobLineNumber: 2,
                        type: 'CONTEXT',
                        html: ` <span>more existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: null,
                        right: 3,
                        blobLineNumber: 3,
                        type: 'ADDITION',
                        html: `+<span>new code code</span>`,
                      }),
                    ],
                    newTreeEntry: {path: 'file-anchor', lineCount: 3},
                  }),
                ],
              })
            },
          }),
        )
      })

      // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
      // eslint-disable-next-line testing-library/no-node-access
      const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

      // Assert when one right side line is selected
      // eslint-disable-next-line testing-library/no-node-access
      const firstRowLeftSideCell = document.querySelector(
        'td[data-grid-cell-id="diff-file-anchor-1-1-0"]',
      ) as HTMLTableCellElement
      userEvent.click(firstRowLeftSideCell)
      expect(announcements.textContent).toEqual('L1 selected.')

      // Assert when two right side lines are selected
      // eslint-disable-next-line testing-library/no-node-access
      const thirdRowLeftSideCell = document.querySelector(
        'td[data-grid-cell-id="diff-file-anchor-empty-3-0"]',
      ) as HTMLTableCellElement
      userEvent.click(thirdRowLeftSideCell, {shiftKey: true})
      // verify that nothing has changed
      expect(announcements.textContent).toEqual('L1 selected.')
    })
  })

  describe('as a keyboard user using shift + ArrowDown/ArrowUp', () => {
    test('it announces the selected lines of the diff', async () => {
      const environment = createMockEnvironment()
      const pullRequestId = 'PR_RELAY_ID'
      render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            User() {
              return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
            },
            PullRequest() {
              return buildPullRequest({
                id: pullRequestId,
                diffEntries: [
                  buildDiffEntry({
                    pathDigest: 'file-anchor',
                    diffLines: [
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 1,
                        right: 1,
                        blobLineNumber: 1,
                        type: 'CONTEXT',
                        html: ` <span>existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 2,
                        right: 2,
                        blobLineNumber: 2,
                        type: 'CONTEXT',
                        html: ` <span>more existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: null,
                        right: 3,
                        blobLineNumber: 3,
                        type: 'ADDITION',
                        html: `+<span>new code code</span>`,
                      }),
                    ],
                    newTreeEntry: {path: 'file-anchor', lineCount: 3},
                  }),
                ],
              })
            },
          }),
        )
      })

      // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
      // eslint-disable-next-line testing-library/no-node-access
      const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

      // Tab into first diff table grid
      userEvent.tab()
      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        'diff-file-anchor-1-1-0',
      )

      // Select the first three lines from the left side of the diff
      // The last line will be empty, so the announcement will state L1-R3 selected.
      // This is due to an empty cell always returning the opposite side of the diff as a selection requires a valid fallback cell with a line number
      userEvent.keyboard(`{Shift>}[ArrowDown][ArrowDown][ArrowDown]`)
      expect(announcements.textContent).toEqual('L1 to R3 selected.')

      // Return to the first cell in the table again
      userEvent.keyboard('{Shift>}{Tab}{/Shift}')
      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        'diff-file-anchor-1-1-0',
      )
    })
  })
})

describe('when selecting lines of a split diff from a right side cell, but the last line is an empty cell', () => {
  describe('as a mouse user using shift + click', () => {
    test('nothing happens as empty cells are not selectable with a mouse', async () => {
      const environment = createMockEnvironment()
      const pullRequestId = 'PR_RELAY_ID'
      render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            User() {
              return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
            },
            PullRequest() {
              return buildPullRequest({
                id: pullRequestId,
                diffEntries: [
                  buildDiffEntry({
                    pathDigest: 'file-anchor',
                    diffLines: [
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 1,
                        right: 1,
                        blobLineNumber: 1,
                        type: 'CONTEXT',
                        html: ` <span>existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 2,
                        right: 2,
                        blobLineNumber: 2,
                        type: 'CONTEXT',
                        html: ` <span>more existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 3,
                        right: null,
                        blobLineNumber: 3,
                        type: 'DELETION',
                        html: `-<span>old code</span>`,
                      }),
                    ],
                    newTreeEntry: {path: 'file-anchor', lineCount: 3},
                  }),
                ],
              })
            },
          }),
        )
      })

      // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
      // eslint-disable-next-line testing-library/no-node-access
      const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

      // Assert when one right side line is selected
      // eslint-disable-next-line testing-library/no-node-access
      const firstRowRightSideCell = document.querySelector(
        'td[data-grid-cell-id="diff-file-anchor-1-1-3"]',
      ) as HTMLTableCellElement
      userEvent.click(firstRowRightSideCell)
      expect(announcements.textContent).toEqual('R1 selected.')

      // Assert when two right side lines are selected
      // eslint-disable-next-line testing-library/no-node-access
      const thirdRowRightSideCell = document.querySelector(
        'td[data-grid-cell-id="diff-file-anchor-3-empty-3"]',
      ) as HTMLTableCellElement
      userEvent.click(thirdRowRightSideCell, {shiftKey: true})
      // verify that nothing happens
      expect(announcements.textContent).toEqual('R1 selected.')
    })
  })

  describe('as a keyboard user using shift + ArrowDown/ArrowUp', () => {
    test('it announces the selected lines of the diff', async () => {
      const environment = createMockEnvironment()
      const pullRequestId = 'PR_RELAY_ID'
      render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation =>
          MockPayloadGenerator.generate(operation, {
            User() {
              return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
            },
            PullRequest() {
              return buildPullRequest({
                id: pullRequestId,
                diffEntries: [
                  buildDiffEntry({
                    pathDigest: 'file-anchor',
                    diffLines: [
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 1,
                        right: 1,
                        blobLineNumber: 1,
                        type: 'CONTEXT',
                        html: ` <span>existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 2,
                        right: 2,
                        blobLineNumber: 2,
                        type: 'CONTEXT',
                        html: ` <span>more existing code</span>`,
                      }),
                      buildDiffLine({
                        __id: `diff-${mockUUID()}`,
                        left: 3,
                        right: null,
                        blobLineNumber: 3,
                        type: 'DELETION',
                        html: `-<span>previous code</span>`,
                      }),
                    ],
                    newTreeEntry: {path: 'file-anchor', lineCount: 3},
                  }),
                ],
              })
            },
          }),
        )
      })

      // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
      // eslint-disable-next-line testing-library/no-node-access
      const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

      // Tab into first diff table grid
      userEvent.tab()
      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        'diff-file-anchor-1-1-0',
      )

      // Navigate to the right side of the diff
      userEvent.keyboard('[ArrowRight][ArrowRight]')
      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        'diff-file-anchor-1-1-2',
      )

      // Select the first three lines from the left side of the diff
      // The last line will be empty, so the announcement will state L1-R3 selected.
      // This is due to an empty cell always returning the opposite side of the diff as a selection requires a valid fallback cell with a line number
      userEvent.keyboard(`{Shift>}[ArrowDown][ArrowDown][ArrowDown]`)
      expect(announcements.textContent).toEqual('R1 to L3 selected.')
    })
  })
})

describe('when selecting lines and de-selecting them', () => {
  test('it announces that "Selection cleared."', async () => {
    const environment = createMockEnvironment()
    const pullRequestId = 'PR_RELAY_ID'
    render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          User() {
            return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
          },
          PullRequest() {
            return buildPullRequest({
              id: pullRequestId,
              diffEntries: [
                buildDiffEntry({
                  pathDigest: 'file-anchor',
                  diffLines: [
                    buildDiffLine({
                      __id: `diff-${mockUUID()}`,
                      left: 1,
                      right: 1,
                      blobLineNumber: 1,
                      type: 'CONTEXT',
                      html: ` <span>existing code</span>`,
                    }),
                    buildDiffLine({
                      __id: `diff-${mockUUID()}`,
                      left: 2,
                      right: 2,
                      blobLineNumber: 2,
                      type: 'CONTEXT',
                      html: ` <span>more existing code</span>`,
                    }),
                  ],
                  newTreeEntry: {path: 'file-anchor', lineCount: 3},
                }),
              ],
            })
          },
        }),
      )
    })

    // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
    // eslint-disable-next-line testing-library/no-node-access
    const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

    // Assert when one right side line is selected
    // eslint-disable-next-line testing-library/no-node-access
    const firstRowRightSide = document.querySelector(
      'td[data-grid-cell-id="diff-file-anchor-1-1-3"]',
    ) as HTMLTableCellElement
    userEvent.click(firstRowRightSide)
    expect(announcements.textContent).toEqual('R1 selected.')

    // The common way to clear a selection is to ArrowUp/ArrowDown to a different diffline row in the table.
    // We are using that pattern to test line selection clearing
    userEvent.keyboard('[ArrowUp]')
    expect(announcements.textContent).toEqual('Selection Cleared')
  })
})

describe('with annotations', () => {
  test('renders 1 icon on the line in unified diff mode', async () => {
    mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
    const environment = createMockEnvironment()
    const pullRequestId = 'PR_RELAY_ID'
    const diffLine = buildDiffLine({
      __id: `diff-${mockUUID()}`,
      left: 1,
      right: 1,
      blobLineNumber: 1,
      type: 'ADDITION',
      html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
    })
    const pullRequest = buildPullRequest({
      id: pullRequestId,
      diffEntries: [
        buildDiffEntry({
          pathDigest: 'file-anchor',
          diffLines: [diffLine],
          newTreeEntry: {path: '', lineCount: 1},
        }),
      ],
    })
    const annotations = {
      [diffLine.blobLineNumber]: [buildDiffAnnotation({annotationLevel: DiffAnnotationLevels.Failure})],
    }
    render(<TestComponent annotations={annotations} environment={environment} pullRequestId={pullRequestId} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          User() {
            return buildViewer()
          },
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    // check icon with expected aria label is rendered only once
    expect(screen.getAllByLabelText('Check failure').length).toEqual(1)
  })

  test('does not render icon on deleted line in unified diff mode', async () => {
    mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
    const environment = createMockEnvironment()
    const pullRequestId = 'PR_RELAY_ID'
    const blobLineNumber = 3
    const diffLines = [
      buildDiffLine({
        __id: `diff-${mockUUID()}`,
        left: 3,
        right: null,
        blobLineNumber,
        type: 'DELETION',
        html: `-<span>old code</span>`,
      }),
      buildDiffLine({
        __id: `diff-${mockUUID()}`,
        left: null,
        right: 3,
        blobLineNumber,
        type: 'ADDITION',
        html: `+<span>new code</span>`,
      }),
    ]
    const pullRequest = buildPullRequest({
      id: pullRequestId,
      diffEntries: [
        buildDiffEntry({
          pathDigest: 'file-anchor',
          diffLines,
          newTreeEntry: {path: 'file-anchor', lineCount: 2},
        }),
      ],
    })
    const annotations = {
      [blobLineNumber]: [buildDiffAnnotation({annotationLevel: DiffAnnotationLevels.Notice})],
    }
    render(<TestComponent annotations={annotations} environment={environment} pullRequestId={pullRequestId} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          User() {
            return buildViewer()
          },
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })

    // eslint-disable-next-line testing-library/no-node-access
    const deletedCodeCell = document.querySelector('td[data-line-anchor="diff-file-anchorL3"]') as HTMLTableCellElement
    // eslint-disable-next-line testing-library/no-node-access
    const addedCodeCell = document.querySelector('td[data-line-anchor="diff-file-anchorR3"]') as HTMLTableCellElement

    expect(within(deletedCodeCell).queryByLabelText('Check notice')).not.toBeInTheDocument()
    expect(within(addedCodeCell).getAllByLabelText('Check notice').length).toEqual(1)
  })

  test('renders 1 icon on the right-hand side of the line in split diff mode', async () => {
    mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
    const environment = createMockEnvironment()
    const pullRequestId = 'PR_RELAY_ID'
    const diffLine = buildDiffLine({
      __id: `diff-${mockUUID()}`,
      left: 1,
      right: 1,
      blobLineNumber: 1,
      type: 'CONTEXT',
      html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
    })
    const pullRequest = buildPullRequest({
      id: pullRequestId,
      diffEntries: [
        buildDiffEntry({
          pathDigest: 'file-anchor',
          diffLines: [diffLine],
          newTreeEntry: {path: 'file-anchor', lineCount: 1},
        }),
      ],
    })
    const annotations = {
      [diffLine.blobLineNumber]: [buildDiffAnnotation({annotationLevel: DiffAnnotationLevels.Warning})],
    }
    render(<TestComponent annotations={annotations} environment={environment} pullRequestId={pullRequestId} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          User() {
            return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
          },
          PullRequest() {
            return pullRequest
          },
        }),
      )
    })
    // check that only one row was rendered
    const rows = await screen.findAllByRole('row')
    // the heading is included in the row count
    expect(rows.length).toBe(2)

    // check that 4 cells are rendered for a split diff layout
    const cells = await screen.findAllByRole('gridcell')
    expect(cells.length).toBe(4)

    // check icon with expected aria label is rendered only once
    expect(screen.getAllByLabelText('Check warning').length).toEqual(1)

    // eslint-disable-next-line testing-library/no-node-access
    const rightSideCodeCell = document.querySelector(
      'td[data-line-anchor="diff-file-anchorR1"]',
    ) as HTMLTableCellElement
    expect(within(rightSideCodeCell).getAllByLabelText('Check warning').length).toEqual(1)
  })
})

test('renders 1 avatar on the line when there is a thread', async () => {
  mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [
              buildDiffEntry({
                pathDigest: 'file-anchor',
                diffLines: [
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 1,
                    right: 1,
                    threads: [
                      buildReviewThread({
                        id: 'thread1',
                        comments: [
                          buildComment({
                            bodyHTML: 'test comment',
                          }),
                        ],
                        diffSide: 'LEFT',
                      }) as unknown as PullRequestThread,
                    ],
                    blobLineNumber: 1,
                    type: 'ADDITION',
                    html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
                  }),
                ],
                newTreeEntry: {path: '', lineCount: 1},
              }),
            ],
          })
        },
      }),
    )
  })

  // check image with alt text of monalisa is rendered only once
  expect(screen.getAllByAltText('monalisa').length).toEqual(1)
})

test('selecting multiline comment selects the associated diff lines', async () => {
  mockedUseLocation.mockReturnValue({state: '', key: '', pathname: '', search: '', hash: ''})
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [
              buildDiffEntry({
                pathDigest: 'file-anchor',
                diffLines: [
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 1,
                    right: 1,
                    blobLineNumber: 1,
                    type: 'CONTEXT',
                    html: ` <span>existing code</span>`,
                  }),
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 2,
                    right: 2,
                    blobLineNumber: 2,
                    type: 'CONTEXT',
                    html: ` <span>more existing code</span>`,
                    threads: [
                      buildReviewThread({
                        comments: [buildComment({})],
                        line: 2,
                        startDiffSide: 'RIGHT',
                        diffSide: 'RIGHT',
                        startLine: 1,
                      }) as unknown as PullRequestThread,
                    ],
                  }),
                ],
                newTreeEntry: {path: 'file-anchor', lineCount: 3},
              }),
            ],
          })
        },
      }),
    )
  })

  // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
  // eslint-disable-next-line testing-library/no-node-access
  const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

  const commentIcon = screen.getByAltText('monalisa')
  userEvent.hover(commentIcon)
  const commentButton = screen.getByLabelText('View conversations')
  userEvent.click(commentButton)

  expect(announcements.textContent).toEqual('R1 to R2 selected.')
})

test('clicking add comment does not clear multiline selection', async () => {
  const environment = createMockEnvironment()
  const pullRequestId = 'PR_RELAY_ID'
  render(<TestComponent environment={environment} pullRequestId={pullRequestId} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return buildViewer({pullRequestUserPreferences: {diffView: 'split', ignoreWhitespace: false}})
        },
        PullRequest() {
          return buildPullRequest({
            id: pullRequestId,
            diffEntries: [
              buildDiffEntry({
                pathDigest: 'file-anchor',
                diffLines: [
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 1,
                    right: 1,
                    blobLineNumber: 1,
                    type: 'CONTEXT',
                    html: ` <span>existing code</span>`,
                  }),
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 2,
                    right: 2,
                    blobLineNumber: 2,
                    type: 'CONTEXT',
                    html: ` <span>more existing code</span>`,
                  }),
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 3,
                    right: null,
                    blobLineNumber: 3,
                    type: 'DELETION',
                    html: `-<span>previous code</span>`,
                  }),
                ],
                newTreeEntry: {path: 'file-anchor', lineCount: 3},
              }),
            ],
          })
        },
      }),
    )
  })

  // We are using document.querySelector here as the idea of a grid cell isn't easily testable using the default testing-library query methods.
  // eslint-disable-next-line testing-library/no-node-access
  const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement

  // Select diff lines
  userEvent.tab()
  userEvent.keyboard('[ArrowRight][ArrowRight]')
  userEvent.keyboard(`{Shift>}[ArrowDown][ArrowDown][ArrowDown]`)

  expect(announcements.textContent).toEqual('R1 to L3 selected.')

  // hover the current cell and click the add button
  userEvent.hover(screen.getByText('previous code'))
  const conversationButtons = screen.getAllByLabelText('Start conversation')
  const addCommentButton = conversationButtons[conversationButtons.length - 1]
  expect(addCommentButton).toBeDefined()
  userEvent.click(addCommentButton!)

  // verify that the selection is still there
  expect(announcements.textContent).toEqual('R1 to L3 selected.')
  expect(screen.getByText('Add a comment to lines R1 to L3')).toBeInTheDocument()
})
