import isEqual from 'lodash-es/isEqual'
import {useCallback, useState} from 'react'

import {apiUpdateColumn} from '../../api/columns/api-update-column'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {ProgressConfiguration} from '../../api/columns/contracts/progress'
import {cancelGetAllMemexData} from '../../api/memex/api-get-all-memex-data'
import {CommitState} from '../../hooks/use-autosave'
import {type ColumnModel, createColumnModel} from '../../models/column-model'
import {useUpdateColumns} from './use-update-columns'

type UpdateColumnConfigurationHookReturnType = {
  /**
   * Optimistically updates the settings.progressConfiguration properties on the
   * client, then sends the configuration update request to the server.
   *
   * @param column  - the column to update
   * @param newConfiguration - the new configuration for the column
   */
  updateProgressConfiguration: (column: ColumnModel, newConfiguration: ProgressConfiguration) => Promise<void>
  commitState: CommitState
}

export const useUpdateProgressConfiguration = (): UpdateColumnConfigurationHookReturnType => {
  const {updateColumnEntry} = useUpdateColumns()
  const [commitState, setCommitState] = useState<CommitState>(CommitState.None)

  const setProgressConfiguration = useCallback(
    (column: ColumnModel, newConfiguration: ProgressConfiguration) => {
      if (column.dataType !== MemexColumnDataType.SubIssuesProgress) {
        return
      }

      if (isEqual(column.settings.progressConfiguration, newConfiguration)) {
        return false
      }

      updateColumnEntry(createColumnModel({...column, settings: {progressConfiguration: newConfiguration}}))

      return true
    },
    [updateColumnEntry],
  )

  const rollbackConfiguration = useCallback(
    (column: ColumnModel) => {
      updateColumnEntry(createColumnModel(column))
    },
    [updateColumnEntry],
  )

  const updateProgressConfiguration = useCallback(
    async (column: ColumnModel, newConfiguration: ProgressConfiguration) => {
      if (!setProgressConfiguration(column, newConfiguration)) {
        return
      }
      try {
        cancelGetAllMemexData()
        const response = await apiUpdateColumn({
          memexProjectColumnId: column.id,
          settings: {progressConfiguration: newConfiguration},
        })

        setCommitState(CommitState.Successful)

        setTimeout(() => {
          setCommitState(CommitState.None)
        }, 3000)

        // Despite optimistically updating prior to the server persistence, we still want to update with the latest state from the server when returned
        if (response.memexProjectColumn.settings?.progressConfiguration) {
          setProgressConfiguration(
            createColumnModel({...response.memexProjectColumn}),
            response.memexProjectColumn.settings?.progressConfiguration,
          )
        }
      } catch (e) {
        setCommitState(CommitState.Failed)
        rollbackConfiguration(column)
      }
    },
    [setProgressConfiguration, rollbackConfiguration],
  )

  return {updateProgressConfiguration, commitState}
}
