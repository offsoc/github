import {SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {compareStringValues} from '../primitives/compare-string-values'

/**
 * Compare the found IssueType column value for two project items
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same type value.
 */
export function compareIssueTypeField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const typeA = itemA.columns[SystemColumnId.IssueType]?.name ?? ''
  const typeB = itemB.columns[SystemColumnId.IssueType]?.name ?? ''

  return compareStringValues(typeA, typeB, itemA, itemB, desc, isUnstableSort)
}
