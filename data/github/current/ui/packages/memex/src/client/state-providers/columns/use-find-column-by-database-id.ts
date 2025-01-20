import {useCallback} from 'react'

import type {ColumnModel} from '../../models/column-model'
import {useColumnsStableContext} from './use-columns-stable-context'

export type FindColumnByDatabaseIdHookReturnType = {
  /**
   * Looks up a ColumnModel by its database id
   * @param columnId The database id of the ColumnModel to find
   */
  findColumnByDatabaseId: (columnId: number) => ColumnModel | undefined
}

export const useFindColumnByDatabaseId = (): FindColumnByDatabaseIdHookReturnType => {
  const {allColumnsRef} = useColumnsStableContext()

  const findColumnByDatabaseId = useCallback(
    (databaseId: number) => {
      return allColumnsRef.current.find(col => col.databaseId === databaseId)
    },
    [allColumnsRef],
  )

  return {findColumnByDatabaseId}
}
