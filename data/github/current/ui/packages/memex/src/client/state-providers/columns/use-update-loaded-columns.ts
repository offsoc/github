import {useCallback} from 'react'

import type {MemexProjectColumnId} from '../../api/columns/contracts/memex-column'
import {useColumnsStableContext} from './use-columns-stable-context'

type UpdateLoadedColumnsHookReturnType = {
  /**
   * Adds a particular column to our list of columns which have been loaded
   *
   * @param columnId The column id which was received from the server and should
   *                 be marked as "loaded" in the client.
   */
  updateLoadedColumns: (columnId: MemexProjectColumnId) => void
}

export const useUpdateLoadedColumns = (): UpdateLoadedColumnsHookReturnType => {
  const {addLoadedFieldId} = useColumnsStableContext()
  const updateLoadedColumns = useCallback(
    (columnId: MemexProjectColumnId) => {
      addLoadedFieldId(columnId)
    },
    [addLoadedFieldId],
  )

  return {updateLoadedColumns}
}
