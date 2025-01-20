import {SystemColumnId} from '../api/columns/contracts/memex-column'
import type {ColumnModel} from '../models/column-model'

const editableColumnTypes = new Set<SystemColumnId>([SystemColumnId.Status, SystemColumnId.SubIssuesProgress])

/**
 * Given a column, returns true if the column is editable by some user
 * and false if it is not.
 *
 * A column is editable if a user defined it _or_ if it's the Status Column,
 * which is _not_ `userDefined` but is editable.
 */
export function isColumnUserEditable(column: ColumnModel, options: {sub_issues?: boolean} = {}) {
  const {sub_issues = false} = options

  // Feature flag to not permit the SubIssuesProgress column to be editable
  if (!sub_issues && column.id === SystemColumnId.SubIssuesProgress) return false

  return column.userDefined || editableColumnTypes.has(column.id)
}
