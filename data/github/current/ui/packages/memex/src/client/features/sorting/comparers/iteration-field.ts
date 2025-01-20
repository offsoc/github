import {ItemType} from '../../../api/memex-items/item-type'
import {compareAscending, getAllIterations} from '../../../helpers/iterations'
import {asSingleSelectValue} from '../../../helpers/parsing'
import type {IterationColumnModel} from '../../../models/column-model/custom/iteration'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {stableSortFn} from '../stable-sort-order'

/**
 * Compare the provided iteration column value for two project items
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param column the iteration column being sorted on
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same iteration value.
 */
export function compareIterationField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  column: IterationColumnModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const rowAValue = asSingleSelectValue(itemA.columns[column.id])
  const rowBValue = asSingleSelectValue(itemB.columns[column.id])

  const rowAValueId = rowAValue?.id || ''
  const rowBValueId = rowBValue?.id || ''

  const iterations = getAllIterations(column)
  if (!iterations.length) return 0

  if (itemA.contentType === ItemType.RedactedItem && itemB.contentType !== ItemType.RedactedItem) {
    return desc ? -1 : 1
  } else if (itemA.contentType !== ItemType.RedactedItem && itemB.contentType === ItemType.RedactedItem) {
    return desc ? 1 : -1
  }

  const iterationA = iterations.find(o => o.id === rowAValueId)
  const iterationB = iterations.find(o => o.id === rowBValueId)

  if (!iterationA && iterationB) {
    return desc ? -1 : 1
  } else if (iterationA && !iterationB) {
    return desc ? 1 : -1
  }

  if (iterationA && iterationB) {
    const compare = compareAscending(iterationA, iterationB)
    if (compare !== 0) {
      return compare
    }
  }

  // to ensure more stable sorting, use a fallback order, unless the isUnstableSort
  // flag is true, in which we return them as equal and let the caller decide what to do
  return isUnstableSort ? 0 : stableSortFn(itemA, itemB)
}
