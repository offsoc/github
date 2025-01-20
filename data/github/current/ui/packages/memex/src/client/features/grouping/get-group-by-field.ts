import {MemexColumnDataType, type MemexProjectColumnId, SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../models/column-model'

/**
 * Locate the group by field based on the requested field id.
 * Currently only supports iteration and single-select fields, and will
 * fall back to status if no field id is provided, or if the field id
 * is incompatible with the allowed fields.
 *
 * @param compatibleColumns An array of fields that can be used for grouping
 * @param groupByColumnId The field id stored in memory or the URL
 *
 * @returns the id of the field, or SystemColumnId.Status as a fallback value
 *          if the field cannot be found (or the field is not able to be used
 *          for grouping)
 */
export function getGroupByFieldId(
  compatibleColumns: Array<ColumnModel>,
  groupByColumnId?: MemexProjectColumnId,
): number | typeof SystemColumnId.Status {
  if (groupByColumnId) {
    const column = compatibleColumns.find(c => c.id === groupByColumnId)
    if (column) {
      switch (column.dataType) {
        case MemexColumnDataType.SingleSelect:
        case MemexColumnDataType.Iteration:
          return column.id
      }
    }
  }
  return SystemColumnId.Status
}
