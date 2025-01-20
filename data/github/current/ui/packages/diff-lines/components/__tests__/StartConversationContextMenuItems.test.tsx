import {render, screen} from '@testing-library/react'
import {useEffect} from 'react'
import {mockCommentingImplementation} from '@github-ui/conversations/test-utils'
import {noop} from '@github-ui/noop'
import {StartConversationContextMenuItems} from '../StartConversationContextMenuItems'
import {useSelectedDiffRowRangeContext} from '../../contexts/SelectedDiffRowRangeContext'
import {DiffLineContextProvider} from '../../contexts/DiffLineContext'
import {SelectedDiffRowRangeContextProvider} from '../../diff-lines'
import {DiffContextProvider} from '../../contexts/DiffContext'
import {buildDiffLine, mockMarkerNavigationImplementation} from '../../test-utils/query-data'
import type {ClientDiffLine, DiffLine} from '../../types'
import type {DiffAnchor} from '@github-ui/diffs/types'
import {mockClientEnv} from '@github-ui/client-env/mock'

const defaultHunkRow = buildDiffLine({
  left: 0,
  right: 0,
  blobLineNumber: 0,
  type: 'HUNK',
})

const RenderComponenWithContextMockedData = ({diffLines, diffAnchor}: {diffLines: DiffLine[]; diffAnchor: string}) => {
  const {updateDiffLines} = useSelectedDiffRowRangeContext()

  useEffect(() => {
    updateDiffLines(diffAnchor, diffLines)
  }, [diffAnchor, diffLines, updateDiffLines])
  return (
    <StartConversationContextMenuItems
      handleStartConversation={jest.fn}
      handleStartConversationWithSuggestedChange={jest.fn()}
    />
  )
}

const simpleLine = buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'ADDITION'})

const TestComponent = ({
  diffLines,
  rowsHash,
  isLeftSide = false,
  isSplitView,
  commentingEnabled = true,
  line = simpleLine,
}: {
  diffLines: DiffLine[]
  rowsHash: string
  isLeftSide?: boolean
  isSplitView: boolean
  commentingEnabled?: boolean
  line?: ClientDiffLine
}) => {
  const diffAnchor = 'diff-fcf14c4b7b34fe7a11916195871ae66a59be87a395f28db73e345ebdc828085b'
  window.location.hash = `#${diffAnchor}${rowsHash}`

  const diffLineContext = {
    diffEntryId: 'stub',
    diffLine: line,
    isLeftSide,
    isSplit: isSplitView,
    left: 1,
    right: 1,
    fileAnchor: 'diff-1234' as DiffAnchor,
    fileLineCount: 1,
    rowId: 'mockRowId',
    filePath: '1234',
  }

  return (
    <SelectedDiffRowRangeContextProvider>
      <DiffContextProvider
        addInjectedContextLines={noop}
        commentBatchPending={false}
        commentingEnabled={commentingEnabled}
        commentingImplementation={commentingEnabled ? mockCommentingImplementation : undefined}
        repositoryId="test-id"
        subjectId="subjectId"
        subject={{}}
        markerNavigationImplementation={commentingEnabled ? mockMarkerNavigationImplementation : undefined}
        viewerData={{
          avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          diffViewPreference: 'split',
          isSiteAdmin: false,
          login: 'mona',
          tabSizePreference: 1,
          viewerCanComment: true,
          viewerCanApplySuggestion: true,
        }}
      >
        <DiffLineContextProvider {...diffLineContext}>
          <RenderComponenWithContextMockedData diffAnchor={diffAnchor} diffLines={diffLines} />
        </DiffLineContextProvider>
      </DiffContextProvider>
    </SelectedDiffRowRangeContextProvider>
  )
}

beforeEach(() => {
  mockClientEnv({
    featureFlags: ['prx'],
  })
})

describe('when commenting is not enabled', () => {
  test('it does not render', () => {
    render(<TestComponent diffLines={[]} isSplitView={true} rowsHash="" commentingEnabled={false} />)

    expect(screen.queryByText(/Start conversation/i)).not.toBeInTheDocument()
  })
})

describe('when there is no selected cell', () => {
  test('it shows option to start conversation with the correct key combination', () => {
    render(<TestComponent diffLines={[]} isSplitView={true} rowsHash="" />)

    expect(screen.getByText('Start conversation on line R1')).toBeInTheDocument()
  })

  test('it shows option to suggest a change if the line is not a DELETION', () => {
    const line = {...simpleLine, type: 'ADDITION'} as ClientDiffLine
    render(<TestComponent diffLines={[]} isSplitView={true} rowsHash="" line={line} />)

    expect(screen.getByText('Suggest change on line R1')).toBeInTheDocument()
  })

  test('it does not show option to suggest a change if the line is a DELETION', () => {
    const line = {...simpleLine, blobLineNumber: 1, right: 2, left: 1, type: 'DELETION'} as ClientDiffLine
    render(<TestComponent diffLines={[]} isSplitView={true} rowsHash="" isLeftSide={true} line={line} />)

    expect(screen.queryByText('Suggest change on line L1')).not.toBeInTheDocument()
  })
})

describe('when there is one selected cell for split diff view', () => {
  describe('when original side of diff is selected', () => {
    it('only renders "Start conversation on line L1"', () => {
      render(<TestComponent diffLines={[]} isSplitView={true} isLeftSide={true} rowsHash="L1" />)

      screen.getByText('Start conversation on line L1')
      expect(screen.queryByText(/Start conversation on line R/)).toBeNull()
    })

    it('includes ability to suggest change if line is not a DELETION', () => {
      render(<TestComponent diffLines={[]} isSplitView={true} rowsHash="R1" />)

      screen.getByText('Suggest change on line R1')
      expect(screen.queryByText(/Suggest change on line L1/)).toBeNull()
    })

    it('does not include ability to suggest change if line is a DELETION', () => {
      const deletedLine = buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'DELETION'})
      render(<TestComponent diffLines={[]} isSplitView={true} rowsHash="L1" isLeftSide={true} line={deletedLine} />)

      expect(screen.queryByText('Suggest change on line L1')).toBeNull()
      expect(screen.queryByText(/Suggest change on line R/)).toBeNull()
    })
  })

  describe('when modified side of diff is selected', () => {
    it('only renders "Start conversation on line R1"', () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'DELETION'}),
        buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'ADDITION'}),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="R1" />)

      expect(screen.getByText('Start conversation on line R1')).toBeInTheDocument()
      expect(screen.queryByText(/Start conversation on line L/)).toBeNull()
    })

    it('includes ability to suggest change', () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'DELETION'}),
        buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'ADDITION'}),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="R1" />)

      expect(screen.getByText('Suggest change on line R1')).toBeInTheDocument()
      expect(screen.queryByText(/Suggest change on line L/)).toBeNull()
    })
  })
})

describe('when there is one selected cell for unified diff view', () => {
  describe('when original side of diff is selected', () => {
    it('only renders "Start conversation on line L1"', () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'DELETION'}),
        buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'ADDITION'}),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} isLeftSide={true} rowsHash="L1" />)

      expect(screen.getByText('Start conversation on line L1')).toBeInTheDocument()
      expect(screen.queryByText(/Start conversation on line R1/)).toBeNull()
    })

    it('includes the ability to suggest change if line is not a DELETION', () => {
      const diffLines = [defaultHunkRow, buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'ADDITION'})]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="R1" />)

      expect(screen.getByText('Suggest change on line R1')).toBeInTheDocument()
      expect(screen.queryByText(/Suggest change on line L1/)).toBeNull()
    })

    it('does not include the ability to suggest change if line is a DELETION', () => {
      const deletedLine = buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'DELETION'})
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'DELETION'}),
        buildDiffLine({blobLineNumber: 1, right: 1, left: 1, type: 'ADDITION'}),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="L1" line={deletedLine} />)

      expect(screen.queryByText('Suggest change on line L1')).toBeNull()
    })
  })
})

describe('when there are multiple selected lines for split diff view', () => {
  describe('when entire left side of diff are empty cells', () => {
    it('only renders "Start conversation on lines R1-R2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 1, left: 0, type: 'ADDITION'}),
        buildDiffLine({blobLineNumber: 2, right: 2, left: 0, type: 'ADDITION'}),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="R1-R2" />)

      expect(screen.getByText('Start conversation on lines R1-R2')).toBeInTheDocument()
      expect(screen.queryByText(/Start conversation on line L/)).toBeNull()
    })

    it('includes the ability to suggest a change', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 1, left: 0, type: 'ADDITION'}),
        buildDiffLine({blobLineNumber: 2, right: 2, left: 0, type: 'ADDITION'}),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="R1-R2" />)

      expect(await screen.findByText('Suggest change on lines R1-R2')).toBeInTheDocument()
      expect(screen.queryByText(/Suggest change on line L/)).toBeNull()
    })
  })

  describe('when entire right side of diff are empty cells', () => {
    it('only renders "Start conversation on lines L1-L2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'DELETION'}),
        buildDiffLine({blobLineNumber: 2, right: 0, left: 2, type: 'DELETION'}),
      ]

      render(<TestComponent diffLines={diffLines} isSplitView={true} isLeftSide={true} rowsHash="L1-L2" />)
      await screen.findByText('Start conversation on lines L1-L2')
      expect(screen.queryByText(/Start conversation on line R/)).toBeNull()
    })

    it('does not include ability to suggest change from left side if some lines are deleted', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'CONTEXT'}),
        buildDiffLine({blobLineNumber: 2, right: 0, left: 2, type: 'DELETION'}),
      ]

      render(<TestComponent diffLines={diffLines} isSplitView={true} isLeftSide={true} rowsHash="L1-L2" />)
      expect(screen.queryByText('Suggest change on lines L1-L2')).toBeNull()
    })

    it('includes ability to suggest change from left side if no lines are deleted', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({blobLineNumber: 1, right: 0, left: 1, type: 'CONTEXT'}),
        buildDiffLine({blobLineNumber: 2, right: 0, left: 2, type: 'CONTEXT'}),
      ]

      render(<TestComponent diffLines={diffLines} isSplitView={true} isLeftSide={true} rowsHash="L1-L2" />)
      expect(screen.getByText('Suggest change on lines R1-R2')).toBeInTheDocument()
    })
  })

  describe('when right side of diff starts with an empty cell', () => {
    it('renders "Start conversation, original lines L1-L4" and "Start conversation, modified lines R1-R3"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 0,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 2,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 3,
          right: 1,
          blobLineNumber: 3,
          type: 'DELETION',
        }),

        buildDiffLine({
          left: 3,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 4,
          right: 3,
          blobLineNumber: 3,
          type: 'CONTEXT',
        }),
      ]

      render(<TestComponent diffLines={diffLines} isSplitView={true} isLeftSide={true} rowsHash="L1-L4" />)
      expect(await screen.findByText('Start conversation, original lines L1-L4')).toBeInTheDocument()
      expect(await screen.findByText('Start conversation, modified lines R1-R3')).toBeInTheDocument()
      await screen.findByText('Suggest change, modified lines R1-R3')
      expect(screen.queryByText('Suggest change, original lines L1-L4')).toBeNull()
    })
  })

  describe('when right side of diff ends with an empty cell', () => {
    it('renders "Start conversation, original lines L1-L4" and "Start conversation, modified lines R1-R3"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 1,
          blobLineNumber: 2,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 3,
          right: 1,
          blobLineNumber: 3,
          type: 'DELETION',
        }),

        buildDiffLine({
          left: 4,
          right: 1,
          blobLineNumber: 4,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 4,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 4,
          right: 3,
          blobLineNumber: 3,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} isLeftSide={true} rowsHash="L1-L4" />)

      expect(await screen.findByText('Start conversation, original lines L1-L4')).toBeInTheDocument()
      expect(await screen.findByText('Start conversation, modified lines R1-R3')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, modified lines R1-R3')).toBeInTheDocument()
    })
  })

  describe('when right side of diff starts and ends with empty cells', () => {
    it('renders "Start conversation, original lines L1-L4" and "Start conversation, modified line R1-R2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 0,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 2,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 3,
          right: 1,
          blobLineNumber: 3,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 4,
          right: 1,
          blobLineNumber: 4,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 4,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} isLeftSide={true} rowsHash="L1-L4" />)

      expect(await screen.findByText('Start conversation, original lines L1-L4')).toBeInTheDocument()
      expect(await screen.findByText('Start conversation, modified lines R1-R2')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, modified lines R1-R2')).toBeInTheDocument()
    })
  })

  describe('when left side of diff starts with an empty cell', () => {
    it('renders "Start conversation, original lines L1-L3" and "Start conversation, modified lines R1-R4"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 0,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 1,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 3,
          blobLineNumber: 3,
          type: 'CONTEXT',
        }),

        buildDiffLine({
          left: 3,
          right: 4,
          blobLineNumber: 4,
          type: 'CONTEXT',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="R1-R4" />)

      expect(await screen.findByText('Start conversation, original lines L1-L3')).toBeInTheDocument()
      expect(await screen.findByText('Start conversation, modified lines R1-R4')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, original lines L1-L3')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, modified lines R1-R4')).toBeInTheDocument()
    })
  })

  describe('when left side of diff ends with an empty cell', () => {
    it('renders "Start conversation, original lines L1-L3" and "Start conversation, modified lines R1-R4"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 3,
          right: 3,
          blobLineNumber: 3,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 3,
          right: 4,
          blobLineNumber: 4,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 4,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 4,
          right: 3,
          blobLineNumber: 3,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="R1-R4" />)

      expect(await screen.findByText('Start conversation, original lines L1-L3')).toBeInTheDocument()
      expect(await screen.findByText('Start conversation, modified lines R1-R4')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, original lines L1-L3')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, modified lines R1-R4')).toBeInTheDocument()
    })
  })

  describe('when left side of diff starts and ends with empty cells', () => {
    it('renders "Start conversation, original line L1-L2" and "Start conversation, modified lines R1-R4"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 0,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 1,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 3,
          blobLineNumber: 3,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 4,
          blobLineNumber: 4,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="R1-R4" />)

      expect(await screen.findByText('Start conversation, original lines L1-L2')).toBeInTheDocument()
      expect(await screen.findByText('Start conversation, modified lines R1-R4')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, original lines L1-L2')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, modified lines R1-R4')).toBeInTheDocument()
    })
  })

  describe('when neither side of the diff has an empty cell, but there are modified lines', () => {
    it('renders "Start conversation, original lines L1-L2" and "Start conversation, modified lines R1-R2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 0,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="R1-R2" />)

      expect(await screen.findByText('Start conversation, original lines L1-L2')).toBeInTheDocument()
      expect(await screen.findByText('Start conversation, modified lines R1-R2')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change, modified lines R1-R2')).toBeInTheDocument()
    })
  })

  describe('when neither side of the diff has empty cells and every line is a context or injected context line', () => {
    it('only renders "Start conversation on line R1-R2" and "Suggest change on lines R1-R2" by defaulting to right hand side of the diff lines', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'INJECTED_CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
      ]

      // Use L1-L2 in URL hash for line selection
      render(<TestComponent diffLines={diffLines} isSplitView={true} rowsHash="L1-L2" />)

      // Assert that it is only allowing commenting on right hand side of context lines
      expect(await screen.findByText('Start conversation on lines R1-R2')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change on lines R1-R2')).toBeInTheDocument()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })
})

describe('when there are multiple selected lines for unified diff view', () => {
  describe('when every line is a context or injected context line', () => {
    it('renders "Start conversation on lines {startSide}{lineNumber}-{endSide}{lineNumber}"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'INJECTED_CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="L1-R2" />)

      expect(await screen.findByText('Start conversation on lines L1-R2')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change on lines L1-R2')).toBeInTheDocument()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts and ends on context lines', () => {
    it('renders "Start conversation on lines {startSide}{lineNumber}-{endSide}{lineNumber}"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 1,
          blobLineNumber: 2,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 3,
          right: 3,
          blobLineNumber: 3,
          type: 'CONTEXT',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="L1-R2" />)

      expect(await screen.findByText('Start conversation on lines L1-R2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines L1-R2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts and ends on deleted lines', () => {
    it('only renders "Start conversation on lines L1-L2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="L1-L2" />)

      expect(await screen.findByText('Start conversation on lines L1-L2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines L1-L2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts and ends on added lines', () => {
    it('only renders "Start conversation on lines R1-R2" and "Suggest change on lines R1-R2', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="R1-R2" />)

      expect(await screen.findByText('Start conversation on lines R1-R2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines R1-R2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on left context line and ends on a deleted line', () => {
    it('only renders "Start conversation on lines L1-L2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 1,
          blobLineNumber: 2,
          type: 'DELETION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} isLeftSide={true} rowsHash="L1-L2" />)

      expect(await screen.findByText('Start conversation on lines L1-L2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines L1-L2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on right context line and ends on a deleted line', () => {
    it('only renders "Start conversation on lines R1-L2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 2,
          right: 1,
          blobLineNumber: 2,
          type: 'DELETION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="R1-L2" />)

      expect(await screen.findByText('Start conversation on lines R1-L2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines R1-L2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on left context line and ends on an added line', () => {
    it('only renders "Start conversation on lines L1-R2" and "Suggest change on lines L1-R2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 1,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="L1-R2" />)

      expect(await screen.findByText('Start conversation on lines L1-R2')).toBeInTheDocument()
      await screen.findByText('Suggest change on lines L1-R2')
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on right context line and ends on an added line', () => {
    it('only renders "Start conversation on lines R1-R2" and "Suggest change on lines R1-R2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'CONTEXT',
        }),
        buildDiffLine({
          left: 1,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="R1-R2" />)

      expect(await screen.findByText('Start conversation on lines R1-R2')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change on lines R1-R2')).toBeInTheDocument()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on deleted line and ends on left context line', () => {
    it('only renders "Start conversation on lines L1-L2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 0,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} isLeftSide={true} rowsHash="L1-L2" />)

      expect(await screen.findByText('Start conversation on lines L1-L2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines L1-L2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on deleted line and ends on right context line', () => {
    it('only renders "Start conversation on lines L1-R2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 0,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="L1-R2" />)

      expect(await screen.findByText('Start conversation on lines L1-R2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines L1-R2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on deleted line and ends on added line', () => {
    it('only renders "Start conversation on lines L1-R2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 0,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 1,
          right: 2,
          blobLineNumber: 2,
          type: 'ADDITION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="L1-R2" />)

      expect(await screen.findByText('Start conversation on lines L1-R2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines L1-R2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on added line and ends on deleted line', () => {
    it('only renders "Start conversation on lines R1-L2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 0,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 2,
          right: 1,
          blobLineNumber: 2,
          type: 'DELETION',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="R1-L2" />)

      expect(await screen.findByText('Start conversation on lines R1-L2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines R1-L2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on added line and ends on a right context line', () => {
    it('only renders "Start conversation on lines R1-R2" and "Suggest change on lines R1-R2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 0,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 1,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="R1-R2" />)

      expect(await screen.findByText('Start conversation on lines R1-R2')).toBeInTheDocument()
      expect(await screen.findByText('Suggest change on lines R1-R2')).toBeInTheDocument()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })

  describe('when it starts on added line and ends on a left context line', () => {
    it('only renders "Start conversation on lines R1-L2"', async () => {
      const diffLines = [
        defaultHunkRow,
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'DELETION',
        }),
        buildDiffLine({
          left: 1,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
        }),
        buildDiffLine({
          left: 2,
          right: 2,
          blobLineNumber: 2,
          type: 'CONTEXT',
        }),
      ]
      render(<TestComponent diffLines={diffLines} isSplitView={false} rowsHash="R1-L2" />)

      expect(await screen.findByText('Start conversation on lines R1-L2')).toBeInTheDocument()
      expect(screen.queryByText('Suggest change on lines R1-L2')).toBeNull()
      expect(screen.queryByText(/Start conversation, original line/)).toBeNull()
      expect(screen.queryByText(/Start conversation, modified lines R/)).toBeNull()
    })
  })
})
