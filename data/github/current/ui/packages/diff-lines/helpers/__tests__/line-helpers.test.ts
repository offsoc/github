import type {DiffAnchor} from '@github-ui/diffs/types'
import {isMacOS} from '@github-ui/get-os'

import {buildDiffLine} from '../../test-utils/query-data'
import {
  anchorLinkForSelection,
  calculateDiffLineCodeCellGutter,
  getKeyboardShortcutString,
  orderLineRange,
} from '../line-helpers'
import type {DiffLine, LineRange} from '../../types'

jest.mock('@github-ui/get-os')
const mockedIsMacOS = jest.mocked(isMacOS)
test('Out of order diff line range is correctly re-ordered', () => {
  const diffLine1: DiffLine = buildDiffLine({type: 'CONTEXT', blobLineNumber: 1, html: '', left: 1, right: 1})
  const diffLine2: DiffLine = buildDiffLine({type: 'CONTEXT', blobLineNumber: 2, html: '', left: 2, right: 2})
  const diffLines = [diffLine1, diffLine2]
  const lineRange: LineRange = {
    diffAnchor: 'diff',
    startOrientation: 'right',
    startLineNumber: 2,
    endOrientation: 'right',
    endLineNumber: 1,
    firstSelectedLineNumber: 2,
    firstSelectedOrientation: 'right',
  }

  const reorderedRange = orderLineRange(lineRange, diffLines)
  expect(reorderedRange?.startLineNumber).toBe(1)
  expect(reorderedRange?.endLineNumber).toBe(2)
  expect(reorderedRange?.firstSelectedLineNumber).toBe(1)
})

test('Correctly ordered diff line is returned unchanged', () => {
  const diffLine1: DiffLine = buildDiffLine({type: 'CONTEXT', blobLineNumber: 1, html: '', left: 1, right: 1})
  const diffLine2: DiffLine = buildDiffLine({type: 'CONTEXT', blobLineNumber: 2, html: '', left: 2, right: 2})
  const diffLines = [diffLine1, diffLine2]
  const lineRange: LineRange = {
    diffAnchor: 'diff',
    startOrientation: 'right',
    startLineNumber: 1,
    endOrientation: 'right',
    endLineNumber: 2,
    firstSelectedLineNumber: 1,
    firstSelectedOrientation: 'right',
  }

  const reorderedRange = orderLineRange(lineRange, diffLines)
  expect(reorderedRange?.startLineNumber).toBe(1)
  expect(reorderedRange?.endLineNumber).toBe(2)
  expect(reorderedRange?.firstSelectedLineNumber).toBe(1)
})

describe('anchorLinkForSelection', () => {
  test('returns the link to a range when one is given', () => {
    const range: LineRange = {
      diffAnchor: 'diff-anchor',
      endLineNumber: 5,
      endOrientation: 'right',
      startLineNumber: 1,
      startOrientation: 'left',
      firstSelectedOrientation: 'left',
      firstSelectedLineNumber: 1,
    }

    const result = anchorLinkForSelection({range, fileAnchor: range.diffAnchor as DiffAnchor})

    expect(result).toEqual('http://localhost/#diff-anchorL1-R5')
  })

  test('returns the link to a line when given a file and line but no range', () => {
    const diffLine = buildDiffLine({left: 1, right: 2, type: 'ADDITION'})

    const result = anchorLinkForSelection({line: diffLine, fileAnchor: 'diff-anchor' as DiffAnchor})

    expect(result).toEqual('http://localhost/#diff-anchorR2')
  })

  test('returns empty string if a file anchor is given without a line', () => {
    const result = anchorLinkForSelection({fileAnchor: 'diff-anchor' as DiffAnchor})

    expect(result).not.toBeDefined()
  })
})

describe('getKeyboardShortcutString for Mac', () => {
  beforeEach(() => {
    mockedIsMacOS.mockReturnValue(true)
  })
  test('Keyboard shortcut includes Control key by default', () => {
    const shortcutString = getKeyboardShortcutString({key: 'A'})
    const expectedString = '⌘A'

    expect(shortcutString).toBe(expectedString)

    const shortcutStringNoControl = getKeyboardShortcutString({key: 'A', includeControlKey: false})
    const expectedStringNoControl = 'A'
    expect(shortcutStringNoControl).toBe(expectedStringNoControl)
  })

  test('Keyboard shortcut with Shift key is generated correctly', () => {
    const shortcutString = getKeyboardShortcutString({key: 'A', includeShiftKey: true})
    const expectedString = '⌘⇧A'

    expect(shortcutString).toBe(expectedString)
  })

  test('Keyboard shortcut with Option key is generated correctly', () => {
    const shortcutString = getKeyboardShortcutString({key: 'A', includeOptionKey: true})
    const expectedString = '⌘⌥A'

    expect(shortcutString).toBe(expectedString)
  })
})

describe('getKeyboardShortcutString for Windows', () => {
  beforeEach(() => {
    mockedIsMacOS.mockReturnValue(false)
  })

  test('Keyboard shortcut includes Control key by default', () => {
    const shortcutString = getKeyboardShortcutString({key: 'A'})
    const expectedString = 'Ctrl + A'

    expect(shortcutString).toBe(expectedString)

    const shortcutStringNoControl = getKeyboardShortcutString({key: 'A', includeControlKey: false})
    const expectedStringNoControl = 'A'
    expect(shortcutStringNoControl).toBe(expectedStringNoControl)
  })

  test('Keyboard shortcut with Shift key is generated correctly', () => {
    const shortcutString = getKeyboardShortcutString({key: 'A', includeShiftKey: true})
    const expectedString = 'Ctrl + Shift + A'

    expect(shortcutString).toBe(expectedString)
  })

  test('Keyboard shortcut with Option key is generated correctly', () => {
    const shortcutString = getKeyboardShortcutString({key: 'A', includeOptionKey: true})
    const expectedString = 'Ctrl + Alt + A'

    expect(shortcutString).toBe(expectedString)
  })
})

describe('calculateDiffLineCodeCellGutter', () => {
  test('when hasThreads is false, it returns 30px', () => {
    expect(calculateDiffLineCodeCellGutter({hasThreads: false})).toEqual('30px')
  })

  test('when hasThreads is true, it returns 96px', () => {
    expect(calculateDiffLineCodeCellGutter({hasThreads: true})).toEqual('96px')
  })
})
