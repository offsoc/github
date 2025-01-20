function lineMarker(side: string) {
  if (side === 'LEFT') {
    return '-'
  }
  if (side === 'RIGHT') {
    return '+'
  }
  return ''
}

/**
 * Returns a string representing the original location of the thread within the diff
 * @returns String
 */
export function threadLineLocation({
  startDiffSide,
  endDiffSide,
  originalStartLine,
  originalEndLine,
}: {
  startDiffSide: string | null | undefined
  endDiffSide: string | null | undefined
  originalStartLine: number | null | undefined
  originalEndLine: number | null | undefined
}) {
  // Don't try to calculate the location in this unlikely case
  if (!startDiffSide || !endDiffSide || typeof originalStartLine !== 'number' || typeof originalEndLine !== 'number') {
    return ''
  }

  // Handle the bug on the first line of a file that spans both sides
  if (originalStartLine === 0 && originalEndLine === 1 && startDiffSide === endDiffSide) {
    return `-1 to +1`
  }

  // Comment on single line, same side
  if (startDiffSide === endDiffSide && originalStartLine === originalEndLine) {
    return `${lineMarker(startDiffSide)}${originalStartLine}`
  } else {
    return `${lineMarker(startDiffSide)}${originalStartLine} to ${lineMarker(endDiffSide)}${originalEndLine}`
  }
}
