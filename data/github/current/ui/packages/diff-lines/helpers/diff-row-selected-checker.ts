import {lineOrientationFrom} from '@github-ui/diffs/diff-line-helpers'
import type {LineRange, ClientDiffLine, DiffLine} from '../types'
import {matchLine, isEmptyDiffLine} from './line-helpers'

type DiffRowSelectedCheckerReturn = {
  isRowSelected: (line: ClientDiffLine) => boolean
  selectedLeftLines: ClientDiffLine[]
  selectedRightLines: ClientDiffLine[]
}

/**
 * From the line range, get the corresponding difflines from the provided left and right diffLines
 */
export default function DiffRowSelectedChecker({
  selectedDiffRowRange,
  leftLines,
  rightLines,
}: {
  selectedDiffRowRange: LineRange
  leftLines: ClientDiffLine[]
  rightLines?: ClientDiffLine[]
}): DiffRowSelectedCheckerReturn {
  const isSplit = !!rightLines
  const {startOrientation, endOrientation} = selectedDiffRowRange

  // There is no reason to return selected data and run calculations if the selectedDiffRowRange is only on one cell.
  if (
    selectedDiffRowRange.startLineNumber === selectedDiffRowRange.endLineNumber &&
    selectedDiffRowRange.startOrientation === selectedDiffRowRange.endOrientation
  ) {
    return {
      isRowSelected: () => false,
      selectedRightLines: [],
      selectedLeftLines: [],
    }
  }

  const firstLineIndex = getLines(startOrientation).findIndex(line =>
    matchLine(line, selectedDiffRowRange.startLineNumber, selectedDiffRowRange.startOrientation),
  )
  const lastLineIndex = getLines(endOrientation).findIndex(line =>
    matchLine(line, selectedDiffRowRange.endLineNumber, selectedDiffRowRange.endOrientation),
  )

  const canHighlight = firstLineIndex >= 0 && lastLineIndex >= 0

  function isRowSelected(line: ClientDiffLine): boolean {
    if (!canHighlight || isEmptyDiffLine(line)) return false

    const lineIndex = getLines(lineOrientationFrom(line.type)).indexOf(line)

    // check if the line falls between the start and end highlighting index
    return lineIndex >= firstLineIndex && lineIndex <= lastLineIndex
  }

  function getLines(orientation: 'left' | 'right') {
    return !isSplit || isLeftLine(orientation) ? leftLines : rightLines
  }

  const selectedLeftLines = getLines('left').filter(line => isRowSelected(line))
  const selectedRightLines = getLines('right').filter(line => isRowSelected(line))

  return {
    isRowSelected,
    selectedRightLines,
    selectedLeftLines,
  }
}

function isLeftLine(line: DiffLine): boolean
function isLeftLine(line: 'left' | 'right'): boolean
function isLeftLine(line: DiffLine | 'left' | 'right'): boolean {
  const orientation = typeof line === 'string' ? line : lineOrientationFrom(line.type)
  return orientation === 'left'
}
