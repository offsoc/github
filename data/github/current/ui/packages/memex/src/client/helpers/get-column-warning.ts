import type {ColumnModel} from '../models/column-model'
import {getEnabledFeatures} from './feature-flags'
import {getInitialState} from './initial-state'

export type ColumnWarningKind = 'rename-custom-type-column'
/**
 * Returns action that user must take for a column (e.g. column collides with system column)
 *
 * @param column The column to check
 * @returns type of warning for a column, if it exists
 */
export const getColumnWarning = (column: ColumnModel): ColumnWarningKind | undefined => {
  switch (column.name.toLowerCase().trim()) {
    case 'type': {
      if (!column.userDefined) return
      const {issue_types} = getEnabledFeatures()
      const {isOrganization} = getInitialState()

      return isOrganization && issue_types ? 'rename-custom-type-column' : undefined
    }
    default:
      return
  }
}
