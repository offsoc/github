import {AnalyticsProvider} from '@github-ui/analytics-provider'
import type {DiffAnchor} from '@github-ui/diffs/types'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {DiffLineContextProvider} from '../../contexts/DiffLineContext'
import {useSelectedDiffRowRangeContext} from '../../contexts/SelectedDiffRowRangeContext'
import {CodeDiffLine} from '../DiffLineTableRow'
import type {DiffLine, DiffSide} from '../../types'
import {noop} from '@github-ui/noop'
import {mockCommentingImplementation} from '@github-ui/conversations/test-utils'
import {DiffContextProvider} from '../../contexts/DiffContext'

jest.mock('../../contexts/SelectedDiffRowRangeContext')
const mockSelectedDiffRowRangeContext = jest.mocked(useSelectedDiffRowRangeContext)

function TestComponent({line, viewerCanComment = true}: {line: DiffLine; viewerCanComment?: boolean}) {
  const diffLineContext = Object.assign(
    {},
    {
      diffEntryId: 'stub',
      diffLine: line,
      isSplit: false,
      fileAnchor: 'diff-1234' as DiffAnchor,
      fileLineCount: 1,
      rowId: 'mockRowId',
      filePath: '1234',
    },
  )

  return (
    <AnalyticsProvider appName="test-app" category="test-category" metadata={{}}>
      <DiffContextProvider
        addInjectedContextLines={noop}
        commentBatchPending={false}
        commentingEnabled={true}
        commentingImplementation={mockCommentingImplementation}
        repositoryId="test-id"
        subject={{}}
        subjectId="subjectId"
        viewerData={{
          avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
          diffViewPreference: 'split',
          isSiteAdmin: false,
          login: 'mona',
          tabSizePreference: 1,
          viewerCanComment,
          viewerCanApplySuggestion: true,
        }}
      >
        <DiffLineContextProvider {...diffLineContext}>
          <table>
            <tbody>
              <tr>
                <CodeDiffLine filePath="mockFilePath" handleDiffRowClick={jest.fn()} lineAnchor="mockLineAnchor" />
              </tr>
            </tbody>
          </table>
        </DiffLineContextProvider>
      </DiffContextProvider>
    </AnalyticsProvider>
  )
}

beforeEach(() => {
  mockSelectedDiffRowRangeContext.mockReturnValue({
    selectedDiffLines: {leftLines: [], rightLines: []},
    selectedDiffRowRange: undefined,
    updateSelectedDiffRowRange: jest.fn(),
    clearSelectedDiffRowRange: jest.fn(),
    replaceSelectedDiffRowRange: jest.fn(),
    replaceSelectedDiffRowRangeFromGridCells: jest.fn(),
    updateDiffLines: jest.fn(),
    getDiffLinesFromLineRange: jest.fn(),
    getDiffLinesByDiffAnchor: jest.fn(),
  })
})

describe('CodeDiffLine', () => {
  describe('actionBar', () => {
    test('actionBar is visible on hover', async () => {
      const threadsData = {
        totalCount: 1,
        totalCommentsCount: 1,
        threads: [
          {
            id: '1234',
            isOutdated: false,
            commentsData: {
              totalCount: 1,
              comments: [
                {
                  author: {
                    avatarUrl: 'https://example.com/avatar.png',
                    login: 'collaborator',
                    url: '/monalisa',
                  },
                },
              ],
            },
            diffSide: 'LEFT' as DiffSide,
          },
        ],
      }
      const lineHtml = '+additional context'
      const line: DiffLine = {
        __id: '1234',
        blobLineNumber: 1,
        left: 1,
        right: 1,
        html: lineHtml,
        threadsData,
        type: 'CONTEXT',
        text: lineHtml,
      }

      render(<TestComponent line={line} />)

      // hover over the cell
      const contentCell = await screen.findByText(lineHtml)
      fireEvent.mouseOver(contentCell)

      // check if the actionBar items are visible
      const avatar = await screen.findByAltText('collaborator')
      expect(avatar).toBeInTheDocument()
      const startConversationButton = await screen.findByLabelText('Start conversation')
      expect(startConversationButton).toBeInTheDocument()
      const moreActionsButton = await screen.findByLabelText('More actions')
      expect(moreActionsButton).toBeInTheDocument()
    })

    test('avatar in the actionBar is not visible on hover, when there are no comments', async () => {
      const lineHtml = '+additional context'
      const line: DiffLine = {
        __id: '1234',
        blobLineNumber: 1,
        left: 1,
        right: 1,
        html: lineHtml,
        type: 'CONTEXT',
        text: lineHtml,
      }
      render(<TestComponent line={line} />)

      // hover over the cell
      const contentCell = await screen.findByText(lineHtml)
      fireEvent.mouseOver(contentCell)

      // check if the actionBar items are visible
      expect(screen.queryByAltText('collaborator')).not.toBeInTheDocument()
      const startConversationButton = await screen.findByLabelText('Start conversation')
      expect(startConversationButton).toBeInTheDocument()
      const moreActionsButton = await screen.findByLabelText('More actions')
      expect(moreActionsButton).toBeInTheDocument()
    })

    test('Start a conversation button is not visible if viewer cannot comment', async () => {
      const lineHtml = '+additional context'
      const line: DiffLine = {
        __id: '1234',
        blobLineNumber: 1,
        left: 1,
        right: 1,
        html: lineHtml,
        type: 'CONTEXT',
        text: lineHtml,
      }
      render(<TestComponent line={line} viewerCanComment={false} />)

      // hover over the cell
      const contentCell = await screen.findByText(lineHtml)
      fireEvent.mouseOver(contentCell)

      // check if the + icon is visible
      expect(screen.queryByLabelText('Start conversation')).not.toBeInTheDocument()
    })
  })
})
