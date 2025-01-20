import {useCallback} from 'react'

import type {Iteration} from '../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {removeIteration} from '../../helpers/iteration-builder'
import {findVerticalGroupById} from '../../helpers/vertical-group'
import type {ColumnModel} from '../../models/column-model'
import {useUpdateIterationConfiguration} from './use-update-iteration-configuration'

type DestroyColumnIterationHookReturnType = {
  /**
   * destroys an iteration
   * @param column - the column to update
   * @param data   - the iteration to destroy
   */
  destroyColumnIteration: (column: ColumnModel, iterationId: string) => Promise<void>
}

export const useDestroyColumnIteration = (): DestroyColumnIterationHookReturnType => {
  const {updateIterationConfiguration} = useUpdateIterationConfiguration()

  const destroyColumnIteration = useCallback(
    async (column: ColumnModel, iterationId: string) => {
      if (column.dataType !== MemexColumnDataType.Iteration) {
        return
      }

      // Determine if the iteration is completed or not
      const iteration = findVerticalGroupById(column, iterationId) as Iteration
      if (!iteration || !column.settings.configuration) {
        return
      }

      const newConfigurationState = removeIteration(column.settings.configuration, iteration)
      await updateIterationConfiguration(column, newConfigurationState)
    },
    [updateIterationConfiguration],
  )

  return {destroyColumnIteration}
}
