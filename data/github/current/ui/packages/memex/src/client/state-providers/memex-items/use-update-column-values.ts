import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {IColumnWithItems} from '../../api/columns/contracts/column-with-items'
import type {MemexColumnData} from '../../api/columns/contracts/storage'
import {useSetColumnValue} from '../column-values/use-set-column-value'
import {useUpdateLoadedColumns} from '../columns/use-update-loaded-columns'
import {updateMemexItemsForColumnInQueryClient} from './query-client-api/memex-items'
import {useFindMemexItem} from './use-find-memex-item'

type UpdateColumnValuesHookReturnType = {
  /**
   * Updates the list of items' column values for a single column. This method will only
   * call updateColumnValue on item models with data returned from the server.
   * For scenarios (like new columns being loaded), where we want to call updateColumnValue
   * for all items (even just with a null value), use updateAllColumnValues instead.
   * @param columnWithItems A column with a list of column values for items which
   * should be updated.
   */
  updateColumnValues: (columnWithItems: IColumnWithItems) => void

  /**
   * Updates the list of items' column values for a single column. This method will call
   * updateColumnValue for this column for _all_ items in the project - not just those returned with data in this
   * parameter by the server. This is useful in the scenario where we're loading data for a column
   * and want to trigger a re-render for a cell regardless of whether or not we actually have new data
   * for that cell. Previously, we were able to use the observable loadedColumns value on ColumnsContext
   * for this purpose, however, we'd like to move away from that being stateful and causing a re-render.
   * @param columnWithItems
   */
  updateAllColumnValues: (columnWithItems: IColumnWithItems) => void
}

export const useUpdateColumnValues = (): UpdateColumnValuesHookReturnType => {
  const {updateLoadedColumns} = useUpdateLoadedColumns()
  const {findMemexItem} = useFindMemexItem()
  const {setColumnValue} = useSetColumnValue()
  const queryClient = useQueryClient()

  const updateColumnValues = useCallback(
    (columnWithItems: IColumnWithItems) => {
      updateLoadedColumns(columnWithItems.id)

      if (columnWithItems.memexProjectColumnValues) {
        for (const item of columnWithItems.memexProjectColumnValues) {
          const itemModel = findMemexItem(item.memexProjectItemId)

          if (itemModel) {
            setColumnValue(itemModel, {
              memexProjectColumnId: columnWithItems.id,
              value: item.value,
            } as MemexColumnData)
          }
        }
      }
    },
    [findMemexItem, setColumnValue, updateLoadedColumns],
  )

  const updateAllColumnValues = useCallback(
    (columnWithItems: IColumnWithItems) => {
      updateLoadedColumns(columnWithItems.id)
      updateMemexItemsForColumnInQueryClient(queryClient, columnWithItems)
    },
    [queryClient, updateLoadedColumns],
  )

  return {updateColumnValues, updateAllColumnValues}
}
