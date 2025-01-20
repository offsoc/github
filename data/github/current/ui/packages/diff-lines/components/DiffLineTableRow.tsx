import {lineAnchorFrom, lineOrientationFrom} from '@github-ui/diffs/diff-line-helpers'
import type {DiffAnchor} from '@github-ui/diffs/types'
import type {MouseEvent} from 'react'
import React, {useCallback} from 'react'

import {ContentCell, EmptyCell, LineNumberCell} from './DiffLineTableCellParts'
import {MarkersDialogContextProvider} from '../contexts/MarkersDialogContext'
import {useDiffContext} from '../contexts/DiffContext'
import {useDiffLineContext} from '../contexts/DiffLineContext'
import {isEmptyDiffLine} from '../helpers/line-helpers'
import type {CopilotChatFileDiffReferenceData, DiffLine} from '../types'
import type {DiffMatchContent} from '../helpers/find-in-diff'

type HandleDiffRowClickFn = (
  event: React.MouseEvent<HTMLTableCellElement>,
  lineNumber: number,
  orientation: 'left' | 'right',
  shiftKey: boolean,
) => void

const CodeDiffLineUnmemoized = ({
  summary,
  resultsForLine,
  focusedSearchResult,
  handleDiffSideCellSelectionBlocking,
  handleDiffRowClick,
  lineAnchor,
  filePath,
  copilotChatReferenceData,
}: {
  summary?: string
  resultsForLine?: DiffMatchContent[]
  focusedSearchResult?: number
  filePath: string
  lineAnchor: string
  handleDiffSideCellSelectionBlocking?: (diffSide: 'left' | 'right') => void
  handleDiffRowClick: HandleDiffRowClickFn
  copilotChatReferenceData?: CopilotChatFileDiffReferenceData
}) => {
  const {diffLine, isLeftSide, isSplit} = useDiffLineContext()
  const line = diffLine as DiffLine
  const {viewerData} = useDiffContext()
  const {tabSizePreference} = viewerData

  /*
   * display the left cell for all lines in a unified view, and left lines of a split view
   * this cell will not contain a number in the unified view if the line is an addition
   */
  const showLeftNumber = line.type !== 'ADDITION'
  const showLeftNumberCell = !isSplit || isLeftSide
  const displayingEmptyLeftNumberCell = showLeftNumberCell && !showLeftNumber

  /*
   * display the right cell for all lines in a unified view, and right lines of a split view
   * this cell will not contain a number in the unified view if the line is a deletion
   */
  const showRightNumber = line.type !== 'DELETION'
  const showRightNumberCell = !isSplit || !isLeftSide
  const displayingEmptyRightNumberCell = showRightNumberCell && !showRightNumber

  const handleLeftDiffCellClick = useCallback(
    (event: MouseEvent<HTMLTableCellElement>) => {
      if (!line.left) return
      handleDiffRowClick(event, line.left, 'left', event.shiftKey)
    },
    [handleDiffRowClick, line.left],
  )

  const handleRightDiffCellClick = useCallback(
    (event: MouseEvent<HTMLTableCellElement>) => {
      if (!line.right) return
      handleDiffRowClick(event, line.right, 'right', event.shiftKey)
    },
    [handleDiffRowClick, line.right],
  )

  const handleRightDiffSideCellSelectionBlocking = useCallback(() => {
    if (!handleDiffSideCellSelectionBlocking) return
    const diffSideToBlock = 'left'
    handleDiffSideCellSelectionBlocking(diffSideToBlock)
  }, [handleDiffSideCellSelectionBlocking])

  const handleLeftDiffSideCellSelectionBlocking = useCallback(() => {
    if (!handleDiffSideCellSelectionBlocking) return
    const diffSideToBlock = 'right'
    handleDiffSideCellSelectionBlocking(diffSideToBlock)
  }, [handleDiffSideCellSelectionBlocking])

  return (
    <MarkersDialogContextProvider line={line}>
      {showLeftNumberCell && (
        <LineNumberCell
          copilotChatReferenceData={copilotChatReferenceData}
          columnIndex={0}
          filePath={filePath}
          // If this cell is empty, select the right-side (modified) row
          handleDiffCellClick={displayingEmptyLeftNumberCell ? handleRightDiffCellClick : handleLeftDiffCellClick}
          handleDiffSideCellSelectionBlocking={handleLeftDiffSideCellSelectionBlocking}
        >
          {showLeftNumber && line.left}
        </LineNumberCell>
      )}
      {showRightNumberCell && (
        <LineNumberCell
          copilotChatReferenceData={copilotChatReferenceData}
          columnIndex={isSplit ? 2 : 1}
          filePath={filePath}
          // If this cell is empty, select the left-side (original) row
          handleDiffCellClick={displayingEmptyRightNumberCell ? handleLeftDiffCellClick : handleRightDiffCellClick}
          handleDiffSideCellSelectionBlocking={handleRightDiffSideCellSelectionBlocking}
        >
          {showRightNumber && line.right}
        </LineNumberCell>
      )}
      <ContentCell
        copilotChatReferenceData={copilotChatReferenceData}
        columnIndex={isSplit ? (isLeftSide ? 1 : 3) : 2}
        filePath={filePath}
        handleDiffCellClick={isLeftSide ? handleLeftDiffCellClick : handleRightDiffCellClick}
        lineAnchor={lineAnchor}
        tabSize={tabSizePreference}
        handleDiffSideCellSelectionBlocking={
          isLeftSide ? handleLeftDiffSideCellSelectionBlocking : handleRightDiffSideCellSelectionBlocking
        }
        searchResultsForLine={resultsForLine}
        focusedSearchResult={focusedSearchResult}
        summary={summary}
      />
    </MarkersDialogContextProvider>
  )
}

interface DiffSideProps {
  summary?: string
  resultsForLine?: DiffMatchContent[]
  focusedSearchResult?: number
  fileAnchor: DiffAnchor
  filePath: string
  handleDiffRowClick: HandleDiffRowClickFn
  handleDiffSideCellSelectionBlocking: (diffSide: 'left' | 'right') => void
  copilotChatReferenceData?: CopilotChatFileDiffReferenceData
}

export const DiffLineSideUnmemoized = ({
  summary,
  resultsForLine,
  focusedSearchResult,
  fileAnchor,
  filePath,
  handleDiffRowClick,
  handleDiffSideCellSelectionBlocking,
  copilotChatReferenceData,
}: DiffSideProps) => {
  const {diffLine, isLeftSide} = useDiffLineContext()
  if (isEmptyDiffLine(diffLine)) {
    return (
      <>
        <EmptyCell columnIndex={isLeftSide ? 0 : 2} />
        <EmptyCell columnIndex={isLeftSide ? 1 : 3} showRightBorder={isLeftSide} />
      </>
    )
  }

  const lineOrientation = isLeftSide ? 'left' : lineOrientationFrom(diffLine.type)
  const lineNumber = lineOrientation === 'left' ? diffLine.left : diffLine.right
  const lineAnchor = lineAnchorFrom(fileAnchor, lineOrientation, lineNumber ?? 0)

  switch (diffLine.type) {
    case 'HUNK':
      return null
    case 'ADDITION':
    case 'DELETION':
    case 'CONTEXT':
    case 'INJECTED_CONTEXT':
      return (
        <CodeDiffLine
          copilotChatReferenceData={copilotChatReferenceData}
          filePath={filePath}
          handleDiffRowClick={handleDiffRowClick}
          handleDiffSideCellSelectionBlocking={handleDiffSideCellSelectionBlocking}
          lineAnchor={lineAnchor}
          resultsForLine={resultsForLine}
          focusedSearchResult={focusedSearchResult}
          summary={summary}
        />
      )
    default:
      throw new Error(`cannot handle type ${diffLine.type}`)
  }
}

export const DiffLineSide = React.memo(DiffLineSideUnmemoized)
export const CodeDiffLine = React.memo(CodeDiffLineUnmemoized)
