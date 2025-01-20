import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import type {CommentingImplementation, MarkerNavigationImplementation} from '@github-ui/conversations'
import {
  buildComment as buildFullComment,
  buildReviewThread,
  mockCommentingImplementation,
} from '@github-ui/conversations/test-utils'
import type {DiffAnchor, SimpleDiffLine} from '@github-ui/diffs/types'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, getDefaultNormalizer, screen, waitFor} from '@testing-library/react'
import type {ComponentPropsWithoutRef} from 'react'

import {MarkersDialogContextProvider} from '../../contexts/MarkersDialogContext'
import type {DiffLineContextData} from '../../contexts/DiffLineContext'
import {DiffLineContextProvider} from '../../contexts/DiffLineContext'
import {useSelectedDiffRowRangeContext} from '../../contexts/SelectedDiffRowRangeContext'
import {ContentCell, LineNumberCell, EmptyCell} from '../DiffLineTableCellParts'
import {
  buildAnnotation,
  buildComment,
  buildDiffLine,
  buildThread,
  mockMarkerNavigationImplementation,
} from '../../test-utils/query-data'
import type {DiffLine} from '../../types'
import {DiffContextProvider} from '../../contexts/DiffContext'
import {mockClientEnv} from '@github-ui/client-env/mock'

jest.setTimeout(4_500)

// Mock child components that fetch data on render, since we're not testing that functionality here
jest.mock('@github-ui/markdown-edit-history-viewer/MarkdownEditHistoryViewer', () => ({
  MarkdownEditHistoryViewer: () => null,
}))

jest.mock('@github-ui/reaction-viewer/ReactionViewer', () => ({
  ReactionViewer: () => null,
}))

jest.mock('@github-ui/copilot-code-chat/CopilotDiffChatContextMenu', () => ({
  CopilotDiffChatContextMenu: () => null,
}))

jest.mock('../../contexts/SelectedDiffRowRangeContext')
const mockSelectedDiffRowRangeContext = jest.mocked(useSelectedDiffRowRangeContext)
const selectedDiffRowRangeContextReturnDataMock = {
  selectedDiffLines: {leftLines: [], rightLines: []},
  selectedDiffRowRange: undefined,
  updateSelectedDiffRowRange: jest.fn(),
  clearSelectedDiffRowRange: jest.fn(),
  replaceSelectedDiffRowRange: jest.fn(),
  replaceSelectedDiffRowRangeFromGridCells: jest.fn(),
  updateDiffLines: jest.fn(),
  getDiffLinesFromLineRange: jest.fn(),
  getDiffLinesByDiffAnchor: jest.fn(),
}

type TestComponentProps = ComponentPropsWithoutRef<'td'> & {
  commentingImplementation?: CommentingImplementation
  diffLineContextProps?: Partial<DiffLineContextData>
  line?: DiffLine | SimpleDiffLine
  isSplit?: boolean
  tabSize?: number
  isLeftSide?: boolean
  componentType?: 'content' | 'lineNumber' | 'empty'
  markerNavigationImplementation?: MarkerNavigationImplementation
}

function TestComponent({
  commentingImplementation = mockCommentingImplementation,
  diffLineContextProps,
  line = {left: 1, right: 1, type: 'ADDITION', text: 'a', html: 'a'},
  tabSize,
  isSplit = false,
  isLeftSide = false,
  componentType = 'content',
  children,
  markerNavigationImplementation = mockMarkerNavigationImplementation,
}: TestComponentProps) {
  const diffLineContext = Object.assign(
    {},
    {
      currentHunk: {startBlobLineNumber: 1, endBlobLineNumber: 5},
      nextHunk: {startBlobLineNumber: 10, endBlobLineNumber: 20},
      diffEntryId: 'stub',
      diffLine: line,
      isLeftSide,
      isSplit,
      left: 1,
      right: 1,
      fileAnchor: 'diff-1234' as DiffAnchor,
      fileLineCount: 1,
      rowId: 'mockRowId',
      filePath: '1234',
    },
    {...diffLineContextProps},
  )

  const contentCell = () => {
    return (
      <ContentCell
        columnIndex={1}
        filePath="test.txt"
        handleDiffCellClick={jest.fn()}
        handleDiffSideCellSelectionBlocking={jest.fn()}
        tabSize={tabSize || 1}
      />
    )
  }

  const lineNumberCell = () => {
    return (
      <LineNumberCell
        columnIndex={1}
        filePath="test.txt"
        handleDiffCellClick={jest.fn()}
        handleDiffSideCellSelectionBlocking={jest.fn()}
      >
        {children}
      </LineNumberCell>
    )
  }

  const emptyCell = () => {
    return <EmptyCell columnIndex={1} />
  }

  const renderComponent = () => {
    switch (componentType) {
      case 'content':
        return contentCell()
      case 'lineNumber':
        return lineNumberCell()
      case 'empty':
        return emptyCell()
    }
  }

  // Since cells render a <td> element, we must wrap them in a table to build valid HTML
  return (
    <AnalyticsProvider appName="test-app" category="test-category" metadata={{}}>
      <DiffContextProvider
        addInjectedContextLines={noop}
        commentBatchPending={false}
        commentingEnabled={true}
        commentingImplementation={commentingImplementation}
        repositoryId="test-id"
        subjectId="subjectId"
        subject={{}}
        markerNavigationImplementation={markerNavigationImplementation}
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
          <table>
            <tbody>
              <tr>
                {componentType !== 'empty' ? (
                  <MarkersDialogContextProvider line={line as DiffLine}>
                    {renderComponent()}
                  </MarkersDialogContextProvider>
                ) : (
                  renderComponent()
                )}
              </tr>
            </tbody>
          </table>
        </DiffLineContextProvider>
      </DiffContextProvider>
    </AnalyticsProvider>
  )
}

beforeEach(() => {
  mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)

  mockClientEnv({
    featureFlags: ['prx'],
  })
})

afterEach(() => {
  jest.restoreAllMocks()
  localStorage.clear()
})

describe('content cells', () => {
  test('have the option to start a new conversation', async () => {
    const lineHtml = 'hello world'
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'ADDITION',
      text: lineHtml,
    })
    render(<TestComponent line={line} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const conversationButton = await screen.findByText('Start conversation on line R1')
    expect(conversationButton).toBeInTheDocument()
  })

  test('when no row is selected, a user can copy the current cell content', async () => {
    const lineHtml = 'hello world'
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'ADDITION',
      text: lineHtml,
    })
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines: [], rightLines: [line]},
      selectedDiffRowRange: {
        firstSelectedOrientation: 'right',
        diffAnchor: 'mock',
        endLineNumber: 1,
        endOrientation: 'right',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'right',
      },
      getDiffLinesByDiffAnchor: () => [line],
    })
    const {user} = render(<TestComponent line={line} />)
    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const copyButton = await screen.findByText('Copy code')
    await user.click(copyButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual('hello world')
  })

  test('copying the code of a content cell correctly escapes diff html', async () => {
    /*
     * The HTML that the SafeHTMLDiv component produces to render the content:
     * +<span>new line</span>
     * Where the `span` cells that are visible are part of the proposed changes.
     */
    const lineHtml =
      '+  <span class=pl-kos>&lt;</span><span class=pl-ent>span</span><span class=pl-kos>&gt;</span>new line<span class=pl-kos>&lt;/</span><span class=pl-ent>span</span><span class=pl-kos>&gt;</span>'
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'ADDITION',
      text: '+  <span>new line</span>',
    })
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines: [], rightLines: [line]},
      selectedDiffRowRange: {
        firstSelectedOrientation: 'right',
        diffAnchor: 'mock',
        endLineNumber: 1,
        endOrientation: 'right',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'right',
      },
      getDiffLinesByDiffAnchor: () => [line],
    })
    const {user} = render(<TestComponent line={line} />)
    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const copyButton = await screen.findByText('Copy code')
    await user.click(copyButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual('  <span>new line</span>')
  })

  test('copying the cell content does not remove +/- characters for non-ADDITION/DELETION line types', async () => {
    /*
     * The HTML that the SafeHTMLDiv component produces to render the content:
     * +<span>new line</span>
     * Where the `span` cells that are visible are part of the proposed changes.
     */
    const lineHtml = '+1'
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
    })
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines: [], rightLines: [line]},
      selectedDiffRowRange: {
        firstSelectedOrientation: 'right',
        diffAnchor: 'mock',
        endLineNumber: 1,
        endOrientation: 'right',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'right',
      },
      getDiffLinesByDiffAnchor: () => [line],
    })
    const {user} = render(<TestComponent line={line} />)
    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const copyButton = await screen.findByText('Copy code')
    await user.click(copyButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual(lineHtml)
  })

  test('content cells indicate when a single line is selected', async () => {
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines: [], rightLines: []},
      selectedDiffRowRange: {
        firstSelectedOrientation: 'left',
        diffAnchor: 'mock',
        endLineNumber: 1,
        endOrientation: 'left',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'left',
      },
    })
    const lineHtml = '+additional context'
    const line = buildDiffLine({
      __id: '1234',
      left: 1,
      right: 1,
      blobLineNumber: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
    })
    render(<TestComponent line={line} tabSize={6} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    await expect(screen.findByText('Copy code')).resolves.toBeInTheDocument()
  })

  test('content cells indicate when a range of lines is selected', async () => {
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines: [], rightLines: []},
      selectedDiffRowRange: {
        firstSelectedOrientation: 'left',
        diffAnchor: 'mock',
        endLineNumber: 10,
        endOrientation: 'left',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'left',
      },
    })
    const lineHtml = '+additional context'
    const line = buildDiffLine({
      __id: '1234',
      left: 1,
      right: 1,
      blobLineNumber: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
    })
    render(<TestComponent line={line} tabSize={6} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    await expect(screen.findByText('Copy code')).resolves.toBeInTheDocument()
  })

  test('when a range is selected, a user can copy the content of the range', async () => {
    const lineHtml = 'hello world'
    const line = buildDiffLine({
      __id: '1234',
      left: 1,
      right: 1,
      blobLineNumber: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
    })
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines: [line], rightLines: [line]},
      selectedDiffRowRange: {
        firstSelectedOrientation: 'left',
        diffAnchor: 'mock',
        endLineNumber: 10,
        endOrientation: 'left',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'left',
      },
      getDiffLinesByDiffAnchor: () => [line],
    })
    const {user} = render(<TestComponent line={line} tabSize={6} />)
    const contentCell = await screen.findByRole('gridcell')

    fireEvent.contextMenu(contentCell)
    const copyCodeButton = await screen.findByText('Copy code')
    await user.click(copyCodeButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual(lineHtml)
  })

  test('content cells allow expanding the previous and next hunks when they exist', async () => {
    const lineHtml = '+additional context'
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
    })
    render(<TestComponent line={line} tabSize={6} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    await screen.findByText('Expand above')
    await expect(screen.findByText('Expand below')).resolves.toBeInTheDocument()
  })

  test('content cells do not prompt to expand the next hunk when there is no additional code hunks', async () => {
    const lineHtml = '+additional context'
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'CONTEXT',
      text: lineHtml,
    })
    const diffLineContext = {
      currentHunk: {startBlobLineNumber: 1, endBlobLineNumber: 5},
      nextHunk: undefined,
      diffEntryId: 'stub',
      left: 1,
      right: 1,
      fileAnchor: 'diff-1234' as DiffAnchor,
      fileLineCount: 1,
      rowId: 'mockRowId',
      filePath: '1234',
    }
    render(<TestComponent diffLineContextProps={diffLineContext} line={line} tabSize={1} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    expect(screen.getByText('Expand above')).toBeInTheDocument()
    expect(screen.queryByText('Expand below')).not.toBeInTheDocument()
  })

  test('Addition lines are correctly prepended with a +', async () => {
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: '+new line',
      type: 'ADDITION',
      text: '+new line',
    })
    render(<TestComponent line={line} tabSize={1} />)

    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('new line')).toBeInTheDocument()
  })

  test('Deletion lines are correctly prepended with a -', async () => {
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: '-new line',
      type: 'DELETION',
      text: '-new line',
    })
    render(<TestComponent line={line} tabSize={1} />)

    expect(screen.getByText('-')).toBeInTheDocument()
    expect(screen.getByText('new line')).toBeInTheDocument()
  })

  test('Context lines have the extra space at the beginning removed', async () => {
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: ' new line',
      type: 'DELETION',
      text: ' new line',
    })
    render(<TestComponent line={line} tabSize={1} />)

    expect(screen.getByText('new line')).toBeInTheDocument()
  })

  test('content cells allow copying the anchor link when a range is selected', async () => {
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: {
        firstSelectedOrientation: 'left',
        diffAnchor: 'diff-1234',
        endLineNumber: 10,
        endOrientation: 'left',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'left',
      },
    })
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: 'hello world',
      text: 'hello world',
      type: 'CONTEXT',
    })
    const {user} = render(<TestComponent isLeftSide={true} line={line} tabSize={1} />)
    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const copyLinkButton = await screen.findByText('Copy anchor link')
    await user.click(copyLinkButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual('http://localhost/#diff-1234L1-L10')
  })

  test('content cells allow copying the anchor link of a single cell when no range is selected', async () => {
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const line = buildDiffLine({
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: 'hello world',
      text: 'hello world',
      type: 'CONTEXT',
    })
    const {user} = render(<TestComponent isLeftSide={true} line={line} tabSize={1} />)
    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const copyLinkButton = await screen.findByText('Copy anchor link')
    await user.click(copyLinkButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual('http://localhost/#diff-1234L1')
  })
})

describe('line number cells', () => {
  test('have the option to start a new conversation', async () => {
    const lineHtml = 'hello world'
    const line: DiffLine = {
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: lineHtml,
      type: 'ADDITION',
      text: lineHtml,
      threadsData: {__id: '1234', totalCount: 0, totalCommentsCount: 0, threads: []},
    }
    render(<TestComponent componentType="lineNumber" line={line} />)

    const lineNumberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(lineNumberCell)
    const conversationButton = await screen.findByText('Start conversation on line R1')
    expect(conversationButton).toBeInTheDocument()
  })

  test('number cells allow copying the anchor link when a range is selected', async () => {
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: {
        firstSelectedOrientation: 'left',
        diffAnchor: 'diff-1234',
        endLineNumber: 10,
        endOrientation: 'left',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'left',
      },
    })
    const line: DiffLine = {
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: 'hello world',
      type: 'ADDITION',
      text: 'hello world',
      threadsData: {__id: '1234', totalCount: 0, totalCommentsCount: 0, threads: []},
    }

    const {user} = render(<TestComponent componentType="lineNumber" isLeftSide={true} line={line} />)
    const numberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(numberCell)
    const copyLinkButton = await screen.findByText('Copy anchor link')
    await user.click(copyLinkButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual('http://localhost/#diff-1234L1-L10')
  })

  test('when a range is selected, a user can copy the content of the range', async () => {
    const line1: DiffLine = {
      left: 0,
      right: 1,
      blobLineNumber: 1,
      html: '+<span class=pl-s1>type</span> <span class=pl-v>CellContextMenuProps</span> <span class=pl-c1>=</span> <span class=pl-kos>{</span>',
      type: 'ADDITION',
      text: '+type CellContextMenuProps = {',
    }
    const line2: DiffLine = {
      left: 0,
      right: 2,
      blobLineNumber: 2,
      html: '+  <span class=pl-c1>line</span>: <span class=pl-v>SimpleDiffLine</span>',
      type: 'ADDITION',
      text: '+  line: SimpleDiffLine',
    }
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines: [], rightLines: [line1, line2]},
      selectedDiffRowRange: {
        firstSelectedOrientation: 'right',
        diffAnchor: 'mock',
        endLineNumber: 2,
        endOrientation: 'right',
        startLineNumber: 1,
        firstSelectedLineNumber: 1,
        startOrientation: 'right',
      },
      getDiffLinesByDiffAnchor: () => [line1, line2],
    })

    const {user} = render(<TestComponent componentType="lineNumber" line={line2} />)
    const numberCell = await screen.findByRole('gridcell')

    fireEvent.contextMenu(numberCell)
    const copyCodeButton = await screen.findByText('Copy code')

    await user.click(copyCodeButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual(
      `type CellContextMenuProps = {\n  line: SimpleDiffLine`,
    )
  })

  test('line number cells allow copying the anchor link of a single cell when no range is selected', async () => {
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: undefined,
    })
    const line: DiffLine = {
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: 'hello world',
      type: 'DELETION',
      text: 'hello world',
      threadsData: {__id: '1234', totalCount: 0, totalCommentsCount: 0, threads: []},
    }

    const {user} = render(<TestComponent componentType="lineNumber" isLeftSide={true} line={line} />)
    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const copyLinkButton = await screen.findByText('Copy anchor link')
    await user.click(copyLinkButton)
    await expect(navigator.clipboard.readText()).resolves.toEqual('http://localhost/#diff-1234L1')
  })

  test('number cells allow expanding the previous and next hunks when they exist', async () => {
    const line: DiffLine = {
      __id: '1234',
      blobLineNumber: 1,
      left: 1,
      right: 1,
      html: 'hello world',
      type: 'ADDITION',
      text: 'hello world',
      threadsData: {__id: '1234', totalCount: 0, totalCommentsCount: 0, threads: []},
    }
    render(
      <TestComponent componentType="lineNumber" line={line}>
        1
      </TestComponent>,
    )

    const lineNumberCell = await screen.findByText('1')
    fireEvent.contextMenu(lineNumberCell)
    await screen.findByText('Expand above')
    await expect(screen.findByText('Expand below')).resolves.toBeInTheDocument()
  })
})

describe('empty cells', () => {
  test('allow expanding the previous and next hunks when they exist', async () => {
    render(<TestComponent componentType="empty" />)

    const emptyCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(emptyCell)
    await screen.findByText('Expand above')
    await expect(screen.findByText('Expand below')).resolves.toBeInTheDocument()
  })

  test('allows selecting all visible rows in the diff', async () => {
    const {user} = render(<TestComponent componentType="empty" />)

    const emptyCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(emptyCell)
    const selectAllButton = await screen.findByText('Select all')
    await user.click(selectAllButton)
    expect(screen.queryByText('Select all')).not.toBeInTheDocument()
  })
})

describe('markers context menu', () => {
  describe('empty cells', () => {
    test('does not show markers menu items', async () => {
      render(<TestComponent componentType="empty" />)

      const emptyCell = await screen.findByRole('gridcell')
      fireEvent.contextMenu(emptyCell)
      expect(screen.queryByText('View markers')).toBeNull()
      expect(screen.queryByText('View markers, modified line')).toBeNull()
    })
  })

  describe('unified diff', () => {
    describe('content cells', () => {
      test('does not show view markers option when there are no threads or annotations', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          threads: [],
          annotations: [],
        })

        render(<TestComponent componentType="content" line={line} />)

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        expect(screen.queryByText('View markers')).toBeNull()
      })

      test('shows view marker option and opens single comment', async () => {
        const lineHtml = '+additional context'
        const partialThread = buildThread({comments: [buildComment({})]})
        const reviewThread = buildReviewThread({comments: [buildFullComment({bodyHTML: 'test comment'})]})
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          threads: [partialThread],
        })
        const mockedFetchThread = jest.fn(() => Promise.resolve(reviewThread))
        const commentingImpl = {
          ...mockCommentingImplementation,
          fetchThread: mockedFetchThread,
        }

        const {user} = render(
          <TestComponent commentingImplementation={commentingImpl} componentType="content" line={line} />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('test comment')).toBeInTheDocument()
      })

      test('shows view marker option and opens single annotation', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          threads: [],
          annotations: [buildAnnotation({title: 'test annotation title'})],
        })

        const {user} = render(
          <TestComponent commentingImplementation={mockCommentingImplementation} componentType="content" line={line} />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('test annotation title')).toBeInTheDocument()
      })

      test('shows view marker option and opens conversation list', async () => {
        const lineHtml = '+additional context'

        const threads = [
          buildThread({
            comments: [buildComment({author: {login: 'mona', avatarUrl: '', url: '/monalisa'}})],
          }),
          buildThread({
            comments: [buildComment({author: {login: 'lisa', avatarUrl: '', url: '/monalisa'}})],
          }),
        ]

        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          threads,
        })

        const {user} = render(<TestComponent componentType="content" line={line} />)

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })
    })

    describe('line number cells', () => {
      test('does not show view marker option when there are no threads or annotations', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          threads: [],
          annotations: [],
        })

        render(<TestComponent componentType="lineNumber" line={line} />)

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        expect(screen.queryByText('View markers')).toBeNull()
      })

      test('shows view marker option and opens single comment', async () => {
        const lineHtml = '+additional context'
        const partialThread = buildThread({comments: [buildComment({})]})
        const reviewThread = buildReviewThread({comments: [buildFullComment({bodyHTML: 'test comment'})]})
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          threads: [partialThread],
        })
        const mockedFetchThread = jest.fn(() => Promise.resolve(reviewThread))
        const commentingImpl = {
          ...mockCommentingImplementation,
          fetchThread: mockedFetchThread,
        }

        const {user} = render(
          <TestComponent commentingImplementation={commentingImpl} componentType="lineNumber" line={line} />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('test comment')).toBeInTheDocument()
      })

      test('shows view conversation option and opens single annotation', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          threads: [],
          annotations: [buildAnnotation({title: 'test annotation title'})],
        })

        const {user} = render(
          <TestComponent
            commentingImplementation={mockCommentingImplementation}
            componentType="lineNumber"
            line={line}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('test annotation title')).toBeInTheDocument()
      })

      test('shows view markers option and opens markers list', async () => {
        const lineHtml = '+additional context'
        const reviewThreads = [
          buildThread({
            comments: [buildComment({author: {login: 'mona', avatarUrl: '', url: '/monalisa'}})],
          }),
          buildThread({
            comments: [buildComment({author: {login: 'lisa', avatarUrl: '', url: '/monalisa'}})],
          }),
        ]
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          threads: reviewThreads,
        })

        const {user} = render(<TestComponent componentType="lineNumber" line={line} />)

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })
    })
  })

  describe('split diff', () => {
    describe('content cells', () => {
      test('when neither line has threads or annotations, does not show markers menu items', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })

        render(
          <TestComponent
            componentType="content"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        expect(screen.queryByText('View markers')).toBeNull()
        expect(screen.queryByText('View markers, modified line')).toBeNull()
      })

      test('when is left cell and left (original) line has threads, shows markers item', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="content"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [],
              originalLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is left cell and right (modified) line has threads, shows markers, modified line item', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="content"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
              originalLineThreads: [],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers, modified line')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is left cell and right (modified) line has annotations, shows markers, modified line item', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          annotations: [buildAnnotation({title: 'my annotation title'})],
        })
        const {user} = render(
          <TestComponent
            componentType="content"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers, modified line')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('my annotation title')).toBeInTheDocument()
      })

      test('when is right cell and left (original) line has threads, shows markers, original item', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="content"
            isLeftSide={false}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [],
              originalLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers, original line')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is right cell and right (modified) line has threads, shows markers item', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="content"
            isLeftSide={false}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
              originalLineThreads: [],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(screen.queryByText('View markers, original line')).toBeNull()
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is right cell and right (modified) line has annotations, shows markers item', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          annotations: [buildAnnotation({title: 'my annotation title'})],
        })
        const {user} = render(
          <TestComponent
            componentType="content"
            isLeftSide={false}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(screen.queryByText('View markers, original line')).toBeNull()
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('my annotation title')).toBeInTheDocument()
      })

      test('when is left cell and both lines have threads, shows markers item and markers, modified item', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="content"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
              originalLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona1',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa1',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona1')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa1')).toBeInTheDocument()

        fireEvent.contextMenu(contentCell)
        const viewModifiedLineThreads = await screen.findByText('View markers, modified line')
        expect(viewModifiedLineThreads).toBeInTheDocument()
        await user.click(viewModifiedLineThreads)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is right cell and both lines have threads, shows markers item and markers, original item', async () => {
        const lineHtml = '+additional context'
        const line = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="content"
            isLeftSide={false}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
              originalLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona1',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa1',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()

        fireEvent.contextMenu(contentCell)
        const viewModifiedLineThreads = await screen.findByText('View markers, original line')
        expect(viewModifiedLineThreads).toBeInTheDocument()
        await user.click(viewModifiedLineThreads)

        expect(await screen.findByText('Thread by mona1')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa1')).toBeInTheDocument()
      })
    })

    describe('line number cells', () => {
      test('when neither line has threads or annotations, does not show markers menu items', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })

        render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        expect(screen.queryByText('View markers')).toBeNull()
        expect(screen.queryByText('View markers, modified line')).toBeNull()
      })

      test('when is left cell and left (original) line has threads, shows markers item', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [],
              originalLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is left cell and right (modified) line has threads, shows markers, modified line item', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
              originalLineThreads: [],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers, modified line')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is left cell and right (modified) line has annotations, shows markers, modified line item', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          annotations: [buildAnnotation({title: 'my annotation title'})],
        })
        const {user} = render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers, modified line')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('my annotation title')).toBeInTheDocument()
      })

      test('when is right cell and left (original) line has threads, shows markers, original item', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={false}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [],
              originalLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers, original line')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is right cell and right (modified) line has threads, shows markers item', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={false}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
              originalLineThreads: [],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(screen.queryByText('View markers, original line')).toBeNull()
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is right cell and right (modified) line has annotations, shows markers item', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
          annotations: [buildAnnotation({title: 'my annotation title'})],
        })
        const {user} = render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={false}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(screen.queryByText('View markers, original line')).toBeNull()
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('my annotation title')).toBeInTheDocument()
      })

      test('when is left cell and both lines have threads, shows markers item and markers, modified item', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={true}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
              originalLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona1',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa1',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona1')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa1')).toBeInTheDocument()

        fireEvent.contextMenu(contentCell)
        const viewmodifiedLineThreads = await screen.findByText('View markers, modified line')
        expect(viewmodifiedLineThreads).toBeInTheDocument()
        await user.click(viewmodifiedLineThreads)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()
      })

      test('when is right cell and both lines have threads, shows markers item and markers, original item', async () => {
        const lineHtml = '+additional context'
        const line: DiffLine = buildDiffLine({
          __id: '1234',
          blobLineNumber: 1,
          left: 1,
          right: 1,
          html: lineHtml,
          type: 'CONTEXT',
          text: lineHtml,
        })
        const {user} = render(
          <TestComponent
            componentType="lineNumber"
            isLeftSide={false}
            isSplit={true}
            line={line}
            diffLineContextProps={{
              isSplit: true,
              modifiedLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
              originalLineThreads: [
                {
                  id: 'abcd',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'mona1',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
                {
                  id: '1234',
                  author: {
                    avatarUrl: '/gravatar',
                    login: 'lisa1',
                  },
                  commentCount: 0,
                  isOutdated: false,
                },
              ],
            }}
          />,
        )

        const contentCell = await screen.findByRole('gridcell')
        fireEvent.contextMenu(contentCell)
        const viewMarkers = await screen.findByText('View markers')
        expect(viewMarkers).toBeInTheDocument()
        await user.click(viewMarkers)

        expect(await screen.findByText('Thread by mona')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa')).toBeInTheDocument()

        fireEvent.contextMenu(contentCell)
        const viewModifiedLineThreads = await screen.findByText('View markers, original line')
        expect(viewModifiedLineThreads).toBeInTheDocument()
        await user.click(viewModifiedLineThreads)

        expect(await screen.findByText('Thread by mona1')).toBeInTheDocument()
        expect(await screen.findByText('Thread by lisa1')).toBeInTheDocument()
      })
    })
  })
})

describe('add comment header', () => {
  test('component displays the selected line number plus R (e.g. R4) in the header when right side of diff comment', async () => {
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 6, left: 4, right: 6, type: 'ADDITION'})
    const {user} = render(<TestComponent line={diffLine} />)

    const contentCell = await screen.findByRole('gridcell')
    await user.click(contentCell)
    const startConvoButton = await screen.findByLabelText('Start conversation')
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line R6')).toBeInTheDocument()
  })

  test('component displays the selected line number plus L (e.g. L4) in the header when left side of diff comment', async () => {
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 4, left: 4, right: 6, type: 'DELETION'})
    const {user} = render(<TestComponent isLeftSide={true} line={diffLine} />)

    const contentCell = await screen.findByRole('gridcell')
    await user.click(contentCell)
    const startConvoButton = await screen.findByLabelText('Start conversation')
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line L4')).toBeInTheDocument()
  })
})

test('typing {esc} key inside of start comment editor closes dialog', async () => {
  const diffLine = buildDiffLine({threads: [], blobLineNumber: 4, left: 4, right: 6, type: 'DELETION'})
  const {user} = render(<TestComponent isLeftSide={true} line={diffLine} />)

  const contentCell = await screen.findByRole('gridcell')
  await user.click(contentCell)
  await user.click(await screen.findByLabelText('Start conversation'))
  const textArea = await screen.findByPlaceholderText('Leave a comment')
  await user.type(textArea, '{escape}')

  await waitFor(() => expect(screen.queryByPlaceholderText('Leave a comment')).not.toBeInTheDocument())
})

test('typing additional key combos inside of start comment editor does not close dialog', async () => {
  const diffLine = buildDiffLine({threads: [], blobLineNumber: 4, left: 4, right: 6, type: 'DELETION'})
  const {user} = render(<TestComponent isLeftSide={true} line={diffLine} />)

  const contentCell = await screen.findByRole('gridcell')
  await user.click(contentCell)
  await user.click(await screen.findByLabelText('Start conversation'))
  const textArea = await screen.findByPlaceholderText('Leave a comment')
  // This creates a "meta + shift + Arrow Left"" key combo which is used to expand all difflines in a diff when start converstaion dialog is not opened
  const keyCombo = '{meta}{shift}{arrowleft}'
  await user.type(textArea, keyCombo)

  expect(screen.getByPlaceholderText('Leave a comment')).toBeInTheDocument()
})

describe('in progress comment indicator', () => {
  test('displays the in progress comment indicator when there is an in progress comment on the line', async () => {
    const diffLine = buildDiffLine({
      threads: [],
      blobLineNumber: 4,
      left: 4,
      right: 6,
      type: 'DELETION',
      text: `import type {DiffLine} from './types'`,
      html: `<span>import type {DiffLine} from './types'</span>`,
    })
    const {user} = render(<TestComponent isLeftSide={true} line={diffLine} />)

    const contentCell = await screen.findByRole('gridcell')
    await user.click(contentCell)
    await user.click(await screen.findByLabelText('Start conversation'))
    const textArea = await screen.findByPlaceholderText('Leave a comment')
    await user.type(textArea, 'This is a comment')
    await user.keyboard('{Escape}')

    const inProgressIndicator = await screen.findByLabelText('Start conversation (comment in progress)')
    expect(inProgressIndicator).toBeInTheDocument()
  })

  test('cancelling an in progress comment clears the in progress comment indicator', async () => {
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 4, left: 4, right: 6, type: 'DELETION'})
    const {user} = render(<TestComponent isLeftSide={true} line={diffLine} />)

    const contentCell = await screen.findByRole('gridcell')
    await user.click(contentCell)
    await user.click(await screen.findByLabelText('Start conversation'))
    const textArea = await screen.findByPlaceholderText('Leave a comment')
    await user.type(textArea, 'This is a comment')
    await user.click(screen.getByText('Cancel'))

    expect(screen.queryByLabelText('Start conversation (comment in progress)')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Start conversation')).toBeInTheDocument()
  })
})

describe('Commenting from content cells, when suggested changes are not enabled by commenting implementation', () => {
  test('does not show add suggested changes button in markdown toolbar', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(
      <TestComponent
        line={diffLine}
        isLeftSide={false}
        commentingImplementation={{...mockCommentingImplementation, suggestedChangesEnabled: false}}
        diffLineContextProps={{fileAnchor}}
      />,
    )

    const contentCell = await screen.findByRole('gridcell')
    await user.click(contentCell)
    const startConvoButton = await screen.findByLabelText('Start conversation')
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
    const addSuggestionButton = screen.queryByLabelText('Add a suggestion')
    expect(addSuggestionButton).not.toBeInTheDocument()
  })
})

describe('Commenting from content cells shows add suggested changes button in markdown toolbar', () => {
  test('show markdown editor button when line is not a DELETION and send analytics event when engaged', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(<TestComponent line={diffLine} isLeftSide={false} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')
    await user.click(contentCell)
    const startConvoButton = await screen.findByLabelText('Start conversation')
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()

    fireEvent.click(addSuggestionButton)

    expectAnalyticsEvents(
      {
        type: 'diff.start_new_conversation',
        target: 'PLUS_ICON',
      },
      {
        type: 'diff.add_suggested_change',
        target: 'ADD_SUGGESTED_CHANGE_BUTTON',
      },
    )
  })

  test('show context menu item for suggesting changes when line is not a DELETION', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(<TestComponent line={diffLine} isLeftSide={false} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const suggestionMenuItem = await screen.findByText('Suggest change on line R22')
    expect(suggestionMenuItem).toBeInTheDocument()

    await user.click(suggestionMenuItem)
    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
  })

  test('do not show context menu item for suggesting changes when line is not a DELETION and is not a PR context', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    const diffContext = 'commit'
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    render(<TestComponent line={diffLine} isLeftSide={false} diffLineContextProps={{fileAnchor, diffContext}} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    expect(screen.queryByText('Suggest change on line R22')).not.toBeInTheDocument()
  })

  test('show markdown editor button when line is not a DELETION and there is no selected line range (this happens when dialog is opened from context menu of cell)', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: undefined,
    })
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(<TestComponent line={diffLine} isLeftSide={false} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')

    await user.click(contentCell)
    const startConvoButton = await screen.findByLabelText(/^Start conversation/)
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()
  })

  test('show context menu item for suggesting changes when line is not a DELETION and there is no selected line range', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: undefined,
    })
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(<TestComponent line={diffLine} isLeftSide={false} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const suggestionMenuItem = await screen.findByText('Suggest change on line R22')
    expect(suggestionMenuItem).toBeInTheDocument()

    await user.click(suggestionMenuItem)
    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
  })

  test('do not show markdown editor button when line is a DELETION', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 21, left: 21, right: 22, type: 'DELETION'})
    const {user} = render(<TestComponent line={diffLine} isLeftSide={true} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')
    await user.click(contentCell)
    const startConvoButton = await screen.findByLabelText('Start conversation')
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line L21')).toBeInTheDocument()
    expect(screen.queryByLabelText('Add a suggestion')).not.toBeInTheDocument()
  })

  test('do not show context menu item when line is a DELETION', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 21, left: 21, right: 22, type: 'DELETION'})
    render(<TestComponent line={diffLine} isLeftSide={true} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')

    fireEvent.contextMenu(contentCell)
    const suggestionMenuItem = screen.queryByText(/Suggest change/)
    expect(suggestionMenuItem).toBeNull()
  })
})

describe('Commenting from line number cells, when suggested changes are not enabled by commenting implementation', () => {
  test('does not show add suggested changes button in markdown toolbar', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(
      <TestComponent
        line={diffLine}
        componentType="lineNumber"
        isLeftSide={false}
        commentingImplementation={{...mockCommentingImplementation, suggestedChangesEnabled: false}}
        diffLineContextProps={{fileAnchor}}
      />,
    )

    const lineNumberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(lineNumberCell)
    const startConvoButton = await screen.findByLabelText('Start conversation on line R22')
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
    const addSuggestionButton = screen.queryByLabelText('Add a suggestion')
    expect(addSuggestionButton).not.toBeInTheDocument()
  })
})

describe('Commenting from line number cells shows add suggested changes button in markdown toolbar', () => {
  test('show markdown editor button when line is on not a DELETION and send analytics event when engaged', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(
      <TestComponent
        line={diffLine}
        componentType="lineNumber"
        isLeftSide={false}
        diffLineContextProps={{fileAnchor}}
      />,
    )

    const lineNumberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(lineNumberCell)
    const startConvoButton = await screen.findByLabelText('Start conversation on line R22')
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()

    fireEvent.click(addSuggestionButton)

    expectAnalyticsEvents({
      type: 'diff.add_suggested_change',
      target: 'ADD_SUGGESTED_CHANGE_BUTTON',
    })
  })

  test('show context menu item for suggesting changes when line is not a DELETION', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(
      <TestComponent
        line={diffLine}
        componentType="lineNumber"
        isLeftSide={false}
        diffLineContextProps={{fileAnchor}}
      />,
    )

    const lineNumberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(lineNumberCell)
    const suggestionMenuItem = await screen.findByText('Suggest change on line R22')
    expect(suggestionMenuItem).toBeInTheDocument()

    await user.click(suggestionMenuItem)
    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
  })

  test('show button when line is not on a DELETION line and there is no selected line range (this happens when dialog is opened from context menu of cell)', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(
      <TestComponent
        line={diffLine}
        componentType="lineNumber"
        isLeftSide={false}
        diffLineContextProps={{fileAnchor}}
      />,
    )

    const lineNumberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(lineNumberCell)
    const startConvoButton = await screen.findByLabelText('Start conversation on line R22')
    await user.click(startConvoButton)

    await screen.findByText('Add a comment to line R22')
    const addSuggestionButton = screen.getByLabelText('Add a suggestion')
    expect(addSuggestionButton).toBeInTheDocument()
  })

  test('show context menu item for suggesting changes when line is not a DELETION and there is no selected line range', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: undefined,
    })
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 22, left: 21, right: 22, type: 'ADDITION'})
    const {user} = render(
      <TestComponent
        line={diffLine}
        componentType="lineNumber"
        isLeftSide={false}
        diffLineContextProps={{fileAnchor}}
      />,
    )

    const lineNumberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(lineNumberCell)
    const suggestionMenuItem = await screen.findByText('Suggest change on line R22')
    expect(suggestionMenuItem).toBeInTheDocument()

    await user.click(suggestionMenuItem)
    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
  })

  test('do not show markdown editor button when line is a DELETION', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 21, left: 21, right: 22, type: 'DELETION'})
    const {user} = render(
      <TestComponent
        line={diffLine}
        isLeftSide={true}
        componentType="lineNumber"
        diffLineContextProps={{fileAnchor}}
      />,
    )

    const lineNumberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(lineNumberCell)
    const startConvoButton = await screen.findByLabelText('Start conversation on line L21')
    await user.click(startConvoButton)

    expect(screen.getByText('Add a comment to line L21')).toBeInTheDocument()
    expect(screen.queryByLabelText('Add a suggestion')).not.toBeInTheDocument()
  })

  test('do not show context menu item when line is a DELETION', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue(selectedDiffRowRangeContextReturnDataMock)
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 21, left: 21, right: 22, type: 'DELETION'})
    render(
      <TestComponent
        line={diffLine}
        isLeftSide={true}
        componentType="lineNumber"
        diffLineContextProps={{fileAnchor}}
      />,
    )

    const lineNumberCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(lineNumberCell)
    const suggestionMenuItem = screen.queryByText(/Suggest change/)
    expect(suggestionMenuItem).toBeNull()
  })
})

describe('Suggested change context menu item auto inserts suggestion', () => {
  test('when suggest change context menu item is engaged from the cell, sends analytics and inserts suggestion', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: {
        diffAnchor: fileAnchor,
        startOrientation: 'right',
        startLineNumber: 22,
        endOrientation: 'right',
        endLineNumber: 22,
        firstSelectedLineNumber: 22,
        firstSelectedOrientation: 'right',
      },
    })
    const diffLineText = 'octocatss'
    const diffLine = buildDiffLine({
      threads: [],
      blobLineNumber: 22,
      left: 21,
      right: 22,
      type: 'ADDITION',
      text: diffLineText,
    })
    const {user} = render(<TestComponent line={diffLine} isLeftSide={false} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const suggestionMenuItem = await screen.findByText('Suggest change on line R22')
    expect(suggestionMenuItem).toBeInTheDocument()

    await user.click(suggestionMenuItem)
    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
    const markdownSuggestion = `\`\`\`suggestion\n${diffLineText}\n\`\`\``
    expect(
      await screen.findByDisplayValue(markdownSuggestion, {
        normalizer: getDefaultNormalizer({collapseWhitespace: false}),
      }),
    ).toBeInTheDocument()
    expectAnalyticsEvents({
      type: 'diff.start_new_conversation_with_suggested_change',
      target: 'CELL_CONTEXT_MENU',
    })
  })

  test('when suggest change context menu item is engaged from the action bar, sends analytics and inserts suggestion', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: {
        diffAnchor: fileAnchor,
        startOrientation: 'right',
        startLineNumber: 22,
        endOrientation: 'right',
        endLineNumber: 22,
        firstSelectedLineNumber: 22,
        firstSelectedOrientation: 'right',
      },
    })
    const diffLineText = 'octocatss'
    const diffLine = buildDiffLine({
      threads: [],
      blobLineNumber: 22,
      left: 21,
      right: 22,
      type: 'ADDITION',
      text: diffLineText,
    })
    const {user} = render(<TestComponent line={diffLine} isLeftSide={false} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.mouseOver(contentCell)

    const moreActionsButton = await screen.findByLabelText('More actions')
    expect(moreActionsButton).toBeInTheDocument()
    await user.click(moreActionsButton)

    const suggestionMenuItem = await screen.findByText('Suggest change on line R22')
    expect(suggestionMenuItem).toBeInTheDocument()

    await user.click(suggestionMenuItem)
    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
    const markdownSuggestion = `\`\`\`suggestion\n${diffLineText}\n\`\`\``
    expect(
      await screen.findByDisplayValue(markdownSuggestion, {
        normalizer: getDefaultNormalizer({collapseWhitespace: false}),
      }),
    ).toBeInTheDocument()
    expectAnalyticsEvents({
      type: 'diff.start_new_conversation_with_suggested_change',
      target: 'ACTION_BAR_CONTEXT_MENU',
    })
  })

  test('when start conversation context menu item is engaged, does not auto insert suggestion', async () => {
    const fileAnchor = `diff-mockedFileAnchor`
    mockSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: {
        diffAnchor: fileAnchor,
        startOrientation: 'right',
        startLineNumber: 22,
        endOrientation: 'right',
        endLineNumber: 22,
        firstSelectedLineNumber: 22,
        firstSelectedOrientation: 'right',
      },
    })
    const diffLineText = 'octocatss'
    const diffLine = buildDiffLine({
      threads: [],
      blobLineNumber: 22,
      left: 21,
      right: 22,
      type: 'ADDITION',
      text: diffLineText,
    })
    const {user} = render(<TestComponent line={diffLine} isLeftSide={false} diffLineContextProps={{fileAnchor}} />)

    const contentCell = await screen.findByRole('gridcell')
    fireEvent.contextMenu(contentCell)
    const startConversationMenuItem = await screen.findByText('Start conversation on line R22')
    expect(startConversationMenuItem).toBeInTheDocument()

    await user.click(startConversationMenuItem)
    expect(screen.getByText('Add a comment to line R22')).toBeInTheDocument()
    const markdownSuggestion = `\`\`\`suggestion\n${diffLineText}\n\`\`\``
    expect(
      screen.queryByText(markdownSuggestion, {normalizer: getDefaultNormalizer({collapseWhitespace: false})}),
    ).toBeNull()
    expect(screen.queryByText(/```suggestion/)).toBeNull()
  })
})
