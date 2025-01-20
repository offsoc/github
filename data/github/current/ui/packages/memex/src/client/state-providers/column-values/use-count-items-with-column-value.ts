import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {MemexProjectColumnId} from '../../api/columns/contracts/memex-column'
import {getMemexItemModelsFromQueryClient} from '../memex-items/query-client-api/memex-items'

type GetCountOfItemsWithValueHookReturnType = {
  /**
   * Get the number of values associated with this field that are stored in
   * the client
   */
  getCountOfItemsWithColumnValue: (columnId: MemexProjectColumnId) => number
}

/**
 * This hook computes the number of items in the project which have a value set
 * for the given column, to display when confirming the field can be deleted,
 * which will cause these values to be orphaned and removed on the server
 */
export const useCountItemsWithColumnValue = (): GetCountOfItemsWithValueHookReturnType => {
  const queryClient = useQueryClient()

  const getCountOfItemsWithColumnValue = useCallback(
    (columnId: MemexProjectColumnId) => {
      const itemsWithColumnValue = getMemexItemModelsFromQueryClient(queryClient).filter(
        row => row.columns[columnId] != null,
      )
      return itemsWithColumnValue.length
    },
    [queryClient],
  )

  return {
    getCountOfItemsWithColumnValue,
  }
}
