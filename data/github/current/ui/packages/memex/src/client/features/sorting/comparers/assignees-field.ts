import type {MemexItemModel} from '../../../models/memex-item-model'
import {compareListOfValues} from '../primitives/compare-list-of-values'

/**
 * Compare the found Assignees column value for two project items
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same assignees value.
 */
export function compareAssigneesField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const rowAList = itemA.columns.Assignees?.map(v => v.login) ?? []
  const rowBList = itemB.columns.Assignees?.map(v => v.login) ?? []

  return compareListOfValues(rowAList, rowBList, itemA, itemB, desc, isUnstableSort)
}
