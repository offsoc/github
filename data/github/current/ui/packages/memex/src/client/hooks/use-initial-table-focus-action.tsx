import {useEffect, useRef, useState} from 'react'
import type {TableInstance} from 'react-table'

import {FILTER_BAR_INPUT_ID} from '../components/filter-bar/raw-filter-input'
import {isDragDropColumn} from '../components/react_table/column-ids'
import {focusCell, focusOmnibar, type TableFocus} from '../components/react_table/navigation'
import type {SetFocusStateAction} from '../navigation/context'
import {useViews} from './use-views'

type SetTableFocusAction = SetFocusStateAction<TableFocus>

function getFocusFirstCellAction<D extends object>(table: TableInstance<D>) {
  const firstRow = table.flatRows.find(row => !row.isGrouped)

  const firstVisibleColumn = table.visibleColumns.find(column => !isDragDropColumn(column))

  if (firstVisibleColumn && firstRow) {
    return focusCell(firstRow.id, firstVisibleColumn.id)
  }

  return null
}

export function useReinitializeFocusStateEffect<D extends object>({
  currentViewNumber,
  setInitialFocalPoint,
  table,
  missingRequiredColumnData,
}: {
  currentViewNumber?: number
  setInitialFocalPoint: (action: SetTableFocusAction | null) => void
  table: TableInstance<D>
  missingRequiredColumnData: boolean
}) {
  const previouslyMissingRequiredColumnData = useRef(missingRequiredColumnData)
  const previousCurrentViewNumber = useRef(currentViewNumber)

  /**
   * This effect should only run
   * - When no missingRequiredColumnData
   * - When the view number changes
   * - when the memex is not new
   */
  useEffect(() => {
    // Don't run this if there's missing column data
    if (missingRequiredColumnData) return
    const wasPreviouslyMissingData = previouslyMissingRequiredColumnData.current && !missingRequiredColumnData
    const isViewNumberUnchanged = previousCurrentViewNumber.current === currentViewNumber

    // When we have a view that's unchanged, and we weren't missing data, skip running this
    if (isViewNumberUnchanged && !wasPreviouslyMissingData) return

    // Don't run this if we were missing data and the focus is on the filter bar
    // This is to prevent the focus from jumping to the first cell when
    // the user is filtering by a keyword and the column is hidden
    if (wasPreviouslyMissingData && document.activeElement?.id === FILTER_BAR_INPUT_ID) return

    setInitialFocalPoint(getFocusFirstCellAction(table))
  }, [missingRequiredColumnData, currentViewNumber, setInitialFocalPoint, table])

  useEffect(() => {
    previouslyMissingRequiredColumnData.current = missingRequiredColumnData
    previousCurrentViewNumber.current = currentViewNumber
  })
}

/**
 * A hook that tracks the initial focusable cell
 * for a given table, in state - re-evaluating
 * whenever the currentView.number changes
 */
export const useInitialTableFocusAction = <D extends object>(table: TableInstance<D>) => {
  const {currentView, missingRequiredColumnData} = useViews()

  const [initialFocalPoint, setInitialFocalPoint] = useState<SetTableFocusAction | null>(() => {
    return getFocusFirstCellAction(table) ?? focusOmnibar()
  })

  useReinitializeFocusStateEffect({
    currentViewNumber: currentView?.number,
    missingRequiredColumnData,
    setInitialFocalPoint,
    table,
  })

  return initialFocalPoint
}
