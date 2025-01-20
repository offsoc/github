import {useCallback} from 'react'

import type {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import type {UpdateOptions} from '../api/columns/contracts/single-select'
import {SettingsFieldOptionMainUI, SettingsFieldOptionSave} from '../api/stats/contracts'
import type {ColumnModelForDataType} from '../models/column-model'
import {useUpdateOptions} from '../state-providers/columns/use-update-options'
import {usePostStats} from './common/use-post-stats'
import {useApiRequest} from './use-api-request'

export const useUpdateColumnOptions = (
  column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
  options: UpdateOptions,
) => {
  const {postStats} = usePostStats()
  const {updateOptions} = useUpdateOptions()

  const {perform: updateColumnOptions, status: updateColumnOptionsStatus} = useApiRequest({
    request: useCallback(async () => {
      await updateOptions(column, options)

      postStats({
        name: SettingsFieldOptionSave,
        ui: SettingsFieldOptionMainUI,
        memexProjectColumnId: column.id,
      })
    }, [column, options, postStats, updateOptions]),
    showErrorToast: false,
  })

  return {updateColumnOptions, updateColumnOptionsStatus}
}
