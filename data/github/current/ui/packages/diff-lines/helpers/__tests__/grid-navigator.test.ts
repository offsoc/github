import type {DiffLineType} from '@github-ui/diffs/types'

import {GridNavigator} from '../grid-navigator'
import type {EmptyDiffLine} from '../../types'

const fileAnchor = 'mock-file-anchor'

function makeLine({
  left,
  right,
  blobLineNumber,
  type,
  html,
}: {
  left: number | null
  right: number | null
  blobLineNumber: number
  type: DiffLineType
  html: string
}) {
  return {
    __id: 'mock',
    left,
    right,
    blobLineNumber,
    activeThreadId: null,
    type,
    html,
    text: html,
    threadSummary: {totalCommentsCount: 0},
  }
}

function createSplitGrid() {
  const isSplitDiff = true
  const leftLines = [
    makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'line 1'}),
    makeLine({left: 2, right: 2, blobLineNumber: 2, type: 'CONTEXT', html: 'line 2'}),
    makeLine({left: 3, right: 3, blobLineNumber: 3, type: 'CONTEXT', html: 'line 3'}),
    makeLine({left: 4, right: 4, blobLineNumber: 4, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 5, right: 5, blobLineNumber: 5, type: 'CONTEXT', html: 'line 5'}),
    makeLine({left: 6, right: 6, blobLineNumber: 6, type: 'CONTEXT', html: 'line 6'}),
  ]

  const rightLines = [
    makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'line 1'}),
    makeLine({left: 2, right: 2, blobLineNumber: 2, type: 'CONTEXT', html: 'line 2'}),
    makeLine({left: 3, right: 3, blobLineNumber: 3, type: 'CONTEXT', html: 'line 3'}),
    makeLine({left: 4, right: 4, blobLineNumber: 4, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 5, right: 5, blobLineNumber: 5, type: 'CONTEXT', html: 'line 5'}),
    makeLine({left: 6, right: 6, blobLineNumber: 6, type: 'CONTEXT', html: 'line 6'}),
  ]

  return new GridNavigator(fileAnchor, isSplitDiff, leftLines, rightLines)
}

function createUnifiedGrid() {
  const isSplitDiff = false
  const lines = [
    makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'line 1'}),
    makeLine({left: 2, right: 2, blobLineNumber: 2, type: 'CONTEXT', html: 'line 2'}),
    makeLine({left: 3, right: 3, blobLineNumber: 3, type: 'CONTEXT', html: 'line 3'}),
    makeLine({left: 4, right: 4, blobLineNumber: 4, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 5, right: 5, blobLineNumber: 5, type: 'CONTEXT', html: 'line 5'}),
    makeLine({left: 6, right: 6, blobLineNumber: 6, type: 'CONTEXT', html: 'line 6'}),
  ]

  return new GridNavigator(fileAnchor, isSplitDiff, lines)
}

function createGridWithEmptyLines() {
  const isSplitDiff = true
  const leftLines = [
    makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'original 1'}),
    makeLine({left: 2, right: 2, blobLineNumber: 2, type: 'CONTEXT', html: 'original 2'}),
    'empty-diff-line' as EmptyDiffLine,
    makeLine({left: 3, right: 4, blobLineNumber: 4, type: 'CONTEXT', html: 'original 3'}),
    makeLine({left: 4, right: 4, blobLineNumber: 5, type: 'CONTEXT', html: 'original 4'}),
    makeLine({left: 5, right: 5, blobLineNumber: 6, type: 'CONTEXT', html: 'original 4'}),
    makeLine({left: 6, right: 6, blobLineNumber: 7, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 25, right: 25, blobLineNumber: 25, type: 'CONTEXT', html: 'original 25'}),
  ]

  const rightLines = [
    makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'modified 1'}),
    makeLine({left: 2, right: 2, blobLineNumber: 2, type: 'CONTEXT', html: 'modified 2'}),
    makeLine({left: 2, right: 3, blobLineNumber: 3, type: 'CONTEXT', html: 'modified 3'}),
    makeLine({left: 3, right: 4, blobLineNumber: 4, type: 'CONTEXT', html: 'modified 4'}),
    'empty-diff-line' as EmptyDiffLine,
    makeLine({left: 5, right: 5, blobLineNumber: 6, type: 'CONTEXT', html: 'modified 5'}),
    makeLine({left: 6, right: 6, blobLineNumber: 7, type: 'HUNK', html: 'hunk header'}),
    makeLine({left: 25, right: 25, blobLineNumber: 25, type: 'CONTEXT', html: 'modified 25'}),
  ]

  return new GridNavigator(fileAnchor, isSplitDiff, leftLines, rightLines)
}

describe('initialization', () => {
  test('Split grid initializes with the first row and column selected', () => {
    const navigator = createSplitGrid()
    expect(navigator.focusedGridCell).toEqual({
      isEmpty: false,
      lineNumber: undefined,
      orientation: undefined,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
  })

  test('Unified grid initializes with the first row and column selected', () => {
    const navigator = createUnifiedGrid()
    expect(navigator.focusedGridCell).toEqual({
      isEmpty: false,
      lineNumber: undefined,
      orientation: undefined,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
  })
})

describe('Arrow key navigation', () => {
  test('Arrow keys navigate the split grid', () => {
    const navigator = createSplitGrid()

    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 2,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-2-2-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowRight')).toEqual({
      isEmpty: false,
      lineNumber: 2,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-2-2-1',
      columnIndex: 1,
    })
    expect(navigator.moveToNextItem('ArrowLeft')).toEqual({
      isEmpty: false,
      lineNumber: 2,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-2-2-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowUp')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
  })

  test('Arrow keys navigate the unified grid', () => {
    const navigator = createUnifiedGrid()

    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 2,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-2-2-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowRight')).toEqual({
      isEmpty: false,
      lineNumber: 2,
      orientation: 'right',
      isHunk: false,
      cellId: 'mock-file-anchor-2-2-1',
      columnIndex: 1,
    })
    expect(navigator.moveToNextItem('ArrowLeft')).toEqual({
      isEmpty: false,
      lineNumber: 2,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-2-2-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowUp')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
  })

  test('Grid position does not change when navigating on the edge the split grid', () => {
    const navigator = createSplitGrid()

    expect(navigator.moveToNextItem('ArrowUp')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowRight')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowLeft')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
  })

  test('Grid position does not change when navigating on the edge the unified grid', () => {
    const navigator = createUnifiedGrid()

    expect(navigator.moveToNextItem('ArrowUp')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowRight')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowLeft')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
  })

  test('Navigating into a hunk row then back out maintains column index', () => {
    const navigator = createSplitGrid()

    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })

    navigator.moveToNextItem('ArrowRight')
    navigator.moveToNextItem('ArrowRight')

    expect(navigator.moveToNextItem('ArrowRight')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'right',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-3',
      columnIndex: 3,
    })

    expect(navigator.moveToNextItem('ArrowUp')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })

    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'right',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-3',
      columnIndex: 3,
    })
  })
})

describe('Page up and page down navigation', () => {
  test('Page down navigates to the next hunk header of a split grid', () => {
    const navigator = createSplitGrid()

    expect(navigator.moveToNextItem('PageDown')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-4-4-0',
      columnIndex: 0,
    })
  })

  test('Page down navigates to the next hunk header of a unified grid', () => {
    const navigator = createUnifiedGrid()

    expect(navigator.moveToNextItem('PageDown')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-4-4-0',
      columnIndex: 0,
    })
  })

  test('Page up navigates to the previous hunk header of a split grid', () => {
    const navigator = createSplitGrid()
    navigator.moveToNextItem('PageDown')
    navigator.moveToNextItem('PageDown')

    expect(navigator.moveToNextItem('PageUp')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-4-4-0',
      columnIndex: 0,
    })

    expect(navigator.moveToNextItem('PageUp')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
  })

  test('Page up navigates to the previous hunk header of a unified grid', () => {
    const navigator = createUnifiedGrid()
    navigator.moveToNextItem('PageDown')
    navigator.moveToNextItem('PageDown')

    expect(navigator.moveToNextItem('PageUp')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-4-4-0',
      columnIndex: 0,
    })

    expect(navigator.moveToNextItem('PageUp')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
  })

  test('maintains column index of a split grid', () => {
    const navigator = createSplitGrid()
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowRight')

    expect(navigator.moveToNextItem('PageDown')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-4-4-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 5,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-5-5-1',
      columnIndex: 1,
    })
  })

  test('maintains column index of a unified grid', () => {
    const navigator = createUnifiedGrid()
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowRight')

    expect(navigator.moveToNextItem('PageDown')).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-4-4-0',
      columnIndex: 0,
    })
    expect(navigator.moveToNextItem('ArrowDown')).toEqual({
      isEmpty: false,
      lineNumber: 5,
      orientation: 'right',
      isHunk: false,
      cellId: 'mock-file-anchor-5-5-1',
      columnIndex: 1,
    })
  })
})

describe('Home and end navigation', () => {
  test('Home navigates to the first cell in the row in a split grid', () => {
    const navigator = createSplitGrid()
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowRight')
    const nextItem = navigator.moveToNextItem('ArrowRight')
    expect(nextItem).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'right',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-2',
      columnIndex: 2,
    })

    expect(navigator.moveToNextItem('Home')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
  })

  test('Home navigates to the first cell in the row in a unified grid', () => {
    const navigator = createUnifiedGrid()
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowRight')
    const nextItem = navigator.moveToNextItem('ArrowRight')
    expect(nextItem).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'right',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-2',
      columnIndex: 2,
    })

    expect(navigator.moveToNextItem('Home')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'left',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
    })
  })

  test('End navigates to the last cell in the row of a split grid', () => {
    const navigator = createSplitGrid()
    navigator.moveToNextItem('ArrowDown')

    expect(navigator.moveToNextItem('End')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'right',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-3',
      columnIndex: 3,
    })
  })

  test('End navigates to the last cell in the row of a unified grid', () => {
    const navigator = createUnifiedGrid()
    navigator.moveToNextItem('ArrowDown')

    expect(navigator.moveToNextItem('End')).toEqual({
      isEmpty: false,
      lineNumber: 1,
      orientation: 'right',
      isHunk: false,
      cellId: 'mock-file-anchor-1-1-2',
      columnIndex: 2,
    })
  })
})

describe('Ctrl + home and ctrl + end navigation', () => {
  test('Ctrl + home navigates to the first table cell in the first row in a split grid', () => {
    const navigator = createSplitGrid()
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowRight')

    expect(navigator.moveToNextItem('Home', true)).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
  })

  test('Ctrl + home navigates to the first table cell in the first row in a unified grid', () => {
    const navigator = createUnifiedGrid()
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowRight')

    expect(navigator.moveToNextItem('Home', true)).toEqual({
      isEmpty: false,
      isHunk: true,
      cellId: 'mock-file-anchor-0-0-0',
      columnIndex: 0,
    })
  })

  test('Ctrl + end navigates to the last cell in the row for a split grid', () => {
    const navigator = createSplitGrid()
    const nextItem = navigator.moveToNextItem('End', true)
    expect(nextItem).toEqual({
      cellId: 'mock-file-anchor-6-6-3',
      columnIndex: 3,
      isEmpty: false,
      isHunk: false,
      lineNumber: 6,
      orientation: 'right',
    })
  })

  test('Ctrl + end navigates to the last cell in the row for a unified grid', () => {
    const navigator = createUnifiedGrid()
    const nextItem = navigator.moveToNextItem('End', true)
    expect(nextItem).toEqual({
      cellId: 'mock-file-anchor-6-6-2',
      columnIndex: 2,
      isEmpty: false,
      isHunk: false,
      lineNumber: 6,
      orientation: 'right',
    })
  })
})

describe('getNextSelectableCell', () => {
  describe('split diff view', () => {
    describe('when orientation is left diff side', () => {
      describe('when the next code row has a line number', () => {
        test(`it returns the next rows GridCell the focused row`, () => {
          const navigator = createGridWithEmptyLines()
          // Navigate down to the 2nd row (1st non hunk row)
          navigator.moveToNextItem('ArrowDown')
          const nextRowCell = navigator.getNextSelectableCell('ArrowDown')
          expect(nextRowCell).toEqual({
            cellId: 'mock-file-anchor-2-2-0',
            columnIndex: 0,
            isEmpty: false,
            isHunk: false,
            lineNumber: 2,
            orientation: 'left',
          })
        })
      })

      describe('when the previous code row has a line number', () => {
        test(`it returns the previous rows GridCell`, () => {
          const navigator = createGridWithEmptyLines()
          // Navigate down to the 3rd row (2nd non hunk row)
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          const nextRowCell = navigator.getNextSelectableCell('ArrowUp')
          expect(nextRowCell).toEqual({
            cellId: 'mock-file-anchor-1-1-0',
            columnIndex: 0,
            isEmpty: false,
            isHunk: false,
            lineNumber: 1,
            orientation: 'left',
          })
        })
      })

      describe('when the next row is empty', () => {
        test(`it returns the next rows cell id on right diff side`, () => {
          const navigator = createGridWithEmptyLines()
          // Navigate to the 3rd row as the next row will be empty on the left side
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')

          const nextRowCell = navigator.getNextSelectableCell('ArrowDown')
          expect(nextRowCell).toEqual({
            cellId: 'mock-file-anchor-empty-3-2',
            columnIndex: 2,
            isEmpty: false,
            isHunk: false,
            lineNumber: 3,
            orientation: 'right',
          })
        })
      })

      describe('when the previous row is empty', () => {
        test(`it returns the previous rows cell id on right diff side`, () => {
          const navigator = createGridWithEmptyLines()
          // Navigate to the 5th row as the next row will be empty on the left side
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          const nextRowCell = navigator.getNextSelectableCell('ArrowUp')
          expect(nextRowCell).toEqual({
            cellId: 'mock-file-anchor-empty-3-2',
            columnIndex: 2,
            isEmpty: false,
            isHunk: false,
            lineNumber: 3,
            orientation: 'right',
          })
        })
      })

      describe('when the next row is a hunk row', () => {
        test('it returns the next code row cell below the precending hunk row', () => {
          const navigator = createGridWithEmptyLines()
          // Navigate to the 7th row as the next row will be a hunk row
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          const nextRowCell = navigator.getNextSelectableCell('ArrowDown')
          expect(nextRowCell).toEqual({
            cellId: 'mock-file-anchor-25-25-0',
            columnIndex: 0,
            isEmpty: false,
            isHunk: false,
            lineNumber: 25,
            orientation: 'left',
          })
        })
      })

      describe('when the previous row is a hunk row', () => {
        test('it returns the previous code row cell before the previous hunk row', () => {
          const navigator = createGridWithEmptyLines()
          // Navigate to the 9th row as the previous row will be a hunk row
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          const nextRowCell = navigator.getNextSelectableCell('ArrowUp')
          expect(nextRowCell).toEqual({
            cellId: 'mock-file-anchor-5-5-0',
            columnIndex: 0,
            isEmpty: false,
            isHunk: false,
            lineNumber: 5,
            orientation: 'left',
          })
        })
      })

      describe('when orientation is left diff side', () => {
        describe('when the next code row has a line number', () => {
          test(`it returns the next rows GridCell the focused row`, () => {
            const navigator = createGridWithEmptyLines()
            // Navigate down to the 2nd row (1st non hunk row)
            navigator.moveToNextItem('ArrowDown')
            const nextRowCell = navigator.getNextSelectableCell('ArrowDown')
            expect(nextRowCell).toEqual({
              cellId: 'mock-file-anchor-2-2-0',
              columnIndex: 0,
              isEmpty: false,
              isHunk: false,
              lineNumber: 2,
              orientation: 'left',
            })
          })
        })

        describe('when the previous code row has a line number', () => {
          test(`it returns the previous rows GridCell`, () => {
            const navigator = createGridWithEmptyLines()
            // Navigate down to the 3rd row (2nd non hunk row)
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            const nextRowCell = navigator.getNextSelectableCell('ArrowUp')
            expect(nextRowCell).toEqual({
              cellId: 'mock-file-anchor-1-1-0',
              columnIndex: 0,
              isEmpty: false,
              isHunk: false,
              lineNumber: 1,
              orientation: 'left',
            })
          })
        })

        describe('when the next row is empty', () => {
          test(`it returns the next rows cell id on right diff side`, () => {
            const navigator = createGridWithEmptyLines()
            // Navigate to the 3rd row as the next row will be empty on the left side
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')

            const nextRowCell = navigator.getNextSelectableCell('ArrowDown')
            expect(nextRowCell).toEqual({
              cellId: 'mock-file-anchor-empty-3-2',
              columnIndex: 2,
              isEmpty: false,
              isHunk: false,
              lineNumber: 3,
              orientation: 'right',
            })
          })
        })

        describe('when the previous row is empty', () => {
          test(`it returns the previous rows cell id on right diff side`, () => {
            const navigator = createGridWithEmptyLines()
            // Navigate to the 5th row as the next row will be empty on the left side
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            const nextRowCell = navigator.getNextSelectableCell('ArrowUp')
            expect(nextRowCell).toEqual({
              cellId: 'mock-file-anchor-empty-3-2',
              columnIndex: 2,
              isEmpty: false,
              isHunk: false,
              lineNumber: 3,
              orientation: 'right',
            })
          })
        })

        describe('when the next row is a hunk row', () => {
          test('it returns the next code row cell below the precending hunk row', () => {
            const navigator = createGridWithEmptyLines()
            // Navigate to the 7th row as the next row will be a hunk row
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            const nextRowCell = navigator.getNextSelectableCell('ArrowDown')
            expect(nextRowCell).toEqual({
              cellId: 'mock-file-anchor-25-25-0',
              columnIndex: 0,
              isEmpty: false,
              isHunk: false,
              lineNumber: 25,
              orientation: 'left',
            })
          })
        })

        describe('when the previous row is a hunk row', () => {
          test('it returns the previous code row cell before the previous hunk row', () => {
            const navigator = createGridWithEmptyLines()
            // Navigate to the 9th row as the previous row will be a hunk row
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            navigator.moveToNextItem('ArrowDown')
            const nextRowCell = navigator.getNextSelectableCell('ArrowUp')
            expect(nextRowCell).toEqual({
              cellId: 'mock-file-anchor-5-5-0',
              columnIndex: 0,
              isEmpty: false,
              isHunk: false,
              lineNumber: 5,
              orientation: 'left',
            })
          })
        })
      })
    })
    describe('when orientation is right diff side', () => {
      describe('when the next code row has a line number', () => {
        test(`it returns the next rows GridCell the focused row`, () => {
          const navigator = createGridWithEmptyLines()
          // Navigate down to the 2nd row (1st non hunk row)
          navigator.moveToNextItem('ArrowDown')
          // Navigate to right side of the diff
          navigator.moveToNextItem('ArrowRight')
          navigator.moveToNextItem('ArrowRight')

          expect(navigator.getNextSelectableCell('ArrowDown')).toEqual({
            cellId: 'mock-file-anchor-2-2-2',
            columnIndex: 2,
            isEmpty: false,
            isHunk: false,
            lineNumber: 2,
            orientation: 'right',
          })
        })
      })

      describe('when the previous code row has a line number', () => {
        test(`it returns the previous rows GridCell`, () => {
          const navigator = createGridWithEmptyLines()
          // Navigate down to the 3rd row (2nd non hunk row)
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          // Navigate to right side of the diff
          navigator.moveToNextItem('ArrowRight')
          navigator.moveToNextItem('ArrowRight')

          expect(navigator.getNextSelectableCell('ArrowUp')).toEqual({
            cellId: 'mock-file-anchor-1-1-2',
            columnIndex: 2,
            isEmpty: false,
            isHunk: false,
            lineNumber: 1,
            orientation: 'right',
          })
        })
      })

      describe('when the next row is empty', () => {
        test(`it returns the next rows cell id on left diff side`, () => {
          const navigator = createGridWithEmptyLines()
          // Navigate to the 5th row as the next row will be empty on the right side
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          // Navigate to right side of the diff
          navigator.moveToNextItem('ArrowRight')
          navigator.moveToNextItem('ArrowRight')

          expect(navigator.getNextSelectableCell('ArrowDown')).toEqual({
            cellId: 'mock-file-anchor-4-empty-0',
            columnIndex: 0,
            isEmpty: false,
            isHunk: false,
            lineNumber: 4,
            orientation: 'left',
          })
        })
      })

      describe('when the previous row is empty', () => {
        test(`it returns the previous rows cell id on left diff side`, () => {
          const navigator = createGridWithEmptyLines()
          // Navigate to the 7th row as the next row will be empty on the right side
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          // Navigate to right side of the diff
          navigator.moveToNextItem('ArrowRight')
          navigator.moveToNextItem('ArrowRight')

          expect(navigator.getNextSelectableCell('ArrowUp')).toEqual({
            cellId: 'mock-file-anchor-4-empty-0',
            columnIndex: 0,
            isEmpty: false,
            isHunk: false,
            lineNumber: 4,
            orientation: 'left',
          })
        })
      })

      describe('when the next row is a hunk row', () => {
        test('it returns the next code row cell below the precending hunk row', () => {
          const navigator = createGridWithEmptyLines()
          // Navigate to the 7th row as the next row will be a hunk row
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          // Navigate to right side of the diff
          navigator.moveToNextItem('ArrowRight')
          navigator.moveToNextItem('ArrowRight')

          expect(navigator.getNextSelectableCell('ArrowDown')).toEqual({
            cellId: 'mock-file-anchor-25-25-2',
            columnIndex: 2,
            isEmpty: false,
            isHunk: false,
            lineNumber: 25,
            orientation: 'right',
          })
        })
      })

      describe('when the previous row is a hunk row', () => {
        test('it returns the previous code row cell before the previous hunk row', () => {
          const navigator = createGridWithEmptyLines()
          // Navigate to the 9th row as the previous row will be a hunk row
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          navigator.moveToNextItem('ArrowDown')
          // Navigate to right side of the diff
          navigator.moveToNextItem('ArrowRight')
          navigator.moveToNextItem('ArrowRight')

          expect(navigator.getNextSelectableCell('ArrowUp')).toEqual({
            cellId: 'mock-file-anchor-5-5-2',
            columnIndex: 2,
            isEmpty: false,
            isHunk: false,
            lineNumber: 5,
            orientation: 'right',
          })
        })
      })
    })
  })
  describe('unified diff view', () => {
    describe('when the next code row has a line number', () => {
      test(`it returns the next rows GridCell the focused row`, () => {
        const navigator = createUnifiedGrid()
        // Navigate down to the 2nd row (1st non hunk row)
        navigator.moveToNextItem('ArrowDown')
        const nextRowCell = navigator.getNextSelectableCell('ArrowDown')
        expect(nextRowCell).toEqual({
          cellId: 'mock-file-anchor-2-2-0',
          columnIndex: 0,
          isEmpty: false,
          isHunk: false,
          lineNumber: 2,
          orientation: 'left',
        })
      })
    })

    describe('when the previous code row has a line number', () => {
      test(`it returns the previous rows GridCell`, () => {
        const navigator = createUnifiedGrid()
        // Navigate down to the 3rd row (2nd non hunk row)
        navigator.moveToNextItem('ArrowDown')
        navigator.moveToNextItem('ArrowDown')
        const nextRowCell = navigator.getNextSelectableCell('ArrowUp')
        expect(nextRowCell).toEqual({
          cellId: 'mock-file-anchor-1-1-0',
          columnIndex: 0,
          isEmpty: false,
          isHunk: false,
          lineNumber: 1,
          orientation: 'left',
        })
      })
    })

    describe('when the next row is a hunk row', () => {
      test('it returns the next code row cell below the precending hunk row', () => {
        const navigator = createUnifiedGrid()
        // Navigate to the 4th row as the next row will be a hunk row
        navigator.moveToNextItem('ArrowDown')
        navigator.moveToNextItem('ArrowDown')
        navigator.moveToNextItem('ArrowDown')
        const nextRowCell = navigator.getNextSelectableCell('ArrowDown')
        expect(nextRowCell).toEqual({
          cellId: 'mock-file-anchor-5-5-0',
          columnIndex: 0,
          isEmpty: false,
          isHunk: false,
          lineNumber: 5,
          orientation: 'left',
        })
      })
    })

    describe('when the previous row is a hunk row', () => {
      test('it returns the previous code row cell before the previous hunk row', () => {
        const navigator = createUnifiedGrid()
        // Navigate to the 6th row as the previous row will be a hunk row
        navigator.moveToNextItem('ArrowDown')
        navigator.moveToNextItem('ArrowDown')
        navigator.moveToNextItem('ArrowDown')
        navigator.moveToNextItem('ArrowDown')
        navigator.moveToNextItem('ArrowDown')
        const nextRowCell = navigator.getNextSelectableCell('ArrowUp')
        expect(nextRowCell).toEqual({
          cellId: 'mock-file-anchor-3-3-0',
          columnIndex: 0,
          isEmpty: false,
          isHunk: false,
          lineNumber: 3,
          orientation: 'left',
        })
      })
    })
  })
})

describe('clearLastSelectedCell', () => {
  test('sets last selected cell to undefined for the split grid', () => {
    const navigator = createSplitGrid()
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.getNextSelectableCell('ArrowUp')

    expect(navigator.lastSelectedGridCell).toEqual({
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
      isEmpty: false,
      isHunk: false,
      lineNumber: 1,
      orientation: 'left',
    })

    navigator.clearLastSelectedCell()
    expect(navigator.lastSelectedGridCell).toBeUndefined()
  })

  test('sets last selected cell to undefined for the unified grid', () => {
    const navigator = createUnifiedGrid()
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.getNextSelectableCell('ArrowUp')

    expect(navigator.lastSelectedGridCell).toEqual({
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
      isEmpty: false,
      isHunk: false,
      lineNumber: 1,
      orientation: 'left',
    })

    navigator.clearLastSelectedCell()
    expect(navigator.lastSelectedGridCell).toBeUndefined()
  })
})

describe('getValidSelectableRowCell', () => {
  test('returns undefined if row is hunk row for a split grid', () => {
    const navigator = createGridWithEmptyLines()
    // Navigate to the 7th row as the next row will be a hunk row
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')

    expect(navigator.getValidSelectableRowCell()).toBeUndefined()
  })

  test('returns undefined if row is hunk row for a unified grid', () => {
    const navigator = createUnifiedGrid()
    // Navigate to the 4th row as the next row will be a hunk row
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')

    expect(navigator.getValidSelectableRowCell()).toBeUndefined()
  })

  test('returns focused cell if cell is not empty', () => {
    const navigator = createGridWithEmptyLines()
    // Navigate to the 7th row as the next row will be a hunk row
    navigator.moveToNextItem('ArrowDown')

    expect(navigator.getValidSelectableRowCell()).toEqual(navigator.focusedGridCell)
  })

  test('returns adjacent cell from right side, if left side is empty', () => {
    const navigator = createGridWithEmptyLines()
    // Navigate to the 3rd row as the row will be empty on the left side
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')

    expect(navigator.getValidSelectableRowCell()).toEqual({
      cellId: 'mock-file-anchor-empty-3-2',
      columnIndex: 2,
      isEmpty: false,
      isHunk: false,
      lineNumber: 3,
      orientation: 'right',
    })
  })

  test('returns adjacent GridCell from left side, if right side GridCell is empty', () => {
    const navigator = createGridWithEmptyLines()
    // Navigate to the 5th row as the row will be empty on the right side
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    navigator.moveToNextItem('ArrowDown')
    // Navigate to right side of the diff
    navigator.moveToNextItem('ArrowRight')
    navigator.moveToNextItem('ArrowRight')

    expect(navigator.getValidSelectableRowCell()).toEqual({
      cellId: 'mock-file-anchor-4-empty-0',
      columnIndex: 0,
      isEmpty: false,
      isHunk: false,
      lineNumber: 4,
      orientation: 'left',
    })
  })
})

describe('getFirstCodeCell function', () => {
  it('returns a right side cell if left side is an empty code cell', () => {
    const isSplitDiff = true
    const leftLines = [
      makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
      'empty-diff-line' as EmptyDiffLine,
    ]

    const rightLines = [
      makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
      makeLine({left: 0, right: 1, blobLineNumber: 1, type: 'ADDITION', html: 'modified 1'}),
    ]

    const gridNavigator = new GridNavigator(fileAnchor, isSplitDiff, leftLines, rightLines)

    expect(gridNavigator.getFirstCodeCell()).toEqual({
      cellId: 'mock-file-anchor-empty-1-2',
      columnIndex: 2,
      isEmpty: false,
      isHunk: false,
      lineNumber: 1,
      orientation: 'right',
    })
  })

  it('returns a left side cell if left side is not an empty code cell', () => {
    const isSplitDiff = true
    const leftLines = [
      makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
      makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'original 1'}),
    ]

    const rightLines = [
      makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
      makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'original 1'}),
    ]

    const gridNavigator = new GridNavigator(fileAnchor, isSplitDiff, leftLines, rightLines)

    expect(gridNavigator.getFirstCodeCell()).toEqual({
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
      isEmpty: false,
      isHunk: false,
      lineNumber: 1,
      orientation: 'left',
    })
  })

  it('returns undefined if the only line in a diff in a hunk row', () => {
    const isSplitDiff = true
    const leftLines = [makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'})]

    const rightLines = [makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'})]

    const gridNavigator = new GridNavigator(fileAnchor, isSplitDiff, leftLines, rightLines)

    expect(gridNavigator.getFirstCodeCell()).toBeUndefined()
  })

  it('returns the first code cell of a unified grid', () => {
    const gridNavigator = createUnifiedGrid()

    expect(gridNavigator.getFirstCodeCell()).toEqual({
      cellId: 'mock-file-anchor-1-1-0',
      columnIndex: 0,
      isEmpty: false,
      isHunk: false,
      lineNumber: 1,
      orientation: 'left',
    })
  })
})

describe('getLastCodeCell function', () => {
  it('returns a left side cell if right side is an empty code cell', () => {
    const isSplitDiff = true
    const leftLines = [
      makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
      makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'original 1'}),
      makeLine({left: 2, right: 2, blobLineNumber: 2, type: 'CONTEXT', html: 'original 2'}),
    ]

    const rightLines = [
      makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
      makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'CONTEXT', html: 'original 1'}),
      'empty-diff-line' as EmptyDiffLine,
    ]

    const gridNavigator = new GridNavigator(fileAnchor, isSplitDiff, leftLines, rightLines)

    expect(gridNavigator.getLastCodeCell()).toEqual({
      cellId: 'mock-file-anchor-2-empty-1',
      columnIndex: 1,
      isEmpty: false,
      isHunk: false,
      lineNumber: 2,
      orientation: 'left',
    })
  })

  it('returns a right side cell if right side is not an empty code cell', () => {
    const isSplitDiff = true
    const leftLines = [
      makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
      makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'DELETION', html: 'original 1'}),
      makeLine({left: 2, right: 2, blobLineNumber: 2, type: 'CONTEXT', html: 'original 2'}),
    ]

    const rightLines = [
      makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'}),
      makeLine({left: 1, right: 1, blobLineNumber: 1, type: 'ADDITION', html: 'modified 1'}),
      makeLine({left: 2, right: 2, blobLineNumber: 2, type: 'CONTEXT', html: 'original 2'}),
    ]

    const gridNavigator = new GridNavigator(fileAnchor, isSplitDiff, leftLines, rightLines)

    expect(gridNavigator.getLastCodeCell()).toEqual({
      cellId: 'mock-file-anchor-2-2-3',
      columnIndex: 3,
      isEmpty: false,
      isHunk: false,
      lineNumber: 2,
      orientation: 'right',
    })
  })

  it('returns undefined if the only line in a diff in a hunk row', () => {
    const isSplitDiff = true
    const leftLines = [makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'})]

    const rightLines = [makeLine({left: 0, right: 0, blobLineNumber: 0, type: 'HUNK', html: 'hunk header'})]

    const gridNavigator = new GridNavigator(fileAnchor, isSplitDiff, leftLines, rightLines)

    expect(gridNavigator.getLastCodeCell()).toBeUndefined()
  })

  it('returns the last code cell for a unified grid', () => {
    const gridNavigator = createUnifiedGrid()
    // new GridNavigator(fileAnchor, leftLines, rightLines)

    expect(gridNavigator.getLastCodeCell()).toEqual({
      cellId: 'mock-file-anchor-6-6-2',
      columnIndex: 2,
      isEmpty: false,
      isHunk: false,
      lineNumber: 6,
      orientation: 'right',
    })
  })
})
