import {useCallback} from 'react'

import type {UpdateColumnIterationData} from '../../api/columns/contracts/api'
import type {UpdateSingleOption} from '../../api/columns/contracts/single-select'
import type {ColumnModel} from '../../models/column-model'
import {isAnySingleSelectColumnModel, isIterationColumnModel} from '../../models/column-model/guards'
import {useUpdateColumnIterationTitle} from './use-update-column-iteration-title'
import {useUpdateOptions} from './use-update-options'

export type VerticalGroupColumnData = UpdateSingleOption | UpdateColumnIterationData

type UpdateVerticalGroupHookReturnType = {
  /**
   * Updates the vertical group's configuration
   * - if the data type is `SingleSelect` it updates option details
   * - otherwise, if the data type is `Iteration` it updates the iteration title
   * @param column    - the column to update
   * @param data      - the vertical group configuration to update the column with
   * @param localOnly - whether to update the column in the local state only
   */
  updateVerticalGroup: (column: ColumnModel, data: VerticalGroupColumnData, localOnly?: boolean) => Promise<void>
}

export const useUpdateVerticalGroup = (): UpdateVerticalGroupHookReturnType => {
  const {updateColumnOption} = useUpdateOptions()
  const {updateColumnIterationTitle} = useUpdateColumnIterationTitle()

  const updateVerticalGroup = useCallback(
    async (column: ColumnModel, data: VerticalGroupColumnData, localOnly = false) => {
      if (isAnySingleSelectColumnModel(column)) {
        return updateColumnOption(column, data, localOnly)
      }

      if (isIterationColumnModel(column)) {
        return updateColumnIterationTitle(column, data as UpdateColumnIterationData)
      }
    },
    [updateColumnIterationTitle, updateColumnOption],
  )

  return {updateVerticalGroup}
}
