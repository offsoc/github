import {useCallback} from 'react'

import type {MemexColumn} from '../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../models/column-model'
import {buildColumnModels} from './columns-state-provider'
import {useColumnsStableContext} from './use-columns-stable-context'
import {useFindColumn} from './use-find-column'

type UpdateColumnsHookReturnType = {
  /**
   * Updates properties of existing column models and creates new instances for new columns, based on incoming data
   * @param incomingColumns A list of the new state of the projects columns - will be converted to ColumnModels
   */
  updateColumns: (incomingColumns: Array<MemexColumn>) => void
  /**
   * Updates an entry in the columns state
   * @param newColumn - the next state of a column in the list of the projects columns
   */
  updateColumnEntry: (newColumn: ColumnModel) => void
}

export const useUpdateColumns = (): UpdateColumnsHookReturnType => {
  const {setAllColumns, allColumnsRef} = useColumnsStableContext()
  const {findColumnIndex} = useFindColumn()

  const updateColumns = useCallback(
    (incomingColumns: Array<MemexColumn>) => {
      const nextColumns = buildColumnModels(incomingColumns)
      setAllColumns(nextColumns)
    },
    [setAllColumns],
  )

  const updateColumnEntry = useCallback(
    (newColumn: ColumnModel) => {
      const columnIndex = findColumnIndex(newColumn.id)
      if (columnIndex === -1) {
        return
      }

      const newColumns = [...allColumnsRef.current]
      newColumns[columnIndex] = newColumn

      setAllColumns(newColumns)
    },
    [allColumnsRef, findColumnIndex, setAllColumns],
  )

  return {updateColumns, updateColumnEntry}
}
