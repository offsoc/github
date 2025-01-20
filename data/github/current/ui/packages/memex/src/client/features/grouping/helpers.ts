import invariant from 'tiny-invariant'

import type {UpdateColumnValueAction} from '../../api/columns/contracts/domain'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {ColumnData} from '../../api/columns/contracts/storage'
import {assertNever} from '../../helpers/assert-never'
import type {ColumnModel} from '../../models/column-model'
import type {FieldGrouping} from './types'

/**
 * Create an update object for the given group, if necessary.
 *
 * @returns `undefined` if this group is the "empty" group, otherwise an update
 *          action object that can be sent to the backend.
 */
export function getDraftItemUpdateColumnAction(sourceObject: FieldGrouping): UpdateColumnValueAction | undefined {
  if (sourceObject.kind === 'empty') {
    return undefined
  }
  invariant(sourceObject.dataType !== MemexColumnDataType.Labels, 'Drag and drop not yet supported for labels')

  switch (sourceObject.dataType) {
    case MemexColumnDataType.Iteration:
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value: {id: sourceObject.value.iteration.id},
      }
    case MemexColumnDataType.SingleSelect:
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value: {id: sourceObject.value.option.id},
      }
    case MemexColumnDataType.Text:
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value: sourceObject.value.text.raw,
      }
    case MemexColumnDataType.Number: {
      const value = sourceObject.value.number
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value: {value: value.value},
      }
    }
    case MemexColumnDataType.Date: {
      const value = sourceObject.value.date
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value,
      }
    }
    case MemexColumnDataType.Milestone: {
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.value,
      }
    }
    case MemexColumnDataType.IssueType: {
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.value,
      }
    }
    case MemexColumnDataType.ParentIssue: {
      // draft issues will have this value omitted in useBuildItemPayloadFromFilter
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.value,
      }
    }
    case MemexColumnDataType.Repository: {
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.value,
      }
    }
    case MemexColumnDataType.Assignees: {
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.value,
      }
    }
    case MemexColumnDataType.TrackedBy: {
      // draft issues will have this value omitted in useBuildItemPayloadFromFilter
      return {
        dataType: sourceObject.dataType,
        value: [sourceObject.value],
        appendOnly: false,
      }
    }
    default: {
      assertNever(sourceObject)
    }
  }
}

type UpdateOptions = {memex_group_by_multi_value_changes?: boolean; ctrlKeyPressed?: boolean}

/**
 * Create an update payload for a given group which we can apply to a project
 * item
 *
 * @param sourceObject the group a project item is being added to
 * @param columnData the column values of the row being added to the group
 * @param options settings to control update behaviour
 *
 * @returns an update payload for the provided group, which can be sent to the backend
 */
export function createUpdateForGroup(
  sourceObject: FieldGrouping,
  columnData: ColumnData,
  options: UpdateOptions = {memex_group_by_multi_value_changes: false, ctrlKeyPressed: false},
  sourceGrouping: FieldGrouping | null = null,
): UpdateColumnValueAction {
  invariant(sourceObject.dataType !== MemexColumnDataType.Labels, 'Drag and drop not yet supported for labels')
  switch (sourceObject.dataType) {
    case MemexColumnDataType.Iteration: {
      const value = sourceObject.kind === 'group' ? {id: sourceObject.value.iteration.id} : undefined
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value,
      }
    }
    case MemexColumnDataType.SingleSelect: {
      const value = sourceObject.kind === 'group' ? {id: sourceObject.value.option.id} : undefined
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value,
      }
    }
    case MemexColumnDataType.Text: {
      const value = sourceObject.kind === 'group' ? sourceObject.value.text.raw : undefined
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value,
      }
    }
    case MemexColumnDataType.Number: {
      const value = sourceObject.kind === 'group' ? sourceObject.value.number : undefined
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value,
      }
    }
    case MemexColumnDataType.Date: {
      const value = sourceObject.kind === 'group' ? sourceObject.value.date : undefined
      return {
        dataType: sourceObject.dataType,
        memexProjectColumnId: sourceObject.value.columnId,
        value,
      }
    }
    case MemexColumnDataType.Milestone: {
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.kind === 'group' ? sourceObject.value : undefined,
      }
    }
    case MemexColumnDataType.IssueType: {
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.kind === 'group' ? sourceObject.value : undefined,
      }
    }
    case MemexColumnDataType.ParentIssue: {
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.kind === 'group' ? sourceObject.value : undefined,
      }
    }
    case MemexColumnDataType.Repository: {
      return {
        dataType: sourceObject.dataType,
        value: sourceObject.kind === 'group' ? sourceObject.value : undefined,
      }
    }
    case MemexColumnDataType.Assignees: {
      const value = sourceObject.kind === 'group' ? sourceObject.value : []

      if (value.length > 0 && options.memex_group_by_multi_value_changes) {
        const existingAssignees = columnData.Assignees || []

        for (const assignee of existingAssignees) {
          const found = value.find(v => v.id === assignee.id)
          if (!found) {
            value.push(assignee)
          }
        }
      }

      return {
        dataType: sourceObject.dataType,
        value,
      }
    }
    case MemexColumnDataType.TrackedBy: {
      const value = sourceObject.kind === 'group' ? [sourceObject.value] : []

      const appendOnly = false

      // Drag and drop for an issue will always include all existing parents for an issue
      // In addition to the one it is dragged to
      // If the ctrl key is pressed, the "source" parent i.e. the group from which the parent is dragged
      // will be preserved. Otherwise, that parent is removed
      if (value.length > 0) {
        const existingTrackedBy = columnData['Tracked by'] || []

        for (const trackedBy of existingTrackedBy) {
          const found = value.find(v => v.key.itemId === trackedBy.key.itemId)
          const sourceGroupFound =
            sourceGrouping?.dataType === MemexColumnDataType.TrackedBy &&
            sourceGrouping?.kind === 'group' &&
            sourceGrouping?.value.key.itemId === trackedBy.key.itemId

          if (!found) {
            // If this parent is the group from which the item was dragged
            // and the control key was not pressed
            // skip over it
            if (sourceGroupFound && !options.ctrlKeyPressed) {
              continue
            }
            // Retain existing parents in addtion to the target value
            value.push(trackedBy)
          }
        }
      }

      return {
        dataType: sourceObject.dataType,
        value,
        appendOnly,
      }
    }
    default: {
      assertNever(sourceObject)
    }
  }
}

/**
 * Create an "empty" group from the given column model
 *
 * @param column a column model associated with the project
 *
 * @returns a `GroupingContext` object if the field supports grouping, or `undefined`
 */
export function createEmptyGroup(column: ColumnModel): FieldGrouping | undefined {
  switch (column.dataType) {
    // system columns as they can only ever have one id
    case MemexColumnDataType.Assignees:
    case MemexColumnDataType.Milestone:
    case MemexColumnDataType.Repository:
    case MemexColumnDataType.TrackedBy:
    case MemexColumnDataType.Labels:
    case MemexColumnDataType.IssueType:
    case MemexColumnDataType.ParentIssue:
      return {
        dataType: column.dataType,
        kind: 'empty',
        value: {
          titleHtml: `No ${column.name}`,
        },
      }
    // custom columns as they can be created multiple times so we need to get the numeric id
    // to know where to assign the group's empty value
    case MemexColumnDataType.Date:
    case MemexColumnDataType.Iteration:
    case MemexColumnDataType.Number:
    case MemexColumnDataType.Text:
      return {
        dataType: column.dataType,
        kind: 'empty',
        value: {
          titleHtml: `No ${column.name}`,
          columnId: column.id,
        },
      }
    case MemexColumnDataType.SingleSelect:
      /**
       * We have to handle this separately since the column id could
       * be status for this type, while others are only numbers
       */
      return {
        dataType: column.dataType,
        kind: 'empty',
        value: {
          titleHtml: `No ${column.name}`,
          columnId: column.id,
        },
      }
  }
}
