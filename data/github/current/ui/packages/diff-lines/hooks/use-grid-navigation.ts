import type {DiffAnchor} from '@github-ui/diffs/types'
import type {Direction} from '@primer/behaviors'
import {useFocusZone} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef} from 'react'

import type {
  ReplaceSelectedDiffRowRangeFromGridCellsFnArgs,
  UpdateSelectedDiffRowRangeFnArgs,
} from '../contexts/SelectedDiffRowRangeContext'
import {GridNavigator} from '../helpers/grid-navigator'
import {useFocusNextCellAfterExpand} from './use-focus-next-cell-after-expand'
import {GRID_NAV_KEYS, KEY_TO_BIT} from '../constants'
import type {ClientDiffLine, LineRange} from '../types'

/**
 * Given a container, add a focusout hook that will call the provided callback when the focus leaves the container.
 */
// Disabling this function until we determine how to better reset a grid cell focus position when users leaves the grid.
// function useFocusOutGridNavigationBehavior(containerRef: React.RefObject<HTMLElement>, onFocusOut: () => void) {
//   const focusOutHandler = useCallback(
//     (event: FocusEvent) => {
//       // only trigger focusout behavior if the focus is leaving the container
//       if (!containerRef.current?.contains(event.relatedTarget as Node)) onFocusOut()
//     },
//     [containerRef, onFocusOut],
//   )

//   useEffect(() => {
//     const containerElement = containerRef.current
//     containerElement?.addEventListener('focusout', focusOutHandler)
//     return () => containerElement?.removeEventListener('focusout', focusOutHandler)
//   }, [containerRef, focusOutHandler])
// }

/**
 * Keeps the grid navigator's focusedGridCell property in sync with the document's focused element
 */
function useSyncedGridFocus(containerRef: React.RefObject<HTMLElement>, gridNavigator: GridNavigator) {
  const handleGridFocusIn = useCallback(
    (event: FocusEvent) => {
      const focusedCell = event.target as HTMLElement
      const gridCellId = focusedCell.getAttribute('data-grid-cell-id')
      if (gridCellId) gridNavigator.focusGridCell(gridCellId)
    },
    [gridNavigator],
  )

  useEffect(() => {
    const containerElement = containerRef.current
    containerElement?.addEventListener('focusin', handleGridFocusIn)
    return () => containerElement?.removeEventListener('focusin', handleGridFocusIn)
  }, [containerRef, handleGridFocusIn])
}

export function isGridNavigationKey(key: string) {
  if (!(key in KEY_TO_BIT)) return false
  const keyBit = KEY_TO_BIT[key as keyof typeof KEY_TO_BIT]
  return (keyBit & GRID_NAV_KEYS) > 0
}

export function useGridNavigation({
  clearSelectedDiffRowRange,
  containerRef,
  fileAnchor,
  isSplitDiff,
  leftLines,
  replaceSelectedDiffRowRangeFromGridCells,
  rightLines,
  selectedDiffRowRange,
  updateSelectedDiffRowRange,
}: {
  clearSelectedDiffRowRange: () => void
  containerRef: React.RefObject<HTMLElement>
  fileAnchor: DiffAnchor
  isSplitDiff: boolean
  leftLines: readonly ClientDiffLine[]
  replaceSelectedDiffRowRangeFromGridCells: ReplaceSelectedDiffRowRangeFromGridCellsFnArgs
  rightLines?: readonly ClientDiffLine[]
  selectedDiffRowRange: LineRange | null
  updateSelectedDiffRowRange: UpdateSelectedDiffRowRangeFnArgs
}) {
  const prevGridNavigator = useRef<GridNavigator | undefined>()
  const gridNavigator = useMemo(
    () =>
      new GridNavigator(
        fileAnchor,
        isSplitDiff,
        leftLines,
        rightLines,
        prevGridNavigator.current?.focusedGridCell?.cellId,
      ),
    [fileAnchor, isSplitDiff, leftLines, rightLines],
  )

  useEffect(() => {
    prevGridNavigator.current = gridNavigator
  }, [gridNavigator])

  useFocusNextCellAfterExpand(fileAnchor, leftLines, gridNavigator, containerRef, prevGridNavigator.current, rightLines)
  useSyncedGridFocus(containerRef, gridNavigator)

  const getNextFocusable = useCallback(
    (_direction: Direction, from: Element | undefined, event: KeyboardEvent) => {
      const currentCell = from as HTMLElement
      const focusedGridCell = gridNavigator.getValidSelectableRowCell()

      switch (true) {
        // Handles CMD + A / CTRL + A key presses to select all difflines in a diff grid
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        case (event.metaKey || event.ctrlKey) && event.code === 'KeyA': {
          const firstCodeCell = gridNavigator.getFirstCodeCell()
          const lastCodeCell = gridNavigator.getLastCodeCell()

          // Avoid setting diff row range if we do not have valid Grid Cells
          if (!firstCodeCell || !lastCodeCell) return currentCell

          replaceSelectedDiffRowRangeFromGridCells({
            diffAnchor: fileAnchor,
            focusedGridCell: firstCodeCell,
            startGridCell: firstCodeCell,
            endGridCell: lastCodeCell,
          })
          return currentCell
        }
        // Handles SHIFT + Arrow Down key presses to select focused diffline and diffline(s) below/after it.
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        case event.shiftKey && event.key === 'ArrowDown': {
          const nextSelectedCell = gridNavigator.getNextSelectableCell('ArrowDown')

          // Avoid setting diff row range if we do not have valid Grid Cells
          if (!nextSelectedCell || !focusedGridCell) return currentCell

          selectedDiffRowRange?.firstSelectedLineNumber
            ? updateSelectedDiffRowRange(fileAnchor, nextSelectedCell.lineNumber, nextSelectedCell.orientation, true)
            : replaceSelectedDiffRowRangeFromGridCells({
                diffAnchor: fileAnchor,
                focusedGridCell,
                startGridCell: focusedGridCell,
                endGridCell: nextSelectedCell,
              })
          return currentCell
        }
        // Handles SHIFT + Arrow Up key presses to select focused diffline and diffline(s) above/before it.
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        case event.shiftKey && event.key === 'ArrowUp': {
          const nextSelectedCell = gridNavigator.getNextSelectableCell('ArrowUp')

          // Avoid setting diff row range if we do not have valid Grid Cells
          if (!nextSelectedCell || !focusedGridCell) return currentCell

          selectedDiffRowRange?.firstSelectedLineNumber
            ? updateSelectedDiffRowRange(fileAnchor, nextSelectedCell.lineNumber, nextSelectedCell.orientation, true)
            : replaceSelectedDiffRowRangeFromGridCells({
                diffAnchor: fileAnchor,
                focusedGridCell,
                startGridCell: nextSelectedCell,
                endGridCell: focusedGridCell,
              })
          return currentCell
        }
        default: {
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          const nextItem = gridNavigator.moveToNextItem(event.key, event.ctrlKey)
          const nextElement = nextItem && document.querySelector<HTMLElement>(`[data-grid-cell-id=${nextItem.cellId}]`)

          clearSelectedDiffRowRange()
          gridNavigator.clearLastSelectedCell()

          // return undefined instead of null when `document.getElementById` can't find element
          return nextElement ?? undefined
        }
      }
    },
    [
      gridNavigator,
      selectedDiffRowRange,
      updateSelectedDiffRowRange,
      fileAnchor,
      replaceSelectedDiffRowRangeFromGridCells,
      clearSelectedDiffRowRange,
    ],
  )

  // Disabling these function calls until we determine how to better reset a grid cell focus position when users leaves the grid.
  // reset grid navigator's current cell back to the first cell when focus leaves the grid
  // const handleFocusOut = useCallback(() => gridNavigator.focusFirstGridCell(), [gridNavigator])
  // useFocusOutGridNavigationBehavior(containerRef, handleFocusOut)

  useFocusZone(
    {
      containerRef,
      bindKeys: GRID_NAV_KEYS,
      getNextFocusable,
      focusableElementFilter: element => element.tagName !== 'BUTTON',
      focusInStrategy: 'previous',
    },
    [getNextFocusable],
  )

  return {gridNavigator}
}
