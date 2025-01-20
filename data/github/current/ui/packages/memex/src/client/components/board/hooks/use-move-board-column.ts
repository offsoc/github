import {useCallback} from 'react'

import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../../models/column-model'
import {useUpdateOptions} from '../../../state-providers/columns/use-update-options'

export const useMoveBoardColumn = (field: ColumnModel | undefined) => {
  const {moveColumnOption} = useUpdateOptions()

  const moveColumn = useCallback(
    async (optionId: string, previousColumnId: string, side: 'before' | 'after') => {
      if (field?.dataType !== MemexColumnDataType.SingleSelect) {
        return
      }
      // Trying to move a column to the same position
      if (optionId === previousColumnId) return

      const currentIndex = field.settings.options.findIndex(o => o.id === optionId) + 1
      const indexOfPreviousColumn = field.settings.options.findIndex(o => o.id === previousColumnId) + 1

      // TODO: Normally, position on server is 1-indexed, but we have our
      // hard-coded `no_vertical_group` column which offsets this for now. In the
      // future, we will need to increase each of these indices by one when we
      // no longer have `no_vertical_group` in our array.
      let position = side === 'before' ? indexOfPreviousColumn : indexOfPreviousColumn + 1

      if (currentIndex < indexOfPreviousColumn) {
        // if we're moving the column to the right, we need to account for the fact that the item we're moving shouldn't be factored
        // into the new position, so it needs to be one less.
        position--
      }

      await moveColumnOption(field, {
        id: optionId,
        position: Math.max(position, 1),
      })
    },
    [field, moveColumnOption],
  )

  return {moveColumn}
}
