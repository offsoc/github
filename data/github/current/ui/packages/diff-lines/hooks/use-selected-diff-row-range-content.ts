import {useSelectedDiffRowRangeContext} from '../contexts/SelectedDiffRowRangeContext'
import {getContentFromLines} from '../helpers/line-helpers'

export function useSelectedDiffRowRangeContent(diffAnchor: string): {
  getUnifiedDiffLineCode: () => string
  getSplitDiffSingleLineCode: (side: 'left' | 'right' | undefined, lineNumber: number | null | undefined) => string
  getSplitDiffMultiLineCode: (side: 'left' | 'right' | undefined) => string
} {
  const {selectedDiffRowRange, selectedDiffLines, getDiffLinesByDiffAnchor} = useSelectedDiffRowRangeContext()

  const getUnifiedDiffLineCode = () => {
    const diffLines = getDiffLinesByDiffAnchor(diffAnchor)
    if (!diffLines || !selectedDiffRowRange) return ''

    const {startOrientation, endOrientation, startLineNumber, endLineNumber} = selectedDiffRowRange

    let firstLineIndex = 0
    let secondLineIndex = 0

    // We only need to search for new first and end indexes if there is more than one diffline.
    if (diffLines.length > 1) {
      firstLineIndex = diffLines.findIndex(line =>
        startOrientation === 'left' ? line.left === startLineNumber : line.right === startLineNumber,
      )
      secondLineIndex = diffLines.findIndex(line =>
        endOrientation === 'left' ? line.left === endLineNumber : line.right === endLineNumber,
      )
    }

    return getContentFromLines(diffLines.slice(firstLineIndex, secondLineIndex + 1))
  }

  const getSplitDiffSingleLineCode = (side: 'left' | 'right' | undefined, lineNumber: number | null | undefined) => {
    if (!side || !lineNumber) return ''

    const diffLine = getDiffLinesByDiffAnchor(diffAnchor)?.find(line =>
      side === 'left' ? line.left === lineNumber : line.right === lineNumber,
    )
    if (!diffLine) return ''

    return getContentFromLines([diffLine])
  }

  const getSplitDiffMultiLineCode = (side: 'left' | 'right' | undefined) => {
    if (side === undefined) return ''
    return side === 'left'
      ? getContentFromLines(selectedDiffLines.leftLines)
      : getContentFromLines(selectedDiffLines.rightLines)
  }

  return {getUnifiedDiffLineCode, getSplitDiffSingleLineCode, getSplitDiffMultiLineCode}
}
