import {ItemType} from '../../../api/memex-items/item-type'
import {not_typesafe_nonNullAssertion} from '../../../helpers/non-null-assertion'
import {stableSortFn} from '../stable-sort-order'
import type {RowWithId} from './types'

type StringOrNumber = string | number

/**
 * Validates equality based on type,
 * if the values are strings it does a case insensitive comparison
 *
 * @param a the first item to compare
 * @param b the second item to compare
 * @returns whether the two items are equal or not
 */
function isEqual(a: StringOrNumber, b: StringOrNumber): boolean {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.toLowerCase() === b.toLowerCase()
  }

  return a === b
}

/**
 * Validates if a is greater than b based on type,
 * if the values are strings it does a case insensitive comparison
 *
 * @param a the first item to compare
 * @param b the second item to compare
 * @returns whether the two items are equal or not
 */
function isGreaterThan(a: StringOrNumber, b: StringOrNumber): boolean {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.toLowerCase() > b.toLowerCase()
  }

  return a > b
}

/**
 * Compare two lists of strings (or numbers) to determine the sort order.
 *
 * @param rowAList the "left" value of the comparison operation
 * @param rowBList the "right" value of the comparison operation
 * @param itemA the item type of the "left" item
 * @param itemB the item type of the "right" item
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same list of value.
 */
export function compareListOfValues(
  rowAList: Array<StringOrNumber>,
  rowBList: Array<StringOrNumber>,
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
    // redacted items should appear at the end of the array
    return desc ? -1 : 1
  }

  if (rowAContentType !== ItemType.RedactedItem && rowBContentType === ItemType.RedactedItem) {
    // redacted items should appear at the end of the array
    return desc ? 1 : -1
  }

  if (rowAList.length === 0 && rowBList.length > 0) {
    // empty arrays should appear at the end of the array
    return desc ? -1 : 1
  }

  if (rowAList.length > 0 && rowBList.length === 0) {
    // empty arrays should appear at the end of the array
    return desc ? 1 : -1
  }

  // We don't want to use a relational opearator like <> to compare the arrays
  // as it just does a string comparison after something like `Array.join(','),
  // so this approach will not work when comparing Array<number>, only strings

  // Instead, our algorithm should be to walk through the elements of the array
  // and do comparisons on individual elements until we:
  // 1. Find an index where the elements are not equal
  // 2. Fall of the end of one of the arrays - in which case the array with
  // more elements is considered to be 'greater'
  for (let i = 0; i < rowAList.length; i++) {
    if (i >= rowBList.length) {
      // rowA has more elements than rowB, so consider rowA greater
      return 1
    }

    const leftValue = not_typesafe_nonNullAssertion(rowAList[i])
    const rightValue = not_typesafe_nonNullAssertion(rowBList[i])

    if (isEqual(leftValue, rightValue)) {
      // the elements at this index are equal, so move to the next index
      // to compare
      continue
    }

    // We have elements in both arrays at this index and they are not equal,
    // so we can just compare the two elements with >
    return isGreaterThan(leftValue, rightValue) ? 1 : -1
  }

  // rowB has more elements than rowA, with all of rowA included in rowB, so consider rowB greater
  if (rowBList.length > rowAList.length) {
    return -1
  }

  // to ensure more stable sorting, use a fallback order, unless the isUnstableSort
  // flag is true, in which we return them as equal and let the caller decide what to do
  return isUnstableSort ? 0 : stableSortFn(itemA, itemB)
}
