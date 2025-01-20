import {lineOrientationFrom} from '@github-ui/diffs/diff-line-helpers'
import type {DiffAnchor, DiffLineType, SimpleDiffLine} from '@github-ui/diffs/types'
import {isMacOS} from '@github-ui/get-os'

import type {DiffLine, ClientDiffLine, LineRange, EmptyDiffLine} from '../types'
import type {SelectedDiffLines} from '../contexts/SelectedDiffRowRangeContext'
import {EMPTY_DIFF_LINE} from '../types'
import {urlHashFromLineRange} from './document-hash-helpers'

export type OutdatedDiffLine = Omit<DiffLine, 'threads' | 'blobLineNumber'>

export type DiffSide = 'LEFT' | 'RIGHT'

export function matchLine(
  line: ClientDiffLine,
  lineNumber: number | undefined,
  orientation: 'left' | 'right' | undefined,
): boolean {
  switch (orientation) {
    case 'left':
      return !isEmptyDiffLine(line) && line.left === lineNumber
    case 'right':
    default:
      return !isEmptyDiffLine(line) && lineOrientationFrom(line.type) === orientation && line.right === lineNumber
  }
}

/**
 * Compare a line range to a list of lines. If the start of the range comes after the end, we'll flip it and return
 * a new range with the correct ordering.
 */
export function orderLineRange(
  lineRange: LineRange | undefined,
  lines: Array<DiffLine | null> | null,
): LineRange | undefined {
  if (!lineRange) return undefined
  if (!lines) return lineRange

  let outOfOrder = false
  let foundStart = false
  let foundEnd = false
  for (const line of lines) {
    if (!line) continue

    foundStart ||= matchLine(line, lineRange.startLineNumber, lineRange.startOrientation)
    foundEnd ||= matchLine(line, lineRange.endLineNumber, lineRange.endOrientation)
    outOfOrder = foundEnd && !foundStart
    if (outOfOrder || (foundStart && foundEnd)) break
  }

  if (outOfOrder) {
    return {
      ...lineRange,
      startLineNumber: lineRange.endLineNumber,
      startOrientation: lineRange.endOrientation,
      endLineNumber: lineRange.startLineNumber,
      endOrientation: lineRange.startOrientation,
      firstSelectedLineNumber: lineRange.endLineNumber,
    }
  } else {
    return lineRange
  }
}

export function rowIdFrom(fileAnchor: string, leftLine: ClientDiffLine, rightLine?: ClientDiffLine) {
  const leftLinePart = `-${isEmptyDiffLine(leftLine) || typeof leftLine.left !== 'number' ? 'empty' : leftLine.left}`
  const rightLinePart = rightLine
    ? `-${isEmptyDiffLine(rightLine) || typeof rightLine.right !== 'number' ? 'empty' : rightLine.right}`
    : ''

  return `${fileAnchor}${leftLinePart}${rightLinePart}`
}

export function cellIdFrom(rowId: string, columnIndex: number) {
  return `${rowId}-${columnIndex}`
}

export function isEmptyDiffLine(diffLine?: ClientDiffLine): diffLine is EmptyDiffLine {
  return !!diffLine && diffLine === EMPTY_DIFF_LINE
}

export function isDiffLine(diffLine?: ClientDiffLine): diffLine is DiffLine {
  return !!diffLine && diffLine !== EMPTY_DIFF_LINE
}

export function isContextDiffLine(diffLine: DiffLine): boolean {
  return diffLine.type === 'CONTEXT'
}

export function trimContentLine(lineHtml: string, lineType: DiffLineType): [lineHtml: string, removedChar?: string] {
  let charToRemove: string | undefined

  // the lines returned by the server get prepended by a character depending on its type
  switch (lineType) {
    case 'ADDITION':
      charToRemove = '+'
      break
    case 'DELETION':
      charToRemove = '-'
      break
    case 'CONTEXT':
    case 'INJECTED_CONTEXT':
      charToRemove = ' '
      break
  }

  if (!charToRemove || !lineHtml.startsWith(charToRemove)) return [lineHtml, undefined]

  const removedChar = lineHtml[0]
  const newHtml = lineHtml.substring(1)
  return [newHtml, removedChar]
}

export function groupDiffLines(lines: DiffLine[]): {
  leftLines: ClientDiffLine[]
  rightLines: ClientDiffLine[]
} {
  const leftLines: ClientDiffLine[] = []
  const rightLines: ClientDiffLine[] = []

  // Keep list of lines even, filling in blanks as needed
  const fillBlanks = () => {
    while (leftLines.length < rightLines.length) {
      leftLines.push(EMPTY_DIFF_LINE)
    }

    while (rightLines.length < leftLines.length) {
      rightLines.push(EMPTY_DIFF_LINE)
    }
  }

  for (const line of lines) {
    switch (line.type) {
      case 'ADDITION':
        rightLines.push(line)
        break
      case 'DELETION':
        leftLines.push(line)
        break
      case 'CONTEXT':
      case 'INJECTED_CONTEXT':
      case 'HUNK':
        fillBlanks()
        leftLines.push(line)
        rightLines.push(line)
    }
  }

  fillBlanks()

  return {leftLines, rightLines}
}

export function parseHtml(html: string) {
  return new DOMParser().parseFromString(html, 'text/html').documentElement.textContent || ''
}

export function isLeftLine(line: SimpleDiffLine) {
  const leftLineTypes = ['HUNK', 'CONTEXT', 'INJECTED_CONTEXT', 'DELETION']

  return leftLineTypes.includes(line.type)
}

export function urlHashFromLine(line: SimpleDiffLine, fileAnchor: string): string | undefined {
  const leftLine = isLeftLine(line)
  const lineNumber = leftLine ? line.left : line.right
  const orientation = leftLine ? 'left' : 'right'

  if (lineNumber !== null) {
    return urlHashFromLineRange({
      diffAnchor: fileAnchor,
      endLineNumber: lineNumber,
      endOrientation: orientation,
      startLineNumber: lineNumber,
      startOrientation: orientation,
      firstSelectedLineNumber: lineNumber,
      firstSelectedOrientation: orientation,
    })
  }

  return
}

// Get the link for a line or a selected range of lines
export function anchorLinkForSelection({
  line,
  range,
  fileAnchor,
}: {
  line?: SimpleDiffLine
  range?: LineRange
  fileAnchor: DiffAnchor
}): string | undefined {
  const {origin, pathname} = window.location
  let hash
  if (range) {
    hash = urlHashFromLineRange(range)
  } else if (line) {
    hash = urlHashFromLine(line, fileAnchor)
  }

  if (!hash) return

  return `${origin}${pathname}#${hash}`
}

export type KeyboardShortcutArgs = {
  includeControlKey?: boolean
  includeShiftKey?: boolean
  includeOptionKey?: boolean
  key: string
}

/**
 * Returns a string representing a keyboard shortcut, including the Control key by default. Adds formatting for specific OS (MacOS vs Windows) so it looks a little nicer.
 * @param includeControlKey Whether to include the Control key in the shortcut string. Defaults to true.
 * @param includeShiftKey Whether to include the Shift key in the shortcut string. Defaults to false.
 * @param includeOptionKey Whether to include the Option key in the shortcut string. Defaults to false.
 * @param key The key to include in the shortcut string.
 */
export function getKeyboardShortcutString({
  includeControlKey = true,
  includeShiftKey,
  includeOptionKey,
  key,
}: KeyboardShortcutArgs) {
  let str = includeControlKey ? `${isMacOS() ? '⌘' : 'Ctrl + '}` : ''
  if (includeOptionKey) str += `${isMacOS() ? '⌥' : 'Alt + '}`
  if (includeShiftKey) str += `${isMacOS() ? '⇧' : 'Shift + '}`
  str += key
  return str
}

/**
 * Returns a string representing the pixel width of a gutter to account for the CommentIndicator and ActionBar components to render without overlapping over the code content.
 * This will default to 96px if there is a thread count of 1 or more.
 * This does not account for number of author avatars, but will render the necessary amount of space for 3 avatar icons stacked in the CommentIndicator and ActionBar components.
 * @param hasThreads A boolean that indicates if the diff line has any associated threads.
 */
export function calculateDiffLineCodeCellGutter({hasThreads}: {hasThreads: boolean}) {
  return hasThreads ? '96px' : '30px'
}

/**
 * Returns a string representing the right positioning pixel value of the line's comment indicator.
 * @param shouldAlignRight A boolean that indicates if a diff line should show the marker to the very right
 * e.g. if it has an associated draft comment or if the user is unable to comment on that line,
 * which happens for annotations on unchanged lines
 */
export function calculateCommentIndicatorRightPositioning({shouldAlignRight}: {shouldAlignRight: boolean}) {
  return shouldAlignRight ? '11px' : '40px'
}

/**
 * Returns a string representing a valid aria-keyshortcuts value, including OS specific keys.
 * @param includeControlKey Whether to include the Control key in the shortcut string. Defaults to true.
 * @param includeShiftKey Whether to include the Shift key in the shortcut string. Defaults to false.
 * @param includeOptionKey Whether to include the Option key in the shortcut string. Defaults to false.
 * @param key The key to include in the shortcut string.
 */
export function getAriaKeyShortcutString({
  includeControlKey = true,
  includeShiftKey,
  includeOptionKey,
  key,
}: KeyboardShortcutArgs) {
  let str = ''
  if (includeControlKey) str += isMacOS() ? 'Command+' : 'Control+'
  if (includeOptionKey) str += isMacOS() ? 'Option+' : 'Alt+'
  if (includeShiftKey) str += 'Shift+'
  str += key
  return str
}

const LINE_TYPES_SUPPORTING_COMMENTS = ['ADDITION', 'DELETION', 'CONTEXT']

/**
 * Detemines if the given diff line supports commenting. If the diff line is part of the current selected
 * range then all lines must be commentable for the diff line to be displayed as commentable.
 * @param diffLine The current diff line being rendered
 * @param selectedDiffLines The left and right diff lines that are currently selected, if any
 */
export const lineAcceptsComments = (
  diffLine: ClientDiffLine | undefined,
  selectedDiffLines: SelectedDiffLines,
): boolean => {
  if (!diffLine) return false

  const selectedLines = selectedDiffLines.leftLines.concat(selectedDiffLines.rightLines)
  if (selectedLines.length > 0 && selectedLines.includes(diffLine)) {
    // current line is within selected range - are all lines commentable?
    return selectedLines.every(line => {
      return !isEmptyDiffLine(line) && LINE_TYPES_SUPPORTING_COMMENTS.includes(line.type)
    })
  } else {
    // selection not applicable - does this line alone support commenting?
    return !isEmptyDiffLine(diffLine) && LINE_TYPES_SUPPORTING_COMMENTS.includes(diffLine.type)
  }
}

/**
 * Returns the text content from the given diffLines as a single string
 */
export const getContentFromLines = (lines?: ClientDiffLine[]): string => {
  if (!lines) return ''
  const content = lines
    .filter((line): line is DiffLine => !isEmptyDiffLine(line))
    .map(line => {
      const parsedContent = parseHtml(line.html)
      const [trimmedContent] = trimContentLine(parsedContent, line.type)
      return trimmedContent
    })

  return content.join('\n')
}
