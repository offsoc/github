import {useCallback} from 'react'

import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {NewOption} from '../../../api/columns/contracts/single-select'
import {useApiRequest} from '../../../hooks/use-api-request'
import type {ColumnModel} from '../../../models/column-model'
import {useUpdateOptions} from '../../../state-providers/columns/use-update-options'

export const useAddBoardColumn = (field: ColumnModel | undefined) => {
  const {addColumnOption} = useUpdateOptions()

  const request = useCallback(
    async (option: NewOption) => {
      if (field?.dataType !== MemexColumnDataType.SingleSelect) {
        // for now iteration fields are not initialized through this flow, and
        // the user can edit the field name of an iteration with the
        // useRenameBoardColumn hook
        return
      }

      await addColumnOption(field, option)
    },
    [addColumnOption, field],
  )
  const {perform: addColumn} = useApiRequest({request})

  return {addColumn}
}
