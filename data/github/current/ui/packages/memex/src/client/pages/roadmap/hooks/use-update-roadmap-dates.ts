import {useCallback, useMemo} from 'react'

import type {ServerDateValue} from '../../../api/columns/contracts/date'
import type {UpdateColumnValueAction} from '../../../api/columns/contracts/domain'
import type {Iteration, IterationValue} from '../../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import type {DateValue} from '../../../api/columns/contracts/storage'
import {ItemValueAdd, ItemValueEdit, type PostStatsRequest} from '../../../api/stats/contracts'
import {RoadmapDateFieldNone} from '../../../api/view/contracts'
import type {RoadmapColumn, TimeSpan} from '../../../helpers/roadmap-helpers'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useRoadmapSettings} from '../../../hooks/use-roadmap-settings'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useUpdateItemColumnValue} from '../../../state-providers/column-values/use-update-item-column-value'

type UpdateActionWithStats = {
  memexProjectColumnId: number
  action: UpdateColumnValueAction
  stats: PostStatsRequest
}

/**
 * Returns an UpdateActionWithStats object if the value is different from the current value.
 */
const getUpdateAction = (
  item: MemexItemModel,
  column: RoadmapColumn,
  value: Date | Iteration | undefined,
): UpdateActionWithStats | undefined => {
  if (column !== 'none' && typeof column.id === 'number') {
    const memexProjectColumnId = column.id
    const memexProjectItemId = item.id
    const dataType = column.dataType

    if (dataType === MemexColumnDataType.Iteration) {
      const iterationValue = value as IterationValue
      const currentValue = item.getCustomField<IterationValue>(memexProjectColumnId)
      const statName = currentValue ? ItemValueEdit : ItemValueAdd
      if (!currentValue || currentValue.id !== iterationValue?.id) {
        return {
          memexProjectColumnId,
          action: {dataType, memexProjectColumnId, value: iterationValue},
          stats: {payload: {name: statName, memexProjectColumnId, memexProjectItemId}},
        }
      }
    } else if (dataType === MemexColumnDataType.Date) {
      const dateValue: DateValue = {value: value as Date}
      const currentValue = item.getCustomField<ServerDateValue>(memexProjectColumnId)
      const currentDate = currentValue?.value ? new Date(currentValue.value) : undefined
      const statName = currentDate ? ItemValueEdit : ItemValueAdd
      if (!currentDate || currentDate.getTime() !== dateValue.value?.getTime()) {
        return {
          memexProjectColumnId,
          action: {dataType, memexProjectColumnId, value: dateValue},
          stats: {payload: {name: statName, memexProjectColumnId, memexProjectItemId}},
        }
      }
    }
  }
}

/**
 * Persists date/iteration updates made in the Roadmap view, and posts stats for the changes.
 */
export function useUpdateRoadmapDates() {
  const {updateMultipleSequentially} = useUpdateItemColumnValue()
  const {postStats} = usePostStats()

  const {
    dateFields: [column1 = RoadmapDateFieldNone, column2 = RoadmapDateFieldNone],
  } = useRoadmapSettings()

  const updateItemDates = useCallback(
    (item: MemexItemModel, timeSpan: TimeSpan) => {
      const uniqueColumnUpdates = new Map<number, UpdateActionWithStats>()
      const startUpdate = getUpdateAction(item, column1, timeSpan.startIteration || timeSpan.start)
      const endUpdate = getUpdateAction(item, column2, timeSpan.endIteration || timeSpan.end)

      if (startUpdate) uniqueColumnUpdates.set(startUpdate.memexProjectColumnId, startUpdate)
      if (endUpdate) uniqueColumnUpdates.set(endUpdate.memexProjectColumnId, endUpdate)

      const updates = Array.from(uniqueColumnUpdates.values()).map(update => update.action)
      const stats = Array.from(uniqueColumnUpdates.values()).map(update => update.stats)

      const updatePromise = updates.length > 0 ? updateMultipleSequentially(item, updates) : Promise.resolve()
      for (const stat of stats) postStats(stat.payload)
      return updatePromise
    },
    [column1, column2, postStats, updateMultipleSequentially],
  )

  return useMemo(() => ({updateItemDates}), [updateItemDates])
}
