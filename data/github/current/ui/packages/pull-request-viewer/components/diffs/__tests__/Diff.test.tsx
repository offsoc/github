import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {mockClientEnv} from '@github-ui/client-env/mock'
import {SelectedDiffRowRangeContextProvider} from '@github-ui/diff-lines'
import {render} from '@github-ui/react-core/test-utils'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {act, fireEvent, screen, waitFor, within} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {FocusedFileContextProvider} from '../../../contexts/FocusedFileContext'
import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import {PullRequestMarkersDialogContextProvider} from '../../../contexts/PullRequestMarkersContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {
  buildComment,
  buildCommentAuthor,
  buildDiffEntry,
  buildDiffLine,
  buildPullRequest,
  buildReviewThread,
  buildViewer,
  mockUUID,
  type PullRequestThread,
} from '../../../test-utils/query-data'
import type {PullRequestsTargetType} from '../../../types/analytics-events-types'
import Diff from '../Diff'
import type {DiffTestQuery} from './__generated__/DiffTestQuery.graphql'

document.dispatchEvent = jest.fn()

jest.mock('@github-ui/react-core/use-app-payload')
const mockedUseAppPayload = jest.mocked(useAppPayload)

mockedUseAppPayload.mockReturnValue({
  ghostUser: {
    displayName: 'Ghost',
    login: 'ghost',
    avatarUrl: 'https://avatars.githubusercontent.com/ghost',
    path: '/ghost',
    url: '/ghost',
  },
})

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
}

function TestComponent({environment, pullRequestId = 'PR_kwAEAg'}: TestComponentProps) {
  const DiffWithRelayQuery = () => {
    const data = useLazyLoadQuery<DiffTestQuery>(
      graphql`
        query DiffTestQuery(
          $pullRequestId: ID!
          $injectedContextLines: [DiffLineRange!]
          $inlineThreadCount: Int = 20
          $singleCommitOid: String
          $endOid: String
          $startOid: String
        ) @relay_test_operation {
          viewer {
            ...Diff_viewer
          }
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...Diff_pullRequest
              comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
                diffEntries(first: 20) {
                  nodes {
                    ...Diff_diffEntry
                  }
                }
              }
            }
          }
        }
      `,
      {
        pullRequestId,
        injectedContextLines: [{start: 0, end: 0}],
      },
    )

    const diffEntry = data.pullRequest?.comparison?.diffEntries.nodes?.[0]

    if (diffEntry) {
      return (
        <Diff
          activeGlobalMarkerID={undefined}
          annotations={{}}
          commitRangeFilterApplied={false}
          diffEntry={diffEntry}
          pullRequest={data.pullRequest}
          pullRequestId={pullRequestId}
          shouldFocusHeader={false}
          viewer={data.viewer}
        />
      )
    }

    return null
  }

  return (
    <FocusedFileContextProvider>
      <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
        <PullRequestContextProvider
          viewerCanComment
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
            <SelectedDiffRowRangeContextProvider>
              <div id="js-global-screen-reader-notice" />
              <DiffWithRelayQuery />
            </SelectedDiffRowRangeContextProvider>
          </PullRequestMarkersDialogContextProvider>
        </PullRequestContextProvider>
      </PullRequestsAppWrapper>
    </FocusedFileContextProvider>
  )
}

function assertDiffLinesRenderedForLines({
  element,
  linesCount,
  startingPoint,
  baseHTML,
}: {
  element: HTMLElement
  linesCount: number
  startingPoint: number
  baseHTML: string
}) {
  // eslint-disable-next-line github/array-foreach
  Array.from({length: linesCount}, (v, i) => i + startingPoint).forEach(blobLineNumber => {
    // We are ingoring Left and Right line numbers for this test as it's not necessary
    expect(within(element).getAllByText(blobLineNumber).length).toBe(2)
    within(element).getByText(`${baseHTML}${blobLineNumber}`)
  })
}

function refuteDiffLinesRenderedForLines({
  element,
  linesCount,
  startingPoint,
}: {
  element: HTMLElement
  linesCount: number
  startingPoint: number
}) {
  // eslint-disable-next-line github/array-foreach
  Array.from({length: linesCount}, (v, i) => i + startingPoint).forEach(blobLineNumber => {
    // We are ingoring Left and Right line numbers for this test as it's not necessary
    expect(within(element).queryByText(blobLineNumber)).not.toBeInTheDocument()
  })
}

const defaultContextLineHTML = 'Rendering diffline: '

function buildContextLineHTML(lineNumber: number) {
  return `${defaultContextLineHTML}${lineNumber}`
}

beforeEach(() => {
  mockClientEnv({
    featureFlags: ['prx'],
  })
})

// Save a copy of the navigation clipboard config so we can reset it after the tests have run
const originalClipboard = navigator.clipboard
afterEach(() => {
  jest.restoreAllMocks()
  Object.assign(navigator, {...originalClipboard})
})

jest.setTimeout(10000)

describe('when the entire diff has no injected context difflines', () => {
  test('it does not render any expand buttons', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 2,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')
    // Just using 'Expand' text with Regex to determine that no Expand buttons are rendered
    // as this is the start text aria label for each button
    expect(within(diffContent).queryAllByText(/Expand/)).toHaveLength(0)
  })
})

describe('when the first diffline in a diff is not the start of a file', () => {
  test('continuous clicking on the expand up button will eventually render all injected difflines until the refetching reaches the start of the file', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [
            // stubbing response for diffline 22 as hunk and diffline 23 as context
            buildDiffLine({blobLineNumber: 22, type: 'HUNK', html: '@@ -23,6 +23,7 @@'}),
            buildDiffLine({
              blobLineNumber: 23,
              type: 'CONTEXT',
              html: buildContextLineHTML(23),
            }),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 23,
          },
        }),
      ],
    })
    const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

    const {user} = render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')

    const firstExpandUpButton = within(diffContent).getByLabelText('Expand file up from line 23')
    await user.click(firstExpandUpButton)

    const firstDiffEntryUpdate = {
      ...initialDiffEntry,
      diffLines: [
        // stubbing response for diffline 2 as hunk and difflines 3-23 as context
        buildDiffLine({blobLineNumber: 2, type: 'HUNK', html: '@@ -3,6 +3,7 @@'}),
        ...Array.from({length: 20}, (v, i) => i + 3).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
        // Remove original hunk that was clicked on and replaced above
        ...initialDiffEntry.diffLines.slice(1),
      ],
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([{start: 2, end: 22}])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return firstDiffEntryUpdate
          },
        })
      })
    })

    // assert that the old hunk diffline associated with the expandup button is no longer rendered
    expect(within(diffContent).queryByText('@@ -23,6 +23,7 @@')).not.toBeInTheDocument()
    // assert that the new hunk diffline is being rendered
    expect(within(diffContent).getByText('@@ -3,6 +3,7 @@')).toBeInTheDocument()
    // assert that the new rows + original rows are being rendered
    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 21,
      startingPoint: 3,
      baseHTML: defaultContextLineHTML,
    })

    const finalExpandUpButton = within(diffContent).getByLabelText('Expand file up from line 3')
    await user.click(finalExpandUpButton)

    const finalPatchUpdate = {
      ...initialDiffEntry,
      diffLines: [
        // stubbing response for context difflines 1-23
        ...Array.from({length: 2}, (v, i) => i + 1).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
        // Remove original hunk that was clicked on and replaced above
        ...firstDiffEntryUpdate.diffLines.slice(1),
      ],
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([
          {start: 2, end: 22},
          {start: 0, end: 2},
        ])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return finalPatchUpdate
          },
        })
      })
    })

    // assert that no expand up buttons are rendered
    expect(within(diffContent).queryByLabelText('Expand Up')).not.toBeInTheDocument()
    // assert that the both of the old hunk difflines associated with the expandup buttons are no longer rendered
    expect(within(diffContent).queryByText('@@ -23,6 +23,7 @@')).not.toBeInTheDocument()
    expect(within(diffContent).queryByText('@@ -3,6 +3,7 @@')).not.toBeInTheDocument()
    // assert that the new rows + the previous rows are being rendered
    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 23,
      startingPoint: 1,
      baseHTML: defaultContextLineHTML,
    })
  })
})

describe('when the end diffline in a diff is not the end of a file', () => {
  test('continuous clicking on the expand down button will eventually render all injected difflines until the refetching reaches end of file', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for context difflines 1
          diffLines: [buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)})],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 30,
          },
        }),
      ],
    })
    const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

    const {user} = render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')

    const firstExpandDownButton = within(diffContent).getByLabelText('Expand file down from line 1')
    await user.click(firstExpandDownButton)

    const firstDiffEntryUpdate = {
      ...initialDiffEntry,
      diffLines: [
        // stubbing response for context difflines 1-22
        ...initialDiffEntry.diffLines,
        ...Array.from({length: 21}, (v, i) => i + 2).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'INJECTED_CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
      ],
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([{start: 2, end: 22}])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return firstDiffEntryUpdate
          },
        })
      })
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 22,
      startingPoint: 1,
      baseHTML: defaultContextLineHTML,
    })

    const finalExpandDownButton = within(diffContent).getByLabelText('Expand file down from line 22')
    await user.click(finalExpandDownButton)

    const finalPatchUpdate = {
      ...initialDiffEntry,
      diffLines: [
        // stubbing response for context difflines 1-23
        ...firstDiffEntryUpdate.diffLines,
        ...Array.from({length: 9}, (v, i) => i + 23).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
      ],
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([
          {start: 2, end: 22},
          {start: 23, end: 43},
        ])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return finalPatchUpdate
          },
        })
      })
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 30,
      startingPoint: 1,
      baseHTML: defaultContextLineHTML,
    })
  })
})

describe('when the first diffline in a diff is the start of a file', () => {
  test('it does not render an exand up button on the top diffline hunk', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for diffline 0 as hunk and diffline 1 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 1,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')

    expect(within(diffContent).queryByLabelText('Expand file up from line 1')).not.toBeInTheDocument()
  })
})

describe('when the last diffline in a diff is the end of a file', () => {
  test('it does not render an expand down button after the last diff line', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for diffline 0 as hunk and difflines 1-2 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 2,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')

    expect(within(diffContent).queryByLabelText('Expand file down from line 2')).not.toBeInTheDocument()
  })
})

describe('when the middle of the diff has a hunk diffline and the previous and next diffline have exactly 20 missing lines', () => {
  test('it renders an expand all button', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 22 as hunk and difflines 1-2 & 23 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 22, type: 'HUNK', html: '@@ -23,29 +23,30 @@'}),
            buildDiffLine({blobLineNumber: 23, type: 'CONTEXT', html: buildContextLineHTML(23)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 23,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')

    expect(within(diffContent).getByLabelText('Expand file from line 2 to line 23')).toBeInTheDocument()
  })

  test('clicking the expand all button in-between 2 difflines will render the missing injected lines between them and remove the expand button', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 22 as hunk and difflines 1-2 & 23 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 22, type: 'HUNK', html: '@@ -23,29 +23,30 @@'}),
            buildDiffLine({blobLineNumber: 23, type: 'CONTEXT', html: buildContextLineHTML(23)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 23,
          },
        }),
      ],
    })
    const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

    const {user} = render(<TestComponent environment={environment} />)

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
    const diffContent = await screen.findByTestId('diff-content')
    const expandButton = within(diffContent).getByLabelText('Expand file from line 2 to line 23')
    await user.click(expandButton)

    const firstDiffEntryUpdate = {
      ...initialDiffEntry,
      // stubbing response for difflines 0 as hunk and difflines 1-23 as context
      diffLines: [
        ...initialDiffEntry.diffLines.slice(0, 3),
        ...Array.from({length: 20}, (v, i) => i + 3).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
        ...initialDiffEntry.diffLines.slice(4),
      ],
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([{start: 2, end: 22}])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return firstDiffEntryUpdate
          },
        })
      })
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 23,
      startingPoint: 1,
      baseHTML: defaultContextLineHTML,
    })

    expect(within(diffContent).queryByLabelText('Expand file from line 2 to line 23')).not.toBeInTheDocument()

    // send analytics
    expectAnalyticsEvents<PullRequestsTargetType>({
      type: 'file_entry.expand_hunk',
      target: 'FILE_EXPANDER_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    })
  })
})

describe('when the middle of the diff has a hunk diffline and the previous and next diffline has less than 20 missing lines', () => {
  test('it renders an expand all button', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 22 as hunk and difflines 1-2 & 22 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 21, type: 'HUNK', html: '@@ -22,29 +22,30 @@'}),
            buildDiffLine({blobLineNumber: 22, type: 'CONTEXT', html: buildContextLineHTML(22)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 22,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')

    expect(within(diffContent).getByLabelText('Expand file from line 2 to line 22')).toBeInTheDocument()
  })

  test('clicking the expand all button in-between 2 difflines will render the missing injected lines between them and remove the expand button', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 22 as hunk and difflines 1-2 & 22 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 22, type: 'HUNK', html: '@@ -22,29 +22,30 @@'}),
            buildDiffLine({blobLineNumber: 22, type: 'CONTEXT', html: buildContextLineHTML(22)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 22,
          },
        }),
      ],
    })
    const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

    const {user} = render(<TestComponent environment={environment} />)

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
    const diffContent = await screen.findByTestId('diff-content')
    const expandButton = within(diffContent).getByLabelText('Expand file from line 2 to line 22')
    await user.click(expandButton)

    const firstDiffEntryUpdate = {
      ...initialDiffEntry,
      // stubbing response for difflines 0 as hunk and difflines 1-22 as context
      diffLines: [
        ...initialDiffEntry.diffLines.slice(0, 3),
        ...Array.from({length: 19}, (v, i) => i + 3).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
        ...initialDiffEntry.diffLines.slice(4),
      ],
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([{start: 2, end: 22}])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return firstDiffEntryUpdate
          },
        })
      })
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 22,
      startingPoint: 1,
      baseHTML: defaultContextLineHTML,
    })

    expect(within(diffContent).queryByLabelText('Expand file from line 2 to line 22')).not.toBeInTheDocument()
  })
})

describe('when the middle of the diff has a hunk diffline and the previous and next diffline has less than 20 missing lines (2)', () => {
  test('it renders an expand all button', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 22 as hunk and difflines 1-2 & 22 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 21, type: 'HUNK', html: '@@ -22,29 +22,30 @@'}),
            buildDiffLine({blobLineNumber: 22, type: 'CONTEXT', html: buildContextLineHTML(22)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 22,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')

    expect(within(diffContent).getByLabelText('Expand file from line 2 to line 22')).toBeInTheDocument()
  })

  test('clicking the expand all button in-between 2 difflines will render the missing injected lines between them and remove the expand button', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 22 as hunk and difflines 1-2 & 22 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 22, type: 'HUNK', html: '@@ -22,29 +22,30 @@'}),
            buildDiffLine({blobLineNumber: 22, type: 'CONTEXT', html: buildContextLineHTML(22)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 22,
          },
        }),
      ],
    })
    const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

    const {user} = render(<TestComponent environment={environment} />)

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
    const diffContent = await screen.findByTestId('diff-content')
    const expandButton = within(diffContent).getByLabelText('Expand file from line 2 to line 22')
    await user.click(expandButton)

    const firstDiffEntryUpdate = {
      ...initialDiffEntry,
      // stubbing response for difflines 0 as hunk and difflines 1-22 as context
      diffLines: [
        ...initialDiffEntry.diffLines.slice(0, 3),
        ...Array.from({length: 19}, (v, i) => i + 3).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
        ...initialDiffEntry.diffLines.slice(4),
      ],
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([{start: 2, end: 22}])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return firstDiffEntryUpdate
          },
        })
      })
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 22,
      startingPoint: 1,
      baseHTML: defaultContextLineHTML,
    })

    expect(within(diffContent).queryByLabelText('Expand file from line 2 to line 22')).not.toBeInTheDocument()
  })
})

describe('when the middle of the diff has a hunk diffline and the previous and next diffline has more than 20 missing lines', () => {
  test('it renders an expand up and expand down button in between the missing difflines', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 23 as hunk and difflines 1-2 & 24 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 23, type: 'HUNK', html: '@@ -24,29 +24,30 @@'}),
            buildDiffLine({blobLineNumber: 24, type: 'CONTEXT', html: buildContextLineHTML(24)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 24,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')

    expect(within(diffContent).getByLabelText('Expand file down from line 2')).toBeInTheDocument()
    expect(within(diffContent).getByLabelText('Expand file up from line 24')).toBeInTheDocument()
  })

  test('clicking the expand down button in-between the 2 difflines will render the next 20 missing injected difflines and replace the expand down and expand up button with an expand all button when difference in missing difflines is less than 21', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 23 as hunk and difflines 1-2 & 24 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 23, type: 'HUNK', html: '@@ -24,29 +24,30 @@'}),
            buildDiffLine({blobLineNumber: 24, type: 'CONTEXT', html: buildContextLineHTML(24)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 24,
          },
        }),
      ],
    })
    const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

    const {user} = render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')
    within(diffContent).getByLabelText('Expand file up from line 24')
    const expandDownButton = within(diffContent).getByLabelText('Expand file down from line 2')
    await user.click(expandDownButton)

    const firstDiffEntryUpdate = {
      ...initialDiffEntry,
      // stubbing response for difflines 0 & 23 as hunk and difflines 1-21 & 24 as context
      diffLines: [
        ...initialDiffEntry.diffLines.slice(0, 3),
        ...Array.from({length: 19}, (v, i) => i + 3).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
        ...initialDiffEntry.diffLines.slice(3),
      ],
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([{start: 3, end: 23}])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return firstDiffEntryUpdate
          },
        })
      })
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 21,
      startingPoint: 1,
      baseHTML: defaultContextLineHTML,
    })

    refuteDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 2,
      startingPoint: 22,
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 1,
      startingPoint: 24,
      baseHTML: defaultContextLineHTML,
    })

    expect(within(diffContent).queryByLabelText('Expand file down from line 2')).not.toBeInTheDocument()
    expect(within(diffContent).queryByLabelText('Expand file up from line 24')).not.toBeInTheDocument()

    within(diffContent).getByLabelText('Expand file from line 21 to line 24')
  })

  test('clicking the expand up button in-between the 2 difflines will render the previous 20 missing injected difflines and replace the expand down and expand up button with an expand all button when difference in missing difflines is less than 21', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for difflines 0 & 23 as hunk and difflines 1-2 & 24 as context
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 23, type: 'HUNK', html: '@@ -24,29 +24,30 @@'}),
            buildDiffLine({blobLineNumber: 24, type: 'CONTEXT', html: buildContextLineHTML(24)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 24,
          },
        }),
      ],
    })
    const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

    const {user} = render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')
    within(diffContent).getByLabelText('Expand file down from line 2')
    const expandUpButton = within(diffContent).getByLabelText('Expand file up from line 24')
    await user.click(expandUpButton)

    const firstDiffEntryUpdate = {
      ...initialDiffEntry,
      // stubbing response for difflines 0 & 4 as hunk and difflines 1-2 & 5-24 as context
      diffLines: [
        ...initialDiffEntry.diffLines.slice(0, 3),
        buildDiffLine({blobLineNumber: 4, type: 'HUNK', html: '@@ -5,29 +5,30 @@'}),
        ...Array.from({length: 19}, (v, i) => i + 5).map(blobLineNumber =>
          buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
        ),
        ...initialDiffEntry.diffLines.slice(4),
      ],
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.fragment.variables.injectedContextLines).toEqual([{start: 3, end: 23}])
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return firstDiffEntryUpdate
          },
        })
      })
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 2,
      startingPoint: 1,
      baseHTML: defaultContextLineHTML,
    })

    refuteDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 2,
      startingPoint: 3,
    })

    assertDiffLinesRenderedForLines({
      element: diffContent,
      linesCount: 20,
      startingPoint: 5,
      baseHTML: defaultContextLineHTML,
    })

    expect(within(diffContent).queryByLabelText('Expand file down from line 2')).not.toBeInTheDocument()
    expect(within(diffContent).queryByLabelText('Expand file up from line 24')).not.toBeInTheDocument()

    within(diffContent).getByLabelText('Expand file from line 2 to line 5')
  })
})

describe('if the blobLineNumber on a diffline with a type of HUNK is <= 0', () => {
  test('it will not render expand button of any kind', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          // stubbing response for when there are 2 hunks as the start of a diff wrapping a deletion
          diffLines: [
            buildDiffLine({blobLineNumber: -1, type: 'HUNK', html: '@@ -0 +0,0 @@'}),
            buildDiffLine({blobLineNumber: 0, left: 0, type: 'DELETION', html: '-Dui sapien eget mi proin sed.'}),
            buildDiffLine({blobLineNumber: 0, left: 1, type: 'HUNK', html: '@@ -2,3 +1,4 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: '+Replacement text'}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 1,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const diffContent = await screen.findByTestId('diff-content')
    expect(within(diffContent).queryByLabelText(/Expand file/)).not.toBeInTheDocument()
  })
})

describe('when a hunk is expanded', () => {
  describe('up', () => {
    test('focus is correctly transferred to the correct element', async () => {
      const environment = createMockEnvironment()
      const pullRequest = buildPullRequest({
        diffEntries: [
          buildDiffEntry({
            // stubbing response for difflines 0 & 23 as hunk and difflines 1-2 & 24 as context
            diffLines: [
              buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
              buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
              buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
              buildDiffLine({blobLineNumber: 23, type: 'HUNK', html: '@@ -24,29 +24,30 @@'}),
              buildDiffLine({blobLineNumber: 24, type: 'CONTEXT', html: buildContextLineHTML(24)}),
            ],
            // To set file line count
            newTreeEntry: {
              path: 'test.md',
              lineCount: 24,
            },
          }),
        ],
      })
      const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

      const {user} = render(<TestComponent environment={environment} />)

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

      const diffContent = await screen.findByTestId('diff-content')
      within(diffContent).getByLabelText('Expand file down from line 2')
      const expandUpButton = within(diffContent).getByLabelText('Expand file up from line 24')

      // click the cell to give it focus, then tab to the up button
      // eslint-disable-next-line testing-library/no-node-access
      await user.click(expandUpButton.parentElement as HTMLElement)
      await user.tab()
      await user.tab()
      await user.keyboard('{enter}')

      const firstDiffEntryUpdate = {
        ...initialDiffEntry,
        diffLines: [
          ...initialDiffEntry.diffLines.slice(0, 3),
          buildDiffLine({blobLineNumber: 4, type: 'HUNK', html: '@@ -5,29 +5,30 @@'}),
          ...Array.from({length: 19}, (v, i) => i + 5).map(blobLineNumber =>
            buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
          ),
          ...initialDiffEntry.diffLines.slice(4),
        ],
      }
      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation => {
          return MockPayloadGenerator.generate(operation, {
            PullRequestDiffEntry() {
              return firstDiffEntryUpdate
            },
          })
        })
      })

      // the next expand button should be focused
      expect(screen.getByLabelText('Expand file from line 2 to line 5')).toHaveFocus()
      await user.keyboard('{enter}')

      const secondDiffEntryUpdate = {
        ...firstDiffEntryUpdate,
        diffLines: [
          ...firstDiffEntryUpdate.diffLines.slice(0, 3),
          buildDiffLine({blobLineNumber: 4, type: 'CONTEXT', html: '<span>context line</span>'}),
          ...firstDiffEntryUpdate.diffLines.slice(4),
        ],
      }

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation => {
          return MockPayloadGenerator.generate(operation, {
            PullRequestDiffEntry() {
              return secondDiffEntryUpdate
            },
          })
        })
      })

      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        `diff-${initialDiffEntry.pathDigest}-4-4-0`,
      )
    })
  })

  describe('down', () => {
    test('focus is correctly transferred to the correct element', async () => {
      const environment = createMockEnvironment()
      const pullRequest = buildPullRequest({
        diffEntries: [
          buildDiffEntry({
            // stubbing response for difflines 0 & 23 as hunk and difflines 1-2 & 24 as context
            diffLines: [
              buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
              buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
              buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
              buildDiffLine({blobLineNumber: 23, type: 'HUNK', html: '@@ -24,29 +24,30 @@'}),
              buildDiffLine({blobLineNumber: 24, type: 'CONTEXT', html: buildContextLineHTML(24)}),
            ],
            // To set file line count
            newTreeEntry: {
              path: 'test.md',
              lineCount: 24,
            },
          }),
        ],
      })
      const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

      const {user} = render(<TestComponent environment={environment} />)

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

      const diffContent = await screen.findByTestId('diff-content')
      within(diffContent).getByLabelText('Expand file up from line 24')
      const expandUpButton = within(diffContent).getByLabelText('Expand file down from line 2')

      // click the cell to give it focus, then tab to the down button
      // eslint-disable-next-line testing-library/no-node-access
      await user.click(expandUpButton.parentElement as HTMLElement)
      await user.tab()
      await user.keyboard('{enter}')

      const firstDiffEntryUpdate = {
        ...initialDiffEntry,
        // stubbing response for difflines 0 & 4 as hunk and difflines 1-2 & 5-24 as context
        diffLines: [
          ...initialDiffEntry.diffLines.slice(0, 3),
          ...Array.from({length: 19}, (v, i) => i + 4).map(blobLineNumber =>
            buildDiffLine({blobLineNumber, type: 'CONTEXT', html: buildContextLineHTML(blobLineNumber)}),
          ),
          ...initialDiffEntry.diffLines.slice(3),
        ],
      }

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation => {
          return MockPayloadGenerator.generate(operation, {
            PullRequestDiffEntry() {
              return firstDiffEntryUpdate
            },
          })
        })
      })

      // the next expand button should be focused
      expect(screen.getByLabelText('Expand file from line 22 to line 24')).toHaveFocus()
      await user.keyboard('{enter}')

      const secondDiffEntryUpdate = {
        ...firstDiffEntryUpdate,
        diffLines: [
          ...firstDiffEntryUpdate.diffLines.slice(0, 22),
          buildDiffLine({blobLineNumber: 23, type: 'CONTEXT', html: '<span>context line</span>'}),
          ...firstDiffEntryUpdate.diffLines.slice(23),
        ],
      }

      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        environment.mock.resolveMostRecentOperation(operation => {
          return MockPayloadGenerator.generate(operation, {
            PullRequestDiffEntry() {
              return secondDiffEntryUpdate
            },
          })
        })
      })

      // eslint-disable-next-line testing-library/no-node-access
      expect((document.activeElement as HTMLTableCellElement).getAttribute('data-grid-cell-id')).toEqual(
        `diff-${initialDiffEntry.pathDigest}-23-23-0`,
      )
    })
  })

  test('expanded diff lines are copied when selecting the whole diff', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [
            // stubbing response for diffline 22 as hunk and diffline 23 as context
            buildDiffLine({blobLineNumber: 2, type: 'HUNK', html: 'first hunk'}),
            buildDiffLine({
              left: 3,
              right: 2,
              blobLineNumber: 3,
              type: 'DELETION',
              html: 'before',
            }),
            buildDiffLine({
              left: 3,
              right: 3,
              blobLineNumber: 3,
              type: 'ADDITION',
              html: 'after',
            }),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 3,
          },
        }),
      ],
    })
    const initialDiffEntry = pullRequest.comparison.diffEntries.nodes[0]!

    const {user} = render(<TestComponent environment={environment} />)
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

    const diffContent = await screen.findByTestId('diff-content')

    const firstExpandUpButton = within(diffContent).getByLabelText('Expand file up from line 3')
    await user.click(firstExpandUpButton)

    const firstDiffEntryUpdate = {
      ...initialDiffEntry,
      diffLines: [
        buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: 'first hunk'}),
        buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
        buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
        ...initialDiffEntry.diffLines.slice(1),
      ],
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequestDiffEntry() {
            return firstDiffEntryUpdate
          },
        })
      })
    })

    const firstLine = within(diffContent).getByText('Rendering diffline: 1')
    fireEvent.contextMenu(firstLine)
    const selectAll = await screen.findByText('Select all')
    await user.click(selectAll)

    // eslint-disable-next-line testing-library/no-node-access
    const announcements = document.querySelector('#js-global-screen-reader-notice') as HTMLDivElement
    await waitFor(() => expect(announcements.textContent).toEqual('L1 to R3 selected.'))

    fireEvent.contextMenu(firstLine)
    const copyCode = await screen.findByText('Copy code')
    await user.click(copyCode)
    await expect(navigator.clipboard.readText()).resolves.toEqual(
      'Rendering diffline: 1\nRendering diffline: 2\nbefore\nafter',
    )
  })
})

describe('start conversation buttons', () => {
  test('are rendered for normal diff lines', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'DELETION', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 2, type: 'ADDITION', html: buildContextLineHTML(2)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 2,
          },
        }),
      ],
    })

    const {user} = render(<TestComponent environment={environment} />)

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

    const contentCells = screen.getAllByRole('gridcell')
    const hunkLine = contentCells[0]

    const diffLineNumbers = [1, 2, 3]
    for (const num of diffLineNumbers) {
      // Get the code content cell for line
      const line = contentCells[num * 3]
      expect(line).not.toBeNull()
      fireEvent.mouseOver(line!)
      expect(screen.getByLabelText('Start conversation')).toBeInTheDocument()
      const moreActions = screen.getByLabelText('More actions')
      fireEvent.click(moreActions)
      expect(screen.getByText(/Start conversation on line/i)).toBeInTheDocument()

      // click off to clear menus
      fireEvent.mouseOver(hunkLine!)
      await user.click(hunkLine!)
    }
  })

  test('are not rendered for injected context lines', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'INJECTED_CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 3, type: 'CONTEXT', html: buildContextLineHTML(3)}),
            buildDiffLine({blobLineNumber: 4, type: 'CONTEXT', html: buildContextLineHTML(4)}),
            buildDiffLine({blobLineNumber: 5, type: 'ADDITION', html: buildContextLineHTML(5)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 5,
          },
        }),
      ],
    })

    render(<TestComponent environment={environment} />)

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

    const contentCells = screen.getAllByRole('gridcell')

    // Get the code content cell for line 1 - INJECTED_CONTEXT
    const injectedContextLine = contentCells[1 * 3]
    expect(injectedContextLine).not.toBeNull()
    fireEvent.mouseOver(injectedContextLine!)
    expect(screen.queryByLabelText('Start conversation')).not.toBeInTheDocument()
    fireEvent.mouseOver(injectedContextLine!)
    expect(screen.queryByLabelText('Start conversation')).not.toBeInTheDocument()
    const moreActionsOnInjectedContext = screen.getByLabelText('More actions')
    fireEvent.click(moreActionsOnInjectedContext)
    expect(screen.queryByText(/Start conversation on line/i)).not.toBeInTheDocument()
  })

  test('are rendered for selected ranges as long as the range does not include injected context', async () => {
    const environment = createMockEnvironment()
    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [
            buildDiffLine({blobLineNumber: 0, type: 'HUNK', html: '@@ -1,29 +1,30 @@'}),
            buildDiffLine({blobLineNumber: 1, type: 'INJECTED_CONTEXT', html: buildContextLineHTML(1)}),
            buildDiffLine({blobLineNumber: 2, type: 'CONTEXT', html: buildContextLineHTML(2)}),
            buildDiffLine({blobLineNumber: 3, type: 'CONTEXT', html: buildContextLineHTML(3)}),
            buildDiffLine({blobLineNumber: 4, type: 'CONTEXT', html: buildContextLineHTML(4)}),
            buildDiffLine({blobLineNumber: 5, type: 'ADDITION', html: buildContextLineHTML(5)}),
          ],
          // To set file line count
          newTreeEntry: {
            path: 'test.md',
            lineCount: 5,
          },
        }),
      ],
    })

    const {user} = render(<TestComponent environment={environment} />)

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

    const contentCells = screen.getAllByRole('gridcell')
    const hunkLine = contentCells[0]

    const injectedContextLine = contentCells[1 * 3]
    const contextLine = contentCells[2 * 3]
    const additionLine = contentCells[5 * 3]

    await user.click(contextLine!)
    await user.keyboard('[ShiftLeft>]') // Press Shift (without releasing it)
    await user.click(additionLine!)
    await user.keyboard('[/ShiftLeft]') // Release Shift

    // click off clear menus from clicking
    fireEvent.mouseOver(hunkLine!)
    await user.click(hunkLine!)

    fireEvent.mouseOver(additionLine!)

    expect(screen.getByLabelText('Start conversation')).toBeInTheDocument()
    let moreActions = screen.getByLabelText('More actions')
    fireEvent.click(moreActions)
    expect(screen.getByText('Start conversation on lines R2-R5')).toBeInTheDocument()

    await user.click(injectedContextLine!)
    await user.keyboard('[ShiftLeft>]') // Press Shift (without releasing it)
    await user.click(additionLine!)
    await user.keyboard('[/ShiftLeft]') // Release Shift

    // tab away to clear menus from clicking
    await user.tab()
    await user.tab()
    await user.tab()

    fireEvent.mouseOver(additionLine!)

    expect(screen.queryByLabelText('Start conversation')).not.toBeInTheDocument()
    moreActions = screen.getByLabelText('More actions')
    fireEvent.click(moreActions)
    expect(screen.queryByText(/Start conversation on line/i)).not.toBeInTheDocument()
  })
})

describe('when a comment is added', () => {
  test('comment indicator is shown after first comment is added to a line', async () => {
    const environment = createMockEnvironment()
    const lineHtml = '+additional context'
    const threadConnectionId = mockUUID()
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
      threads: [],
      threadConnectionId,
    })

    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [line],
        }),
      ],
      viewerCanComment: true,
    })

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return pullRequest
          },
        })
      })
    })

    let contentCells = await screen.findAllByRole('gridcell')
    let contentCell = contentCells[contentCells.length - 1]
    expect(contentCell).not.toBeNull()
    fireEvent.mouseOver(contentCell!)
    const startConversationButton = await screen.findByLabelText('Start conversation')
    await user.click(startConversationButton)
    const commentInput = await screen.findByPlaceholderText('Leave a comment')
    await user.type(commentInput, 'test comment')
    const submitButton = await screen.findByText('Add comment')
    await user.click(submitButton)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequestThread() {
            return buildReviewThread({
              comments: [
                buildComment({
                  author: buildCommentAuthor({login: 'collaborator'}),
                  bodyHTML: 'test comment',
                }),
              ],
            })
          },
        })
      })
    })

    contentCells = await screen.findAllByRole('gridcell')
    contentCell = contentCells[contentCells.length - 1]
    const avatar = await within(contentCell!).findByAltText('collaborator')
    expect(avatar).toBeInTheDocument()
  }, 10000)

  test('comment indicator is updated after second thread is added to a line', async () => {
    const environment = createMockEnvironment()
    const lineHtml = '+additional context'
    const threadConnectionId = mockUUID()
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
      threads: [buildReviewThread({comments: [buildComment({})]}) as unknown as PullRequestThread],
      threadConnectionId,
    })

    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [line],
        }),
      ],
      viewerCanComment: true,
    })

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return pullRequest
          },
        })
      })
    })

    let contentCells = await screen.findAllByRole('gridcell', undefined, {timeout: 10000})
    let contentCell = contentCells[contentCells.length - 1]
    expect(contentCell).not.toBeNull()
    fireEvent.mouseOver(contentCell!)
    const startConversationButton = await screen.findByLabelText('Start conversation')
    await user.click(startConversationButton)
    const commentInput = await screen.findByPlaceholderText('Leave a comment')
    await user.type(commentInput, 'test comment 2')
    const submitButton = await screen.findByText('Add comment')
    await user.click(submitButton)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequestThread() {
            return buildReviewThread({
              comments: [
                buildComment({
                  author: buildCommentAuthor({login: 'collaborator'}),
                  bodyHTML: 'test comment',
                }),
              ],
            })
          },
        })
      })
    })

    contentCells = await screen.findAllByRole('gridcell')
    contentCell = contentCells[contentCells.length - 1]
    const avatar1 = await within(contentCell!).findByAltText('collaborator')
    expect(avatar1).toBeInTheDocument()
    const avatar2 = await within(contentCell!).findByAltText('monalisa')
    expect(avatar2).toBeInTheDocument()
    expect(await screen.findByText('2')).toBeInTheDocument()
  })

  // TODO: fix on seperate issue update test to remove builders and instead use mocks with minimal explicit returns for mocks
  test.skip('comment indicator is updated after comment is added to a thread', async () => {
    const environment = createMockEnvironment()
    const lineHtml = '+additional context'
    const commentsConnectionId = mockUUID()
    const thread = buildReviewThread({
      commentsConnectionId,
      comments: [buildComment({bodyHTML: 'test comment 1'})],
      viewerCanReply: true,
    })
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
      threads: [thread as unknown as PullRequestThread],
    })

    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [line],
        }),
      ],
      viewerCanComment: true,
    })

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return pullRequest
          },
        })
      })
    })

    let contentCells = await screen.findAllByRole('gridcell')
    let contentCell = contentCells[contentCells.length - 1]
    expect(contentCell).not.toBeNull()
    fireEvent.mouseOver(contentCell!)
    const viewConversationsButton = await screen.findByLabelText('View conversations')
    await user.click(viewConversationsButton)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequestThread() {
            return thread
          },
        })
      })
    })

    const replyButton = await screen.findByText('Write a reply')
    await user.click(replyButton)
    const commentInput = await screen.findByPlaceholderText('Leave a comment')
    await user.type(commentInput, 'test comment 2')
    const submitButton = await screen.findByText('Reply')
    await user.click(submitButton)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return pullRequest
          },
          PullRequestReviewComment() {
            return buildComment({
              author: buildCommentAuthor({login: 'collaborator'}),
              bodyHTML: 'test comment',
            })
          },
        })
      })
    })

    contentCells = await screen.findAllByRole('gridcell')
    contentCell = contentCells[contentCells.length - 1]
    const avatar1 = await within(contentCell!).findByAltText('collaborator')
    expect(avatar1).toBeInTheDocument()
    const avatar2 = await within(contentCell!).findByAltText('monalisa')
    expect(avatar2).toBeInTheDocument()
    expect(await screen.findByText('2')).toBeInTheDocument()
  })

  test('thread list shows correct comment count', async () => {
    const environment = createMockEnvironment()
    const lineHtml = '+additional context'
    const threadConnectionId = mockUUID()
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
      threads: [
        buildReviewThread({
          comments: [buildComment({bodyHTML: 'test comment 1'}), buildComment({bodyHTML: 'test comment 2'})],
        }) as unknown as PullRequestThread,
      ],
      threadConnectionId,
    })

    const pullRequest = buildPullRequest({
      diffEntries: [
        buildDiffEntry({
          diffLines: [line],
        }),
      ],
      viewerCanComment: true,
    })

    const {user} = render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        return MockPayloadGenerator.generate(operation, {
          Viewer() {
            return buildViewer()
          },
          PullRequest() {
            return pullRequest
          },
        })
      })
    })

    let contentCells = await screen.findAllByRole('gridcell')
    let contentCell = contentCells[contentCells.length - 1]
    expect(contentCell).not.toBeNull()
    fireEvent.mouseOver(contentCell!)
    const startConversationButton = await screen.findByLabelText('Start conversation')
    await user.click(startConversationButton)
    const commentInput = await screen.findByPlaceholderText('Leave a comment')
    await user.type(commentInput, 'test comment 3')
    const submitButton = await screen.findByText('Add comment')
    await user.click(submitButton)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation => {
        expect(operation.request.node.operation.name).toBe('addPullRequestReviewThreadMutation')
        return MockPayloadGenerator.generate(operation, {
          PullRequestThread() {
            return buildReviewThread({
              comments: [
                buildComment({
                  author: buildCommentAuthor({login: 'collaborator'}),
                  bodyHTML: 'test comment 3',
                }),
              ],
            })
          },
        })
      })
    })

    contentCells = await screen.findAllByRole('gridcell')
    contentCell = contentCells[contentCells.length - 1]
    expect(contentCell).not.toBeNull()
    fireEvent.mouseOver(contentCell!)
    const viewConversationsButton = await screen.findByLabelText('View conversations')
    await user.click(viewConversationsButton)
    expect(await screen.findByText('1 comment')).toBeInTheDocument()
    expect(await screen.findByText('2 comments')).toBeInTheDocument()
  })
})

test('can expand the entire file when there are more lines than shown in the diff', async () => {
  const environment = createMockEnvironment()
  const {user} = render(<TestComponent environment={environment} />)

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
                diffLines: [
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 0,
                    right: 1,
                    blobLineNumber: 2,
                    type: 'HUNK',
                    html: `<td class="blob-code blob-code-inner blob-code-hunk">@@ -1,15 +1,15 @@</td>`,
                  }),
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 0,
                    right: 2,
                    blobLineNumber: 3,
                    type: 'ADDITION',
                    html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
                  }),
                ],
              }),
            ],
          })
        },
      }),
    )
  })

  const expandIcon = await screen.findByLabelText('expand all lines: README.md')
  await user.click(expandIcon)
  const collapseIcon = await screen.findByLabelText('collapse non diff lines: README.md')
  await user.click(collapseIcon)

  expectAnalyticsEvents<PullRequestsTargetType>(
    {
      type: 'file_entry.expand_all',
      target: 'FILE_EXPANDER_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    },
    {
      type: 'file_entry.collapse_all',
      target: 'FILE_COLLAPSE_BUTTON',
      data: {
        app_name: 'pull_request',
      },
    },
  )
})

test('does not show file expander when no other lines to expand', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

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
                diffLines: [
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 0,
                    right: 0,
                    blobLineNumber: 1,
                    type: 'HUNK',
                    html: `<td class="blob-code blob-code-inner blob-code-hunk">@@ -1,15 +1,15 @@</td>`,
                  }),
                  buildDiffLine({
                    __id: `diff-${mockUUID()}`,
                    left: 0,
                    right: 1,
                    blobLineNumber: 2,
                    type: 'ADDITION',
                    html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+"><span class="pl-s">"foobar.db"</span></span>`,
                  }),
                ],
              }),
            ],
          })
        },
      }),
    )
  })

  await waitFor(() => expect(screen.queryByLabelText('expand all lines: README.md')).not.toBeInTheDocument())
})

describe('in ListDiffView', () => {
  test('shows a chevron to expand/collapse the diff and submits analytics on click', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

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

    const chevronIcon = await screen.findByLabelText('collapse file: README.md')
    await user.click(chevronIcon)
    await screen.findByLabelText('expand file: README.md')
    expectAnalyticsEvents<PullRequestsTargetType>({
      type: 'file_entry.collapse_file',
      target: 'FILE_CHEVRON',
      data: {
        app_name: 'pull_request',
      },
    })
  })

  test('shows an expand/collaps icon button to expand/collapse the diff and submits analytics on click', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

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

    const expandAllIconBtn = await screen.findByLabelText('expand all lines: README.md')
    await user.click(expandAllIconBtn)
    const collapseIconBtn = await screen.findByLabelText('collapse non diff lines: README.md')
    expectAnalyticsEvents<PullRequestsTargetType>()
    await user.click(collapseIconBtn)
    await screen.findByLabelText('expand all lines: README.md')
    expectAnalyticsEvents<PullRequestsTargetType>(
      {
        type: 'file_entry.expand_all',
        target: 'FILE_EXPANDER_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
      {
        type: 'file_entry.collapse_all',
        target: 'FILE_COLLAPSE_BUTTON',
        data: {
          app_name: 'pull_request',
        },
      },
    )
  })
})

describe('updating the viewed state of a file', () => {
  test('to viewed gives an optimistic update', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

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

    const viewedButton = screen.getByRole('button', {name: 'Viewed'})

    await user.click(viewedButton)

    // expect the file to be viewed even though the mutation hasn't resolved
    expect(viewedButton.getAttribute('aria-pressed')).toBe('true')
  })

  test('to unviewed gives an optimistic update', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

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
                  viewerViewedState: 'VIEWED',
                }),
              ],
            })
          },
        }),
      )
    })

    const viewedButton = screen.getByRole('button', {name: 'Viewed'})

    await user.click(viewedButton)

    // expect the file to be unviewed even though the mutation hasn't resolved
    expect(viewedButton.getAttribute('aria-pressed')).toBe('false')
  })

  test('to viewed rolls back optimistic update on error', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

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

    const viewedButton = screen.getByRole('button', {name: 'Viewed'})

    await user.click(viewedButton)

    // expect the file to be viewed even though the mutation hasn't resolved
    expect(viewedButton.getAttribute('aria-pressed')).toBe('true')

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.rejectMostRecentOperation(new Error('oops'))
    })

    // optimistic update is rolled back and checkbox returns to its original state
    expect(viewedButton.getAttribute('aria-pressed')).toBe('false')
  })

  test('to unviewed rolls back optimistic update on error', async () => {
    const environment = createMockEnvironment()
    const {user} = render(<TestComponent environment={environment} />)

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
                  viewerViewedState: 'VIEWED',
                }),
              ],
            })
          },
        }),
      )
    })

    const viewedButton = screen.getByRole('button', {name: 'Viewed'})

    await user.click(viewedButton)

    // expect the file to be unviewed even though the mutation hasn't resolved
    expect(viewedButton.getAttribute('aria-pressed')).toBe('false')

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.rejectMostRecentOperation(new Error('oops'))
    })

    // optimistic update is rolled back and checkbox returns to its original state
    expect(viewedButton.getAttribute('aria-pressed')).toBe('true')
  })
})
