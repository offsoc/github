import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {Label, User} from '../../api/common-contracts'
import {compareAscending, getAllIterations} from '../../helpers/iterations'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'
import {compareAssigneesInAscOrder, compareLabelsInAscOrder} from './group-sorting'
import type {GroupingMetadataWithSource} from './types'

export function getGroupValuesForSingleSelect(column: ColumnModel): Array<GroupingMetadataWithSource> {
  if (column.dataType !== MemexColumnDataType.SingleSelect) {
    return []
  }

  return column.settings.options.map(option => {
    return {
      value: option.id,
      sourceObject: {
        dataType: MemexColumnDataType.SingleSelect,
        kind: 'group',
        value: {option, columnId: column.id},
      },
    }
  })
}

export function getGroupValuesForIteration(column: ColumnModel): Array<GroupingMetadataWithSource> {
  if (column.dataType !== MemexColumnDataType.Iteration) {
    return []
  }

  return getAllIterations(column)
    .sort(compareAscending)
    .map(iteration => {
      return {
        value: iteration.id,
        sourceObject: {
          dataType: MemexColumnDataType.Iteration,
          kind: 'group',
          value: {iteration, columnId: column.id},
        },
      }
    })
}

export function getGroupValuesForAssignees(
  column: ColumnModel,
  allItems?: Readonly<Array<MemexItemModel>>,
): Array<GroupingMetadataWithSource> | undefined {
  if (column.dataType !== MemexColumnDataType.Assignees || !allItems) {
    return
  }

  const assignees = new Map<string, User>()

  for (const item of allItems) {
    for (const assignee of item.getAssignees()) {
      assignees.set(assignee.login, assignee)
    }
  }

  return Array.from(assignees.values())
    .sort(compareAssigneesInAscOrder)
    .map(assignee => {
      return {
        value: assignee.login,
        sourceObject: {
          dataType: MemexColumnDataType.Assignees,
          kind: 'group',
          value: [assignee],
        },
      }
    })
}

export function getGroupValuesForLabels(
  column: ColumnModel,
  allItems?: Readonly<Array<MemexItemModel>>,
): Array<GroupingMetadataWithSource> | undefined {
  if (column.dataType !== MemexColumnDataType.Labels || !allItems) {
    return
  }

  const labels = new Map<string, Label>()

  for (const item of allItems) {
    for (const label of item.getLabels()) {
      labels.set(label.name, label)
    }
  }

  return Array.from(labels.values())
    .sort(compareLabelsInAscOrder)
    .map(label => {
      return {
        value: label.name,
        sourceObject: {
          dataType: MemexColumnDataType.Labels,
          kind: 'group',
          value: label,
        },
      }
    })
}
