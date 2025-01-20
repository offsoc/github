import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import type {UpdateColumnIterationData} from '../../api/columns/contracts/api'
import type {Iteration} from '../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {getAllIterations} from '../../helpers/iterations'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import type {ColumnModel} from '../../models/column-model'
import {updateGroupMetadata} from '../memex-items/query-client-api/memex-groups'
import {useUpdateIterationConfiguration} from './use-update-iteration-configuration'

type UpdateColumnIterationTitleHookReturnType = {
  /**
   * Updates the title of an iteration for the respective column
   * @param column - the column to update
   * @param iterationData - the data to update the iteration title with
   * @param iterationData.id - the id of the iteration to update
   * @param iterationData.title - the new title of the iteration
   */
  updateColumnIterationTitle: (column: ColumnModel, iterationData: UpdateColumnIterationData) => Promise<void>
}

export const useUpdateColumnIterationTitle = (): UpdateColumnIterationTitleHookReturnType => {
  const {updateIterationConfiguration} = useUpdateIterationConfiguration()
  const {memex_table_without_limits, memex_mwl_server_group_order} = useEnabledFeatures()
  const queryClient = useQueryClient()

  const updateColumnIterationTitle = useCallback(
    async (column: ColumnModel, iterationData: UpdateColumnIterationData) => {
      if (column.dataType !== MemexColumnDataType.Iteration) {
        return
      }
      const allIterations = getAllIterations(column)
      const iteration = allIterations.find(i => i.id === iterationData.id)

      if (!iteration || !column.settings.configuration) {
        return
      }

      iteration.title = iterationData.name
      const {iterations, completedIterations} = column.settings.configuration

      if (memex_table_without_limits && memex_mwl_server_group_order) {
        const newGroupMetadata: Iteration = {
          ...iteration,
          ...iterationData,
          titleHtml: iterationData.name ?? iteration.titleHtml,
        }
        updateGroupMetadata(queryClient, newGroupMetadata, iterationData.name)
      }

      await updateIterationConfiguration(column, {iterations, completedIterations})
    },
    [memex_mwl_server_group_order, memex_table_without_limits, queryClient, updateIterationConfiguration],
  )

  return {updateColumnIterationTitle}
}
