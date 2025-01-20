import {type RefObject, useEffect} from 'react'

import type {GridNavigator} from '../helpers/grid-navigator'
import {cellIdFrom, isEmptyDiffLine, rowIdFrom} from '../helpers/line-helpers'
import type {ClientDiffLine} from '../types'

function ensureElementFocusable(element: HTMLElement | null) {
  if (element) {
    // We need to set the cell's tabindex to 0 in a timeout because the focuszone will set it to -1,
    // which blocks the user from tabbing back into the grid.
    setTimeout(() => {
      if (element.tabIndex === 0) return
      element.tabIndex = 0
    })
  }
}

function getNewLines(
  prevGridNavigator: GridNavigator,
  leftLines: readonly ClientDiffLine[],
  rightLines?: readonly ClientDiffLine[],
) {
  const loadedLines: ClientDiffLine[] = []
  for (let i = 0; i < leftLines.length; i++) {
    const leftLine = leftLines[i]
    const rightLine = rightLines?.[i] ?? leftLine
    const isHunk = !isEmptyDiffLine(leftLine) && leftLine?.type === 'HUNK'
    if (leftLine && rightLine && !prevGridNavigator.hasLine(leftLine, rightLine, isHunk)) {
      loadedLines.push(leftLine)
    }
  }

  return loadedLines
}

/**
 * Hook behavior that uses imperative DOM manipulation to update the focus of the grid after a hunk expansion.
 * This hooks takes in the current list of diff lines and compares them to the previous grid navigator to determine
 * which lines are new. Using the new lines, we can determine which hunk button was selected and focus the next button
 * or cell.
 *
 * Strategy:
 * If the user selected expand up, we want to focus the next "expand up" button or the first loaded line.
 * If the user selected expand down, we want to focus the next "expand down" button or the first loaded line.
 * If the user selected expand all, we want to focus the first loaded line.
 */
export function useFocusNextCellAfterExpand(
  fileAnchor: string,
  leftLines: readonly ClientDiffLine[],
  gridNavigator: GridNavigator,
  containerRef: RefObject<HTMLElement>,
  prevGridNavigator?: GridNavigator,
  rightLines?: readonly ClientDiffLine[],
) {
  useEffect(() => {
    // when the lines have changed and the active element is document.body
    // we can infer that the user activated a hunk expansion, which causes the button
    // they selected to be removed from the DOM and focus returned to some other element in the document.
    // In this case, we want to update the focus to the "next" hunk button in the grid.
    if (prevGridNavigator && document.activeElement) {
      const loadedLines = getNewLines(prevGridNavigator, leftLines, rightLines)

      // no new lines, just bail
      if (loadedLines.length === 0) return

      if (document.activeElement === document.body) {
        // the line that comes after the last loaded line
        const nextLineIndex = leftLines.indexOf(loadedLines[loadedLines.length - 1] as ClientDiffLine)
        const nextLine = leftLines[nextLineIndex + 1]

        let cellId: string | undefined
        let cell: HTMLElement | null | undefined
        let cellButton: HTMLElement | null | undefined
        const firstLine = loadedLines[0] as ClientDiffLine

        // if the first line after the loaded lines is a hunk, the diff was expanded down.
        const focusNextExpandDown = nextLine && !isEmptyDiffLine(nextLine) && nextLine.type === 'HUNK'

        // if the diff was expanded down, focus the hunk row that comes right after the loaded lines.
        if (focusNextExpandDown) {
          cellId = cellIdFrom(rowIdFrom(fileAnchor, nextLine, nextLine), 0)
          cell = document.querySelector<HTMLElement>(`[data-grid-cell-id=${cellId}]`)
          cellButton = cell?.querySelector<HTMLElement>('button[data-direction=down], button[data-direction=all]')
        }

        // unless we have a down button to focus, focus the first loaded line.
        if (!cellButton) {
          cellId = cellIdFrom(rowIdFrom(fileAnchor, firstLine, firstLine), 0)
          cell = document.querySelector<HTMLElement>(`[data-grid-cell-id=${cellId}]`)
          cellButton = cell?.querySelector<HTMLElement>('button[data-direction=up], button[data-direction=all]')
        }

        if (cellId && cell) {
          if (cellButton) {
            cellButton.focus()
          } else {
            cell.focus()
          }

          gridNavigator.focusGridCell(cellId)
          ensureElementFocusable(cell)
        }
      } else if (document.activeElement.tagName === 'BUTTON') {
        // it's possible when expanding down that the expand down button stayed in the document and retained focus.
        // in this case, we just need to make sure that its parent is tabbable.
        const parentCell = document.activeElement.closest('td')
        ensureElementFocusable(parentCell)
      } else if (document.activeElement.tagName === 'TD') {
        const cellId = document.activeElement.getAttribute('data-grid-cell-id')
        const navigatorCellId = gridNavigator.focusedGridCell?.cellId

        // handle case when we expanded up via context menu or keyboard shortcut
        // and focus was incorrectly moved by the browser to a different cell
        if (cellId !== navigatorCellId) {
          const cellToFocus = containerRef.current?.querySelector<HTMLElement>(`[data-grid-cell-id=${navigatorCellId}]`)
          cellToFocus?.focus()
        }
      }
    }
  }, [fileAnchor, leftLines, gridNavigator, rightLines, prevGridNavigator, containerRef])
}
