import {useCallback} from 'react'

import {omit} from '../../../utils/omit'
import {apiUpdateColumn} from '../../api/columns/api-update-column'
import type {UpdateIterationConfiguration} from '../../api/columns/contracts/api'
import type {Iteration, IterationConfiguration} from '../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {type ColumnModel, createColumnModel} from '../../models/column-model'
import {useUpdateColumnValues} from '../memex-items/use-update-column-values'
import {useUpdateColumns} from './use-update-columns'

type UpdateIterationConfigurationHookReturnType = {
  /**
   * Updates the iteration configuration
   * @param column  - the column to update
   * @param changes - the iteration configuration to update the column with
   */
  updateIterationConfiguration: (column: ColumnModel, changes: Partial<IterationConfiguration>) => Promise<void>
}

export const useUpdateIterationConfiguration = (): UpdateIterationConfigurationHookReturnType => {
  const {updateColumnValues} = useUpdateColumnValues()
  const {updateColumnEntry} = useUpdateColumns()

  const updateIterationConfiguration = useCallback(
    async (column: ColumnModel, changes: Partial<IterationConfiguration>) => {
      if (column.dataType !== MemexColumnDataType.Iteration) {
        return
      }

      const configuration = column.settings.configuration

      if (!configuration) {
        // no existing configuration to update - this is the bad place
        return
      }

      const iterations = changes.iterations || configuration.iterations
      const completedIterations = changes.completedIterations || configuration.completedIterations

      const newConfiguration: UpdateIterationConfiguration = {
        duration: configuration.duration,
        startDay: configuration.startDay,
        ...changes,
        // we don't need to send titleHtml as the server will handle this for us
        iterations: omitIterationTitleHtml(iterations),
        completedIterations: omitIterationTitleHtml(completedIterations),
      }

      cancelGetAllMemexData()
      const {memexProjectColumn} = await apiUpdateColumn({
        memexProjectColumnId: column.id,
        settings: {
          configuration: newConfiguration,
        },
      })

      if (memexProjectColumn?.settings) {
        // destructure this field while it's defined so the callback has enough
        // context to avoid the wrath of the typechecker
        const {settings} = memexProjectColumn
        updateColumnEntry(createColumnModel({...column, settings}))
      }

      if (memexProjectColumn) {
        // this is not populated from the backend currently, but should contain
        // updated values when the server has reordered or removed values
        updateColumnValues(memexProjectColumn)
      }
    },
    [updateColumnEntry, updateColumnValues],
  )

  return {updateIterationConfiguration}
}

const TITLE_OMIT_FIELD = 'titleHtml'

function omitIterationTitleHtml(iterations: Array<Iteration>): Array<Omit<Iteration, 'titleHtml'>> {
  return iterations.map(i => omit(i, [TITLE_OMIT_FIELD]))
}
