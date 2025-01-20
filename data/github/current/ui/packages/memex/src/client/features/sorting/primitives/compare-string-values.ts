import {ItemType} from '../../../api/memex-items/item-type'
import {stableSortFn} from '../stable-sort-order'
import type {RowWithId} from './types'

/**
 * Compare two string values to determine the sort order of their
 * corresponding items.
 *
 * @param rowAText the "left" value of the comparison operation
 * @param rowBText the "right" value of the comparison operation
 * @param itemA the item associated with the "left" value
 * @param itemB the item associated with the "right" value
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same string value.
 */
export function compareStringValues(
  rowAText: string,
  rowBText: string,
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
    // redacted items should appear at the bottom of the table.
    return desc ? -1 : 1
  }

  if (rowAContentType !== ItemType.RedactedItem && rowBContentType === ItemType.RedactedItem) {
    // redacted items should appear at the bottom of the table.
    return desc ? 1 : -1
  }

  if (rowAText === '' && rowBText !== '') {
    // Sort empty strings at the bottom
    return desc ? -1 : 1
  }

  if (rowAText !== '' && rowBText === '') {
    // Sort empty strings at the bottom
    return desc ? 1 : -1
  }

  // use localeCompare to handle case insensitivity
  const compareValue = rowAText.localeCompare(rowBText)

  if (compareValue !== 0) {
    return compareValue
  }

  // to ensure more stable sorting, use a fallback order, unless the isUnstableSort
  // flag is true, in which we return them as equal and let the caller decide what to do
  return isUnstableSort ? 0 : stableSortFn(itemA, itemB)
}
