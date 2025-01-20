import {lineAnchorFrom, lineOrientationFrom} from '@github-ui/diffs/diff-line-helpers'
import type {DiffAnchor} from '@github-ui/diffs/types'
import {Fragment, memo, type MouseEvent, type RefObject, useEffect, useMemo} from 'react'

import {DiffLineContextProvider} from '../contexts/DiffLineContext'
import type {
  UpdateSelectedDiffRowRangeFnArgs,
  ReplaceSelectedDiffRowRangeFromGridCellsFnArgs,
} from '../contexts/SelectedDiffRowRangeContext'
import DiffRowSelectedChecker from '../helpers/diff-row-selected-checker'
import {getDiffHunksData, getLineHunkData} from '../helpers/hunk-data-helpers'
import {rowIdFrom} from '../helpers/line-helpers'
import {useGridNavigation} from '../hooks/use-grid-navigation'
import type {DiffLine, LineRange, ClientDiffLine, CopilotChatFileDiffReferenceData, DiffContext} from '../types'
import {CodeDiffLine} from './DiffLineTableRow'
import ExpandableHunkHeaderDiffLine from './ExpandableHunkHeaderDiffLine'
import type {DiffMatchContent} from '../helpers/find-in-diff'
import {buildDiffLineScreenReaderSummary} from './DiffLineScreenReaderSummary'

const UnifiedDiffLines = memo(function UnifiedDiffLines({
  searchResults,
  diffContext = 'pr',
  focusedSearchResult,
  clearSelectedDiffRowRange,
  diffEntryId,
  diffLines,
  fileLineCount,
  fileAnchor,
  filePath,
  tableRef,
  selectedDiffRowRange,
  handleDiffRowClick,
  updateDiffLines,
  updateSelectedDiffRowRange,
  replaceSelectedDiffRowRangeFromGridCells,
  copilotChatReferenceData,
}: {
  searchResults?: DiffMatchContent[]
  diffContext?: DiffContext
  focusedSearchResult?: number
  clearSelectedDiffRowRange: () => void
  diffEntryId: string
  diffLines: DiffLine[]
  fileLineCount: number
  fileAnchor: DiffAnchor
  filePath: string
  tableRef: RefObject<HTMLTableElement>
  selectedDiffRowRange: LineRange | null
  handleDiffRowClick: (
    event: MouseEvent<HTMLTableCellElement>,
    lineNumber: number,
    orientation: 'left' | 'right' | undefined,
    shiftKey: boolean,
  ) => void
  updateDiffLines: (diffAnchor: string, diffLines: DiffLine[]) => void
  updateSelectedDiffRowRange: UpdateSelectedDiffRowRangeFnArgs
  replaceSelectedDiffRowRangeFromGridCells: ReplaceSelectedDiffRowRangeFromGridCellsFnArgs
  copilotChatReferenceData?: CopilotChatFileDiffReferenceData
}) {
  useGridNavigation({
    clearSelectedDiffRowRange,
    containerRef: tableRef,
    fileAnchor,
    isSplitDiff: false,
    leftLines: diffLines as unknown as ClientDiffLine[],
    replaceSelectedDiffRowRangeFromGridCells,
    selectedDiffRowRange,
    updateSelectedDiffRowRange,
  })

  const diffRowSelectedChecker = useMemo(() => {
    if (!selectedDiffRowRange) return undefined
    return DiffRowSelectedChecker({
      selectedDiffRowRange,
      leftLines: diffLines,
    })
  }, [selectedDiffRowRange, diffLines])

  const hunksData = useMemo(() => getDiffHunksData(diffLines.map(diffLine => diffLine)), [diffLines])

  useEffect(() => {
    updateDiffLines(fileAnchor, diffLines)
  }, [diffLines, fileAnchor, updateDiffLines])

  const lineWithSearchContentMap = new Map<number, DiffMatchContent[]>()
  for (let i = 0; i < (searchResults?.length ?? 0); i++) {
    const searchResult = searchResults?.[i]

    if (!searchResult) continue
    if (searchResults && lineWithSearchContentMap.has(searchResult.diffLineNumIndex)) {
      lineWithSearchContentMap.get(searchResult.diffLineNumIndex)?.push(searchResult)
      //already had a match on this line, add to it
    } else if (searchResults) {
      lineWithSearchContentMap.set(searchResult.diffLineNumIndex, [searchResult])
    }
  }

  const lines = diffLines.map((line, i) => {
    const currentLine = line
    const nextLine = diffLines[i + 1] as DiffLine | undefined
    const prevLine = diffLines[i - 1] as DiffLine | undefined
    const isHunkRow = line.type === 'HUNK'
    const lineAnchor = lineAnchorFrom(fileAnchor, lineOrientationFrom(currentLine.type), currentLine.blobLineNumber)
    const {currentHunk, nextHunk, previousHunk} = getLineHunkData(currentLine, hunksData)
    const resultsForLine = lineWithSearchContentMap.get(i)
    const focusedResult = i === resultsForLine?.[0]?.diffLineNumIndex ? focusedSearchResult : undefined
    const summary = buildDiffLineScreenReaderSummary(line, line, 'RIGHT')

    const isRowSelected = diffRowSelectedChecker?.isRowSelected(currentLine)
    const rowId = rowIdFrom(fileAnchor, currentLine, currentLine)

    const diffLineContextData = {
      diffEntryId,
      diffLine: currentLine,
      currentHunk,
      fileAnchor,
      fileLineCount,
      filePath,
      isLeftSide: currentLine.type === 'DELETION',
      isSplit: false,
      nextHunk,
      previousHunk,
      diffContext,
    }

    return (
      <Fragment key={i}>
        <tr className="diff-line-row">
          <DiffLineContextProvider {...diffLineContextData} isRowSelected={isRowSelected} rowId={rowId}>
            {isHunkRow ? (
              <ExpandableHunkHeaderDiffLine
                key={i}
                nextLine={nextLine}
                prevLine={prevLine}
                focusedSearchResult={focusedResult}
                resultsForLine={resultsForLine}
              />
            ) : (
              <CodeDiffLine
                key={i}
                filePath={filePath}
                copilotChatReferenceData={copilotChatReferenceData}
                handleDiffRowClick={handleDiffRowClick}
                lineAnchor={lineAnchor}
                resultsForLine={resultsForLine}
                focusedSearchResult={focusedResult}
                summary={summary}
              />
            )}
          </DiffLineContextProvider>
        </tr>
      </Fragment>
    )
  })

  return <>{lines}</>
})

export default UnifiedDiffLines
