import type {DiffLineType, SimpleDiffLine} from './types'

/**
 * Prefix the line anchor to prevent the browser from jumping to the element when we update the hash.
 */
export function lineIdentifierFrom(anchor: string) {
  return `line-${anchor}`
}

/**
 * Returns the line anchor based on the file anchor, orientation, and line number
 */
export function lineAnchorFrom(fileAnchor: string, orientation: 'left' | 'right', lineNumber: number) {
  return `${fileAnchor}${orientation === 'left' ? 'L' : 'R'}${lineNumber}`
}

/**
 * Returns the line orientation from the diff line type
 */
export function lineOrientationFrom(type: DiffLineType) {
  return type === 'DELETION' ? 'left' : 'right'
}

/**
 * Returns the background color based on the line type
 */
export function getBackgroundColor(
  lineType: DiffLineType,
  isNumber = false,
  isHighlighted = false,
): string | undefined {
  if (isHighlighted) return 'var(--bgColor-attention-muted, var(--color-attention-subtle))'

  switch (lineType) {
    case 'ADDITION':
      return isNumber
        ? 'var(--diffBlob-addition-bgColor-num, var(--color-diff-blob-addition-num-bg))'
        : 'var(--diffBlob-addition-bgColor-line, var(--color-diff-blob-addition-line-bg))'
    case 'DELETION':
      return isNumber
        ? 'var(--diffBlob-deletion-bgColor-num, var(--color-diff-blob-deletion-num-bg))'
        : 'var(--diffBlob-deletion-bgColor-line, var(--color-diff-blob-deletion-line-bg))'
    case 'HUNK':
      return isNumber
        ? 'var(--diffBlob-hunk-bgColor-num, var(--color-diff-blob-hunk-num-bg))'
        : 'var(--bgColor-accent-muted, var(--color-accent-subtle))'
    case 'EMPTY':
      return isNumber
        ? 'var(--diffBlob-hunk-bgColor-num, var(--color-diff-blob-hunk-num-bg))'
        : 'var(--bgColor-accent-muted, var(--color-accent-subtle))'
    default:
      return undefined
  }
}

/**
 * Get the largest line number, then return the width of the line number column using it
 */
export function getLineNumberWidth(lines: Array<SimpleDiffLine | null> | null): string {
  let maxLineNumber = 0
  if (lines) {
    for (const line of lines) {
      maxLineNumber = Math.max(maxLineNumber, line?.left ?? 0, line?.right ?? 0)
    }
  }

  // 8 pixels per character plus 20 for horizontal padding
  const lineNumberPxWidth = maxLineNumber.toString().length * 8 + 20
  return Math.max(lineNumberPxWidth, 40).toString()
}
