import {ItemType} from '../../../api/memex-items/item-type'
import {stableSortFn} from '../stable-sort-order'
import type {RowWithId} from './types'

/**
 * Compare two number values to determine the sort order of their
 * corresponding items.
 *
 * @param rowANumber the "left" value of the comparison operation
 * @param rowBNumber the "right" value of the comparison operation
 * @param itemA the item associated with the "left" value
 * @param itemB the item associated with the "right" value
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same number value.
 */
export function compareNumberValues(
  rowANumber: number | undefined,
  rowBNumber: number | undefined,
  itemA: RowWithId,
  itemB: RowWithId,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const rowAContentType = itemA.contentType
  const rowBContentType = itemB.contentType

  if (rowAContentType === ItemType.RedactedItem && rowBContentType === ItemType.RedactedItem) {
    // both items are redacted, consider them equivalent
    return 0
  }

  if (rowAContentType === ItemType.RedactedItem && rowBContentType !== ItemType.RedactedItem) {
    // Redacted items should appear at the bottom of the table.
    return desc ? -1 : 1
  }

  if (rowAContentType !== ItemType.RedactedItem && rowBContentType === ItemType.RedactedItem) {
    return desc ? 1 : -1
  }

  if (rowANumber !== undefined && rowBNumber !== undefined && rowANumber !== rowBNumber) {
    // if we have two *distinct* values, let's just compare them
    return rowANumber - rowBNumber
  }

  if (rowANumber === undefined && rowBNumber !== undefined) {
    // Sort omitted numbers at the bottom always
    return desc ? -1 : 1
  }

  if (rowANumber !== undefined && rowBNumber === undefined) {
    return desc ? 1 : -1
  }

  // to ensure more stable sorting, use a fallback order, unless the isUnstableSort
  // flag is true, in which we return them as equal and let the caller decide what to do
  return isUnstableSort ? 0 : stableSortFn(itemA, itemB)
}
