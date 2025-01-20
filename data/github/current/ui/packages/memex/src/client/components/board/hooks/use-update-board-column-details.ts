import {useCallback} from 'react'

import {useApiRequest} from '../../../hooks/use-api-request'
import type {ColumnModel} from '../../../models/column-model'
import {
  useUpdateVerticalGroup,
  type VerticalGroupColumnData,
} from '../../../state-providers/columns/use-update-vertical-group'

/**
 * Update the option/iteration that powers the column.
 */
export const useUpdateBoardColumnDetails = (field: ColumnModel | undefined) => {
  const {updateVerticalGroup} = useUpdateVerticalGroup()

  const request = useCallback(
    async (updatedDetails: VerticalGroupColumnData) => {
      if (!field) {
        return
      }

      await updateVerticalGroup(field, updatedDetails)
    },
    [field, updateVerticalGroup],
  )
  const rollback = useCallback(
    (rollbackDetails: VerticalGroupColumnData) => {
      if (!field) {
        return
      }

      updateVerticalGroup(field, rollbackDetails, true)
    },
    [field, updateVerticalGroup],
  )

  const {perform: updateColumnDetails} = useApiRequest({request, rollback})

  return {updateColumnDetails}
}
