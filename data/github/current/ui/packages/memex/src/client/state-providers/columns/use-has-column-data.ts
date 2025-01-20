import {useCallback} from 'react'

import type {MemexProjectColumnId, SystemColumnId} from '../../api/columns/contracts/memex-column'
import {useColumnsStableContext} from './use-columns-stable-context'

type HasColumnDataHookReturnType = {
  /**
   * Queries the client-side to determine if a certain column has been loaded
   * @param columnId The id of a column that we want to see if data is loaded for
   * @return True if we have data for the column, otherwise false
   */
  hasColumnData: (columnId: number | SystemColumnId) => boolean
}

export const useHasColumnData = (): HasColumnDataHookReturnType => {
  const {loadedFieldIdsRef} = useColumnsStableContext()
  const hasColumnData = useCallback(
    (columnId: MemexProjectColumnId) => {
      return loadedFieldIdsRef.current.has(columnId)
    },
    [loadedFieldIdsRef],
  )

  return {hasColumnData}
}
