import {useCallback} from 'react'

import type {ColumnModel} from '../../models/column-model'
import {useColumnsStableContext} from './use-columns-stable-context'

type FindColumnHookReturnType = {
  /**
   * Looks up a ColumnModel by its id
   * @param columnId The id of the ColumnModel to find
   */
  findColumn: (columnId: number | string) => ColumnModel | undefined
  /**
   * Looks up a ColumnModel index by its id
   * @param columnId The id of the ColumnModel to find
   */
  findColumnIndex: (columnId: number | string) => number
}

/**
 * Important:
 * This hook uses the `allColumnsRef` from the `ColumnsStableContext` -
 * a change to the value of the current object tracked by the ref _will not_ trigger a re-render of the component consuming this hook.
 * If you need a stateful way to find a column, please consider using the `useAllColumns` hook instead.
 */
export const useFindColumn = (): FindColumnHookReturnType => {
  const {allColumnsRef} = useColumnsStableContext()

  const findColumn = useCallback(
    (columnId: number | string) => {
      return allColumnsRef.current.find((c: ColumnModel) => `${c.id}` === `${columnId}`)
    },
    [allColumnsRef],
  )

  const findColumnIndex = useCallback(
    (columnId: string | number) => {
      return allColumnsRef.current.findIndex((c: ColumnModel) => `${c.id}` === `${columnId}`)
    },
    [allColumnsRef],
  )

  return {findColumn, findColumnIndex}
}
