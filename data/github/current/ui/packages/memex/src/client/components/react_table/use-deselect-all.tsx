import {useCallback} from 'react'

import {useTableCellBulkSelectionActions} from './table-cell-bulk-selection'
import {useTableDispatch} from './table-provider'
import {deselectAllRows} from './use-deselect-all-rows'

/**
 * Deselect all rows and cells.
 */
export const useDeselectAll = () => {
  const bulkSelectActions = useTableCellBulkSelectionActions()
  const dispatch = useTableDispatch()

  return useCallback(
    (clearBulkSelection = true) => {
      if (clearBulkSelection) {
        bulkSelectActions?.clearSelection()
      }
      dispatch(deselectAllRows())
    },
    [bulkSelectActions, dispatch],
  )
}
