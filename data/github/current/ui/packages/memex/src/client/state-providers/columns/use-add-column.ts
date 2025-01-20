import {useCallback} from 'react'

import {apiCreateColumn} from '../../api/columns/api-create-column'
import type {MemexColumnCreateData} from '../../api/columns/contracts/api'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {type ColumnModel, createColumnModel} from '../../models/column-model'
import type {AddColumnRequest} from './columns-state-provider'
import {useColumnsStableContext} from './use-columns-stable-context'
import {useUpdateLoadedColumns} from './use-update-loaded-columns'

type AddColumnHookResponseType = {
  /** The created column from the backend, converted into a client-side model */
  newColumn: ColumnModel
}

type AddColumnHookReturnType = {
  /**
   * Create the new column on the server based on the required settings
   *
   * @param request initial column metadata
   *
   * @returns response including the new column from the server
   */
  addColumn: (request: AddColumnRequest) => Promise<AddColumnHookResponseType>
}

export const useAddColumn = (): AddColumnHookReturnType => {
  const {postStats} = usePostStats()
  const {setAllColumns, allColumnsRef} = useColumnsStableContext()
  const {updateLoadedColumns} = useUpdateLoadedColumns()

  const addColumn = useCallback(
    async (request: AddColumnRequest) => {
      const data: MemexColumnCreateData = {
        name: request.name,
        dataType: request.type,
        settings: request.settings,
      }

      cancelGetAllMemexData()
      const createColumnResponse = await apiCreateColumn({
        memexProjectColumn: data,
      })
      const newColumn = createColumnResponse.memexProjectColumn

      updateLoadedColumns(newColumn.id)

      const newColumnModel = createColumnModel(newColumn)

      const newColumnExists = allColumnsRef.current.findIndex(column => column.id === newColumn.id) > -1

      if (newColumnExists) {
        postStats({
          name: 'existing_column_found',
          id: newColumn.id,
        })
      }

      const newColumns = newColumnExists
        ? [...allColumnsRef.current.filter(column => column.id !== newColumn.id), newColumnModel]
        : [...allColumnsRef.current, newColumnModel]

      setAllColumns(newColumns)
      return {
        newColumn: newColumnModel,
      }
    },
    [updateLoadedColumns, allColumnsRef, setAllColumns, postStats],
  )

  return {addColumn}
}
