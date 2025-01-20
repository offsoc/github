import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import type {FieldGrouping} from '../features/grouping/types'
import {Resources} from '../strings'

export const getGroupFooterPlaceholder = (group: FieldGrouping) => {
  if (!shouldDisableGroupFooter(group)) {
    return Resources.addItem
  }

  switch (group.dataType) {
    case MemexColumnDataType.Milestone:
      return Resources.cannotAddItemsWhenGroupByMilestone
    case MemexColumnDataType.Repository:
      return Resources.cannotAddItemsWhenGroupByRepository
    case MemexColumnDataType.IssueType:
      return Resources.cannotAddItemsWhenGroupByIssueType
    default:
      return Resources.addItem
  }
}

/**
 * Check whether the "Add Item" input for a group should be enabled
 */
export function shouldDisableGroupFooter(group: FieldGrouping) {
  if (group.kind === 'empty') {
    // items can always be added to an empty group
    return false
  }

  // otherwise other groups can receive items
  return false
}
