import {useCallback} from 'react'

import type {ColumnModel} from '../../models/column-model'
import {useColumnsStableContext} from './use-columns-stable-context'

type FindColumnByNameHookReturnType = {
  /**
   * Looks up a ColumnModel by its name
   * @param columnId The name of the ColumnModel to find
   */
  findColumnByName: (columnName: string) => ColumnModel | undefined
}

export const useFindColumnByName = (): FindColumnByNameHookReturnType => {
  const {allColumnsRef} = useColumnsStableContext()

  const findColumnByName = useCallback(
    (columnName: string) => {
      return allColumnsRef.current.find((c: ColumnModel) => c.name.toLowerCase() === columnName.toLowerCase())
    },
    [allColumnsRef],
  )

  return {findColumnByName}
}
