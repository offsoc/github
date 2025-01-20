import {announce} from '@github-ui/aria-live'
import type {DiffAnchor} from '@github-ui/diffs/types'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo, useRef, useState} from 'react'

import DiffRowSelectedChecker from '../helpers/diff-row-selected-checker'
import type {GridCell} from '../helpers/grid-navigator'
import {parseLineRangeHash, updateURLHashFromLineRange} from '../helpers/document-hash-helpers'
import type {ClientDiffLine, LineRange, DiffLine} from '../types'
import {useStableCallback} from '../hooks/use-stable-callback'
import {groupDiffLines} from '../helpers/line-helpers'

export type UpdateSelectedDiffRowRangeFnArgs = (
  diffAnchor: DiffAnchor,
  lineNumber: number | null | undefined,
  orientation: 'left' | 'right' | undefined,
  shiftKey?: boolean | undefined,
) => void

export type ReplaceSelectedDiffRowRangeFromGridCellsFnArgs = ({
  diffAnchor,
  startGridCell,
  endGridCell,
  focusedGridCell,
}: {
  diffAnchor: DiffAnchor
  startGridCell: GridCell
  endGridCell: GridCell
  focusedGridCell: GridCell
}) => void

export type SelectedDiffLines = {
  leftLines: ClientDiffLine[]
  rightLines: ClientDiffLine[]
}

/**
 * Context data for the SelectedDiffRowRangeContext
 *
 * When a user selects a range of lines in a diff, we store the selected range and associated diffLines in this context. Selected lines will be highlighted visually in the diff with a different background color.
 */
export interface SelectedDiffRowRangeContextData {
  /**
   *  The diffLines (grouped by left and right) that correspond to the selectedDiffRowRange
   */
  selectedDiffLines: SelectedDiffLines
  /**
   * The selected diff row range
   */
  selectedDiffRowRange: LineRange | undefined
  /**
   * A function to update the selectedDiffRowRange
   */
  updateSelectedDiffRowRange: UpdateSelectedDiffRowRangeFnArgs
  /**
   * A function to clear the selectedDiffRowRange
   */
  clearSelectedDiffRowRange: () => void
  /**
   * A function to replace the selectedDiffRowRange from a LineRange
   */
  replaceSelectedDiffRowRange: (newLineRange: LineRange) => void
  /**
   * A function to replace the selectedDiffRowRange by selecting grid cells
   */
  replaceSelectedDiffRowRangeFromGridCells: ReplaceSelectedDiffRowRangeFromGridCellsFnArgs
  /**
   * A function to update the map of diffLines we store for navigation and potentially update the selected diffLines
   */
  updateDiffLines: (diffAnchor: string, diffLines: DiffLine[]) => void
  /**
   * Get the diff lines from the line range
   */
  getDiffLinesFromLineRange: (lineRange?: LineRange) =>
    | {
        selectedLeftLines: ClientDiffLine[]
        selectedRightLines?: ClientDiffLine[]
      }
    | undefined
  /**
   * Get the diff lines for a diff using the diff's diff anchor
   */
  getDiffLinesByDiffAnchor: (diffAnchor: string) => DiffLine[] | undefined
}

const SelectedDiffRowRange = createContext<SelectedDiffRowRangeContextData | null>(null)

export function useSelectedDiffRowRangeContext(): SelectedDiffRowRangeContextData {
  const contextData = useContext(SelectedDiffRowRange)
  if (!contextData) {
    throw new Error('useSelectedDiffRowRange must be used within a SelectedDiffRowRangeContext')
  }

  return contextData
}

/**
 * Announce the selected line range to screen readers
 */
function ariaAnnounceForLineRange(lineRange: LineRange) {
  const oneRowSelected =
    lineRange.startLineNumber === lineRange.endLineNumber && lineRange.startOrientation === lineRange.endOrientation
      ? true
      : false

  if (oneRowSelected) {
    announce(`${lineRange.startOrientation === 'left' ? 'L' : 'R'}${lineRange.startLineNumber} selected.`)
  } else {
    announce(
      `${lineRange.startOrientation === 'left' ? 'L' : 'R'}${lineRange.startLineNumber} to ${
        lineRange.endOrientation === 'left' ? 'L' : 'R'
      }${lineRange.endLineNumber} selected.`,
    )
  }
}

/**
 * Announce the selected range has been cleared
 */
function ariaAnnounceClearedSelection() {
  announce('Selection Cleared')
}

/**
 * Merge the line range with a new line.
 */
function getUpdatedLineRange(
  currentRange: LineRange | undefined,
  diffAnchor: DiffAnchor,
  lineNumber: number,
  orientation: 'left' | 'right',
  shiftKey?: boolean,
): LineRange {
  if (!shiftKey || !currentRange || currentRange.diffAnchor !== diffAnchor) {
    return {
      diffAnchor,
      endLineNumber: lineNumber,
      endOrientation: orientation,
      startLineNumber: lineNumber,
      startOrientation: orientation,
      firstSelectedLineNumber: lineNumber,
      firstSelectedOrientation: orientation,
    }
  }

  // new line in range is before first selected diff line in range
  if (lineNumber <= currentRange.firstSelectedLineNumber) {
    return {
      ...currentRange,
      startLineNumber: lineNumber,
      startOrientation: orientation,
      endLineNumber: currentRange.firstSelectedLineNumber,
      endOrientation: currentRange.firstSelectedOrientation,
    }
  }

  // new line in range is after first selected diff line in range
  return {
    ...currentRange,
    startLineNumber: currentRange.firstSelectedLineNumber,
    startOrientation: currentRange.firstSelectedOrientation,
    endLineNumber: lineNumber,
    endOrientation: orientation,
  }
}

export function SelectedDiffRowRangeContextProvider({children}: PropsWithChildren) {
  /**
   * Keep a map of diffAnchor => diffLines
   * Contains all of the diffs that include diffLines, updated when the diffLines are rendered
   */
  const diffLinesMap = useRef(new Map<string, DiffLine[]>())

  const getDiffLinesFromLineRange = useStableCallback(
    (
      diffRowRange?: LineRange,
    ): {selectedLeftLines: ClientDiffLine[]; selectedRightLines?: ClientDiffLine[]} | undefined => {
      if (!diffRowRange) return
      const selectedAnchor = diffRowRange.diffAnchor
      const linesToCheck = diffLinesMap.current.get(selectedAnchor)
      if (!linesToCheck) return

      const {leftLines, rightLines} = groupDiffLines(linesToCheck)

      return DiffRowSelectedChecker({selectedDiffRowRange: diffRowRange, leftLines, rightLines})
    },
  )

  const [selectedDiffRowRange, setSelectedDiffRowRange] = useState<LineRange | undefined>(() => {
    return parseLineRangeHash(ssrSafeLocation.hash)
  })

  const [selectedDiffLines, setSelectedDiffLines] = useState<{
    leftLines: ClientDiffLine[]
    rightLines: ClientDiffLine[]
  }>(() => {
    if (selectedDiffRowRange) {
      const diffLines = getDiffLinesFromLineRange(selectedDiffRowRange)
      if (diffLines) {
        return {leftLines: diffLines.selectedLeftLines, rightLines: diffLines.selectedRightLines || []}
      }
    }
    return {leftLines: [], rightLines: []}
  })

  const updateSelectedContextLines = useStableCallback((newLineRange?: LineRange) => {
    const newSelection = getDiffLinesFromLineRange(newLineRange)
    const newDiffLines = newSelection
      ? {leftLines: newSelection.selectedLeftLines, rightLines: newSelection.selectedRightLines || []}
      : {leftLines: [], rightLines: []}
    setSelectedDiffLines(newDiffLines)
  })

  const updateSelectedDiffRowRange = useStableCallback(
    (
      diffAnchor: DiffAnchor,
      lineNumber: number | null | undefined,
      orientation: 'left' | 'right' | undefined,
      shiftKey?: boolean,
    ) => {
      if (!lineNumber) return
      if (!orientation) return
      const newLineRange = getUpdatedLineRange(selectedDiffRowRange, diffAnchor, lineNumber, orientation, shiftKey)

      ariaAnnounceForLineRange(newLineRange)
      setSelectedDiffRowRange(newLineRange)
      updateSelectedContextLines(newLineRange)
      updateURLHashFromLineRange(newLineRange)
    },
  )

  const replaceSelectedDiffRowRange = useStableCallback((newLineRange: LineRange) => {
    ariaAnnounceForLineRange(newLineRange)
    setSelectedDiffRowRange(newLineRange)
    updateSelectedContextLines(newLineRange)
    updateURLHashFromLineRange(newLineRange)
  })

  const replaceSelectedDiffRowRangeFromGridCells = useStableCallback(
    ({
      diffAnchor,
      startGridCell,
      endGridCell,
      focusedGridCell,
    }: {
      diffAnchor: DiffAnchor
      startGridCell: GridCell
      endGridCell: GridCell
      focusedGridCell: GridCell
    }) => {
      replaceSelectedDiffRowRange({
        diffAnchor,
        endLineNumber: endGridCell.lineNumber as number,
        endOrientation: endGridCell.orientation as 'left' | 'right',
        firstSelectedLineNumber: focusedGridCell.lineNumber as number,
        firstSelectedOrientation: focusedGridCell.orientation as 'left' | 'right',
        startLineNumber: startGridCell.lineNumber as number,
        startOrientation: startGridCell.orientation as 'left' | 'right',
      })
    },
  )

  const clearSelectedDiffRowRange = useStableCallback(() => {
    if (!selectedDiffRowRange) return
    setSelectedDiffRowRange(undefined)
    updateSelectedContextLines(undefined)
    ariaAnnounceClearedSelection()

    // clear hash without causing scroll to jump to the top of the page
    history.replaceState({}, '', window.location.pathname + window.location.search)
  })

  const updateDiffLines = useStableCallback((diffAnchor: string, diffLines: DiffLine[]) => {
    diffLinesMap.current.set(diffAnchor, diffLines)
    if (selectedDiffRowRange?.diffAnchor === diffAnchor) {
      updateSelectedContextLines(selectedDiffRowRange)
    }
  })

  const getDiffLinesByDiffAnchor = useStableCallback((diffAnchor: string) => diffLinesMap.current.get(diffAnchor))

  const value = useMemo(
    () => ({
      selectedDiffRowRange,
      updateSelectedDiffRowRange,
      clearSelectedDiffRowRange,
      replaceSelectedDiffRowRange,
      replaceSelectedDiffRowRangeFromGridCells,
      updateDiffLines,
      selectedDiffLines,
      getDiffLinesFromLineRange,
      getDiffLinesByDiffAnchor,
    }),
    [
      selectedDiffRowRange,
      updateSelectedDiffRowRange,
      clearSelectedDiffRowRange,
      replaceSelectedDiffRowRange,
      replaceSelectedDiffRowRangeFromGridCells,
      selectedDiffLines,
      updateDiffLines,
      getDiffLinesFromLineRange,
      getDiffLinesByDiffAnchor,
    ],
  )

  return <SelectedDiffRowRange.Provider value={value}>{children}</SelectedDiffRowRange.Provider>
}
