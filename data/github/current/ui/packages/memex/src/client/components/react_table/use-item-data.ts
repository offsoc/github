import {useCallback, useMemo, useRef} from 'react'
import type {ColumnInstance, Row, TableInstance} from 'react-table'

import {useViews} from '../../hooks/use-views'
import {isWebkit} from '../../platform/user-agent'
import type {TableDataType} from './table-data-type'

export type FocusCellElementType = <T extends object>(
  element: HTMLElement,
  columnId: ColumnInstance<T>['id'],
  {isSuspended}: {isSuspended?: boolean},
) => void

export type ItemDataType = {
  prepareRow: (row: Row<TableDataType>) => void
  focusCellElement: FocusCellElementType
}

/**
 * A hook returning item data used by table rows and cells
 * @param table- A react table instance.
 * @param opts.sticky - An optional param to control whether or not the table cells use sticky positioning.
 * @returns
 */
export function useItemData(table: TableInstance<TableDataType>, opts?: {sticky: boolean}) {
  const sticky = !!opts?.sticky
  const {currentView} = useViews()
  const currentViewNumber = currentView?.number
  const lastFocusCellElementView = useRef(currentViewNumber)

  const {firstNavigableColumnId, lastNavigableColumnId} = useMemo(() => {
    return {
      firstNavigableColumnId: table.visibleColumns.find(c => !c.nonNavigable)?.id,
      lastNavigableColumnId: table.visibleColumns
        .slice()
        .reverse()
        .find(c => !c.nonNavigable)?.id,
    }
  }, [table.visibleColumns])

  const focusCellElement = useCallback(
    <T extends object>(
      element: HTMLElement,
      columnId: ColumnInstance<T>['id'],
      {isSuspended}: {isSuspended?: boolean},
    ) => {
      const isActiveElement = element === document.activeElement
      const containsButIsNotActiveElement = !isActiveElement && element.contains(document.activeElement)
      const isFirstNavigableColumn = columnId === firstNavigableColumnId
      const isLastNavigableColumn = columnId === lastNavigableColumnId

      if (containsButIsNotActiveElement) return

      /**
       * When the first or last column is
       * already focused, scroll it into view
       * in a way that ensures the non-navigable columns
       * get scrolled into view.
       *
       * For sticky positioned cells (such as roadmap), focusing an
       * element should not cause horizontal scrolling (should always use 'nearest'), as this causes the
       * roadmap date range to shift.
       */
      let inline: ScrollLogicalPosition = 'nearest'

      if (lastFocusCellElementView.current !== currentViewNumber) {
        lastFocusCellElementView.current = currentViewNumber

        if (!sticky) {
          // when switching views the first navigable cell (often the title cell in the first row) recieves focus
          // it should already be scrolled into view, so we don't need to scroll at this point
          return
        }
      } else if (isFirstNavigableColumn && isActiveElement && !sticky) {
        inline = 'end'
      } else if (isLastNavigableColumn && isActiveElement && !sticky) {
        inline = 'start'
      }

      element.focus({preventScroll: true})

      if (isSuspended) return

      if (!isWebkit()) {
        element.scrollIntoView({block: 'nearest', inline})
      } else if ('scrollIntoViewIfNeeded' in element && typeof element.scrollIntoViewIfNeeded === 'function') {
        // This is part of webkit only, but not part of the official standard.
        element.scrollIntoViewIfNeeded(false)
      }
    },
    [currentViewNumber, firstNavigableColumnId, lastNavigableColumnId, sticky],
  )

  return useMemo(() => {
    return {
      prepareRow: table.prepareRow,
      focusCellElement,
    }
  }, [focusCellElement, table.prepareRow])
}
