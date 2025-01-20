import type {ClientDiffLine} from '../types'
import {rowIdFrom, cellIdFrom, isEmptyDiffLine} from './line-helpers'

function isVerticalNavigation(key: string) {
  return key === 'ArrowDown' || key === 'ArrowUp'
}

export interface GridCell {
  lineNumber?: number | null
  orientation?: 'left' | 'right'
  isEmpty: boolean
  isHunk: boolean
  cellId: string
  columnIndex: number
}

/**
 * A class that navigates a diff grid. The grid is a 2D array of ids, each of which maps to a cell in the grid.
 */
export class GridNavigator {
  // 2D array that mirrors the structure of the diff grid cells
  private grid: GridCell[][] = []

  // map each cell to its row and column index in the grid
  private cellIdToGridLocation: Map<string, [number, number]> = new Map()

  // set tracking the row indexes of all hunk rows
  private hunkRowIndexes: Set<number> = new Set()

  // the currently focused grid item
  public focusedGridCell?: GridCell

  // the last grid cell selected
  public lastSelectedGridCell?: GridCell

  // used to maintain column state when navigating through a hunk row which is only one column
  private savedColumnIndex?: number

  constructor(
    private fileAnchor: string,
    private isSplitDiff: boolean,
    leftLines: readonly ClientDiffLine[],
    rightLines?: readonly ClientDiffLine[],
    initialFocusedGridCellId?: string,
  ) {
    this.initializeGrid(leftLines, rightLines)
    this.focusFirstGridCell(initialFocusedGridCellId)
  }

  /**
   * Given a direction, determine what the next focused item's id is
   *
   * @param direction indicates the direction to move the focus
   * @returns either the string id of the next cell to focus
   */
  public moveToNextItem(key: string, ctrlKey?: boolean): GridCell | undefined {
    const indices = this.cellIdToGridLocation.get(this.focusedGridCell?.cellId ?? '')
    if (!indices) return undefined

    let nextFocusedItem: GridCell | undefined
    const [currentRowIndex] = indices
    let [, currentColumnIndex] = indices

    // if we're navigating up or down out a hunk row, restore column index
    if (isVerticalNavigation(key) && this.isHunkRow(currentRowIndex) && this.savedColumnIndex) {
      currentColumnIndex = this.savedColumnIndex
      this.savedColumnIndex = undefined
    }

    switch (true) {
      case ctrlKey && key === 'Home': {
        this.focusFirstGridCell()
        break
      }
      case ctrlKey && key === 'End': {
        const endRowIndex = this.grid.length - 1
        const endColumnCellCount = this.grid[endRowIndex]?.length
        if (endColumnCellCount) {
          nextFocusedItem = this.grid[endRowIndex]?.[endColumnCellCount - 1]
        }
        break
      }
      case key === 'ArrowUp':
        if (this.isHunkRow(currentRowIndex - 1)) {
          this.saveColumnIndex(currentColumnIndex)
          nextFocusedItem = this.grid[currentRowIndex - 1]?.[0]
        } else {
          nextFocusedItem = this.grid[currentRowIndex - 1]?.[currentColumnIndex]
        }

        break
      case key === 'ArrowDown':
        if (this.isHunkRow(currentRowIndex + 1)) {
          this.saveColumnIndex(currentColumnIndex)
          nextFocusedItem = this.grid[currentRowIndex + 1]?.[0]
        } else {
          nextFocusedItem = this.grid[currentRowIndex + 1]?.[currentColumnIndex]
        }

        break
      case key === 'ArrowLeft':
        nextFocusedItem = this.grid[currentRowIndex]?.[currentColumnIndex - 1]
        break
      case key === 'ArrowRight':
        nextFocusedItem = this.grid[currentRowIndex]?.[currentColumnIndex + 1]
        break
      case key === 'PageUp': {
        this.saveColumnIndex(currentColumnIndex)
        const previousHunkRowIndex = this.getPreviousHunkRowIndex(currentRowIndex)
        nextFocusedItem = this.grid[previousHunkRowIndex]?.[0]
        break
      }
      case key === 'PageDown': {
        this.saveColumnIndex(currentColumnIndex)
        let nextHunkRowIndex = this.getNextHunkRowIndex(currentRowIndex)
        let nextColumnIndex = 0

        // move to the last row of the diff if we're on the last hunk row
        if (!nextHunkRowIndex) {
          nextHunkRowIndex = this.grid.length - 1
          nextColumnIndex = currentColumnIndex
        }

        nextFocusedItem = this.grid[nextHunkRowIndex]?.[nextColumnIndex]
        break
      }
      case key === 'Home': {
        nextFocusedItem = this.grid[currentRowIndex]?.[0]
        break
      }
      case key === 'End': {
        const currentRow = this.grid[currentRowIndex]
        if (currentRow && !this.isHunkRow(currentRowIndex)) {
          const lastColumnIndex = currentRow.length - 1
          nextFocusedItem = this.grid[currentRowIndex]?.[lastColumnIndex]
        }

        break
      }
    }

    // leave the focus on the current item if we didn't find a next item
    if (nextFocusedItem) this.focusedGridCell = nextFocusedItem
    return this.focusedGridCell
  }

  public reinitializeGrid(leftLines: readonly ClientDiffLine[], rightLines?: readonly ClientDiffLine[]) {
    this.initializeGrid(leftLines, rightLines)
  }

  public focusFirstGridCell(initialFocusedGridCellId?: string) {
    if (initialFocusedGridCellId && !!this.cellIdToGridLocation.get(initialFocusedGridCellId)) {
      this.focusGridCell(initialFocusedGridCellId)
    } else {
      this.focusedGridCell = this.grid[0]?.[0]
    }
  }

  public focusGridCell(cellId: string) {
    if (this.focusedGridCell?.cellId === cellId) return

    const indices = this.cellIdToGridLocation.get(cellId)
    if (!indices) return

    const [rowIndex, columnIndex] = indices
    this.focusedGridCell = this.grid[rowIndex]?.[columnIndex]
  }

  /**
   * Find the next code row and return the code cell id depending on orientation
   */
  public getNextSelectableCell(key: 'ArrowUp' | 'ArrowDown'): GridCell | undefined {
    // Creates a reference GridCell to use as a starting point to grab references to the GridCells in rows below and above it.
    // The reference GridCell will be defined as
    // 1. the last selected GridCell (when more than one line is already selected) or
    // 2. the focused GridCell (when no lines are selected)
    const referenceGridCell = this.lastSelectedGridCell || this.focusedGridCell
    const referenceGridCellIndices = this.cellIdToGridLocation.get(referenceGridCell?.cellId ?? '')

    // If unable to find the current cell in the grid, return early
    if (!referenceGridCellIndices) return

    const [currentRowIndex, currentColumnIndex] = referenceGridCellIndices

    // If we are on the first non-hunk row of code return when selecting previous row
    if (key === 'ArrowUp' && currentRowIndex <= 1) return
    // If we are on the last non-hunk row of code return when selecting next row
    if (key === 'ArrowDown' && currentRowIndex === this.grid.length - 1) return

    let nextSelectableCell: GridCell | undefined

    // look for row that is before current focused row
    if (key === 'ArrowUp') {
      let previousRowIndex = currentRowIndex - 1

      while (!nextSelectableCell) {
        nextSelectableCell = this.getNextSelectableCellFromRow({
          rowIndex: previousRowIndex,
          columnIndex: currentColumnIndex,
        })
        previousRowIndex--
      }
    }

    // look for row that is after current focused row
    if (key === 'ArrowDown') {
      let nextRowIndex = currentRowIndex + 1

      while (!nextSelectableCell) {
        nextSelectableCell = this.getNextSelectableCellFromRow({
          rowIndex: nextRowIndex,
          columnIndex: currentColumnIndex,
        })
        nextRowIndex++
      }
    }

    if (nextSelectableCell) this.lastSelectedGridCell = nextSelectableCell

    return nextSelectableCell
  }

  /**
   * Returns a valid selectable GridCell on a diff row if the current GridCell is empty
   *
   * returns GridCell from 'right' side of diff, if passed an empty GridCell on 'left' side of diff
   * returns GridCell from 'left' side of diff, if passed an empty GridCell on 'right' side of diff
   * returns undefined, if the GridCell passed is a hunk
   * returns undefined, if the GridCell passed is not empty
   */
  public getValidSelectableRowCell(): GridCell | undefined {
    // return undefined if GridCell is a hunk row, there is no valid selectable columns on hunk row
    if (this.focusedGridCell?.isHunk) return

    // return GridCell if it's not empty, this is a valid selectable column
    if (!this.focusedGridCell?.isEmpty) return this.focusedGridCell

    const gridRowIndex = this.cellIdToGridLocation.get(this.focusedGridCell.cellId)?.[0]

    // guard if unable to find the grid row index
    if (!gridRowIndex) return

    // Check to see if this focused GridCell is on the left hand side of the diff or right hand side of the diff in split view
    // column indexes 0 and 1 are left hand side and column index 2 and 3 are right hand side
    return this.focusedGridCell.columnIndex < 2
      ? this.grid[gridRowIndex]?.[this.focusedGridCell.columnIndex + 2]
      : this.grid[gridRowIndex]?.[this.focusedGridCell.columnIndex - 2]
  }

  /**
   * clears the last known selected cell
   */
  public clearLastSelectedCell() {
    this.lastSelectedGridCell = undefined
  }

  /**
   * Finds the first code cell in the grid that isn't empty or a hunk cell
   *
   * @returns GridCell
   */
  public getFirstCodeCell() {
    const firstCodeRow = this.grid.find(row => row[0] && !row[0].isHunk)
    return firstCodeRow?.find(cell => !cell.isEmpty)
  }

  /**
   * Finds the last code cell in the grid that isn't empty or a hunk cell
   *
   * @returns GridCell
   */
  public getLastCodeCell() {
    const lastCodeRow = this.grid
      // Slice is used here to make a copy of the grid so that .reverse will not mutate the original grid
      .slice()
      .reverse()
      .find(row => row[0] && !row[0].isHunk)
    return (
      lastCodeRow
        // Slice is used here to make a copy of the grid row so that .reverse will not mutate the original grid row
        ?.slice()
        .reverse()
        .find(cell => !cell.isEmpty)
    )
  }

  /**
   * Returns true if the given line is in the grid
   */
  public hasLine(leftLine: ClientDiffLine, rightLine?: ClientDiffLine, isHunk?: boolean): boolean {
    const rowIdentifier = rowIdFrom(this.fileAnchor, leftLine, rightLine)
    const cellId = cellIdFrom(rowIdentifier, 0)
    const indices = this.cellIdToGridLocation.get(cellId)
    if (!indices) return false

    const [rowIndex] = indices
    return !!isHunk === this.isHunkRow(rowIndex)
  }

  private getNextSelectableCellFromRow({rowIndex, columnIndex}: {rowIndex: number; columnIndex: number}) {
    const nextRow = this.grid[rowIndex]
    const nextCell = nextRow?.[columnIndex]

    switch (true) {
      case nextCell?.isHunk:
        return
      case nextCell?.orientation === 'left' && nextCell.isEmpty:
        // return the same type of column type (line number or code) on the right side of the diff
        return nextRow?.[columnIndex + 2]
      case nextCell?.orientation === 'right' && nextCell.isEmpty:
        // return the same type of column type (line number or code) on the left side of the diff
        return nextRow?.[columnIndex - 2]
      default:
        return nextRow?.[columnIndex]
    }
  }

  /**
   * Find the first hunk row after the given row index
   *
   * @returns number
   */
  private getNextHunkRowIndex(currentRowIndex: number) {
    const hunkRowIndexes = Array.from(this.hunkRowIndexes).sort((a, b) => a - b)
    return hunkRowIndexes.find(index => index > currentRowIndex)
  }

  /**
   * Find the first hunk row before the given row index
   */
  private getPreviousHunkRowIndex(currentRowIndex: number) {
    const hunkRowIndexes = Array.from(this.hunkRowIndexes).sort((a, b) => a - b)
    return hunkRowIndexes.reverse().find(index => index < currentRowIndex) ?? 0
  }

  private initializeGrid(leftLines: readonly ClientDiffLine[], rightLines?: readonly ClientDiffLine[]) {
    this.grid = []
    this.cellIdToGridLocation = new Map<string, [number, number]>()
    this.hunkRowIndexes = new Set<number>()

    for (let rowIndex = 0; rowIndex < leftLines.length; rowIndex++) {
      // Each row represents a row in the grid.
      // For split this will be: [number cell, code cell, number cell, code cell]
      // For unified this will be: [number cell, number cell, code cell]
      const row: GridCell[] = []
      const leftLine = leftLines[rowIndex]
      if (leftLine === undefined) continue

      // the diff is in split mode
      if (this.isSplitDiff) {
        const rightLine = (rightLines || [])[rowIndex]
        const rowIdentifier = rowIdFrom(this.fileAnchor, leftLine, rightLine)

        !isEmptyDiffLine(leftLine) && leftLine.type === 'HUNK'
          ? this.initializeHunkRow(row, rowIdentifier, rowIndex)
          : this.initializeSplitDiffCodeRow({leftLine, rightLine, row, rowIdentifier, rowIndex})
      } else {
        const rowIdentifier = rowIdFrom(this.fileAnchor, leftLine, leftLine)

        !isEmptyDiffLine(leftLine) && leftLine.type === 'HUNK'
          ? this.initializeHunkRow(row, rowIdentifier, rowIndex)
          : this.initializeUnifiedDiffCodeRow({diffLine: leftLine, row, rowIdentifier, rowIndex})
      }

      this.grid.push(row)
    }
  }

  /**
   * Initialize a diffline row and all its grid data
   */
  private initializeContentCell({
    cellIndex,
    diffLine,
    orientation,
    row,
    rowIdentifier,
    rowIndex,
  }: {
    cellIndex: number
    diffLine: ClientDiffLine | undefined
    orientation: 'left' | 'right'
    row: GridCell[]
    rowIdentifier: string
    rowIndex: number
  }) {
    const cellId = cellIdFrom(rowIdentifier, cellIndex)
    let lineNumber: number | null | undefined

    if (!isEmptyDiffLine(diffLine) && orientation === 'left') lineNumber = diffLine?.left
    if (!isEmptyDiffLine(diffLine) && orientation === 'right') lineNumber = diffLine?.right

    row.push({
      lineNumber,
      orientation,
      isHunk: false,
      isEmpty: isEmptyDiffLine(diffLine),
      cellId: cellIdFrom(rowIdentifier, cellIndex),
      columnIndex: cellIndex,
    })
    this.cellIdToGridLocation.set(cellId, [rowIndex, cellIndex])
  }

  /**
   * Initialize a hunk row and all its grid data
   */
  private initializeHunkRow(row: GridCell[], rowId: string, rowIndex: number) {
    // hunk rows are only one cell
    const cellId = cellIdFrom(rowId, 0)
    row.push({
      isHunk: true,
      isEmpty: false,
      cellId,
      columnIndex: 0,
    })
    this.cellIdToGridLocation.set(cellId, [rowIndex, 0])
    this.hunkRowIndexes.add(rowIndex)
  }

  private isHunkRow(index: number) {
    return this.hunkRowIndexes.has(index)
  }

  private initializeSplitDiffCodeRow({
    leftLine,
    rightLine,
    row,
    rowIdentifier,
    rowIndex,
  }: {
    leftLine: ClientDiffLine | undefined
    rightLine: ClientDiffLine | undefined
    row: GridCell[]
    rowIdentifier: string
    rowIndex: number
  }) {
    this.initializeContentCell({
      cellIndex: 0,
      diffLine: leftLine,
      orientation: 'left',
      row,
      rowIdentifier,
      rowIndex,
    })
    this.initializeContentCell({
      cellIndex: 1,
      diffLine: leftLine,
      orientation: 'left',
      row,
      rowIdentifier,
      rowIndex,
    })
    this.initializeContentCell({
      cellIndex: 2,
      diffLine: rightLine,
      orientation: 'right',
      row,
      rowIdentifier,
      rowIndex,
    })
    this.initializeContentCell({
      cellIndex: 3,
      diffLine: rightLine,
      orientation: 'right',
      row,
      rowIdentifier,
      rowIndex,
    })
  }

  private initializeUnifiedDiffCodeRow({
    diffLine,
    row,
    rowIdentifier,
    rowIndex,
  }: {
    diffLine: ClientDiffLine
    row: GridCell[]
    rowIdentifier: string
    rowIndex: number
  }) {
    const codeOrientation = !isEmptyDiffLine(diffLine) && diffLine.type === 'DELETION' ? 'left' : 'right'
    this.initializeContentCell({
      cellIndex: 0,
      diffLine,
      orientation: 'left',
      row,
      rowIdentifier,
      rowIndex,
    })
    this.initializeContentCell({
      cellIndex: 1,
      diffLine,
      orientation: 'right',
      row,
      rowIdentifier,
      rowIndex,
    })
    this.initializeContentCell({
      cellIndex: 2,
      diffLine,
      orientation: codeOrientation,
      row,
      rowIdentifier,
      rowIndex,
    })
  }

  /**
   * Update the saved column index if we're not on a hunk row
   */
  private saveColumnIndex(columnIndex: number) {
    // don't overwrite the saved column index if we're already on a hunk row.
    if (!this.isHunkRow(columnIndex)) {
      this.savedColumnIndex = columnIndex
    }
  }
}
