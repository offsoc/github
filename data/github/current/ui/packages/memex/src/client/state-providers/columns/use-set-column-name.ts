import {useCallback} from 'react'

import {apiUpdateColumn} from '../../api/columns/api-update-column'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {type ColumnModel, createColumnModel} from '../../models/column-model'
import {useUpdateColumns} from './use-update-columns'

type SetColumnNameHookReturnType = {
  /**
   * Updates the column name
   * (without requesting any changes on the server).
   * This is useful for optimistic updates and rollbacks.
   *
   * @param name - new name for the column
   * @returns whether or not the column name was updated with the new incoming name
   */
  setName: (column: ColumnModel, newName: string) => boolean
  /**
   * Optimistically updates the name property of a user-defined column on the
   * client, then sends a name update request to the server.
   *
   * @param column  - the column to update
   * @param newName - the new name for the column
   */
  updateName: (column: ColumnModel, newName: string) => Promise<void>
}

export const useSetColumnName = (): SetColumnNameHookReturnType => {
  const {updateColumnEntry} = useUpdateColumns()

  const setName = useCallback(
    (column: ColumnModel, newName: string) => {
      if (!column.userDefined || column.name === newName) {
        return false
      }

      updateColumnEntry(createColumnModel({...column, name: newName}))

      return true
    },
    [updateColumnEntry],
  )

  const updateName = useCallback(
    async (column: ColumnModel, newName: string) => {
      if (!setName(column, newName)) {
        return
      }

      cancelGetAllMemexData()
      await apiUpdateColumn({memexProjectColumnId: column.id, name: newName})
    },
    [setName],
  )

  return {setName, updateName}
}
