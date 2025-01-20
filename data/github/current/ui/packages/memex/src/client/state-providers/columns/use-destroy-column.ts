import {useCallback} from 'react'

import {apiDestroyColumn} from '../../api/columns/api-destroy-column'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {useColumnsStableContext} from './use-columns-stable-context'
import {useFindColumn} from './use-find-column'

type DestroyColumnHookReturnType = {
  /**
   * Removes the column locally and makes a request to remove it from the project on the server
   * @param columnId The id of the field to be deleted
   */
  destroyColumn: (columnId: string) => Promise<void>
}

export const useDestroyColumn = (): DestroyColumnHookReturnType => {
  const {setAllColumns, allColumnsRef} = useColumnsStableContext()
  const {findColumn} = useFindColumn()

  const destroyColumn = useCallback(
    async (columnId: string) => {
      const column = findColumn(columnId)
      if (column && column.userDefined) {
        const nextColumns = allColumnsRef.current.filter(m => m.id !== column.id)
        setAllColumns(nextColumns)
        cancelGetAllMemexData()
        await apiDestroyColumn({memexProjectColumnId: column.id})
      }
    },
    [allColumnsRef, setAllColumns, findColumn],
  )

  return {destroyColumn}
}
