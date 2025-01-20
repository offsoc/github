import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {compareNumberValues} from '../primitives/compare-number-values'

/**
 * Compare the sub-issues progress field for two project items
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same percent_complete value.
 */
export function compareSubIssuesProgressField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const itemAProgress = itemA.columns[SystemColumnId.SubIssuesProgress]
  const itemBProgress = itemB.columns[SystemColumnId.SubIssuesProgress]

  // In the event that SubIssueList exists, but the total of sub-issues is 0, treat this
  // as undefined to ensure those items are forced to the bottom.
  const aVal = itemAProgress?.total === 0 ? undefined : itemAProgress?.percentCompleted
  const bVal = itemBProgress?.total === 0 ? undefined : itemBProgress?.percentCompleted

  return compareNumberValues(aVal, bVal, itemA, itemB, desc, isUnstableSort)
}
