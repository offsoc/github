import type {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../api/memex-items/item-type'
import {asSingleSelectValue} from '../../../helpers/parsing'
import type {ColumnModelForDataType} from '../../../models/column-model'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {stableSortFn} from '../stable-sort-order'

/**
 * Compare the provided single select column value for two project items
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param column the date column being sorted on
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same single-select value.
 *
 * Sort order is:
 *
 * Ascending:
 * 1 Option First to Last
 * 2 Empty/non-existing options
 * 3 Redacted Items
 *
 * Descending:
 * 1 Option Last to First
 * 2 Empty/non-existing options
 * 3 Redacted Items
 *
 */
export function compareSingleSelectField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  column: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const rowAValue = asSingleSelectValue(itemA.columns[column.id])
  const rowBValue = asSingleSelectValue(itemB.columns[column.id])

  const rowAValueId = rowAValue?.id || ''
  const rowBValueId = rowBValue?.id || ''

  const columnOptions = column.settings.options
  if (!columnOptions) return 0

  const rowAPosition = columnOptions.findIndex(o => o.id === rowAValueId)
  const rowBPosition = columnOptions.findIndex(o => o.id === rowBValueId)

  if (itemA.contentType === ItemType.RedactedItem && itemB.contentType !== ItemType.RedactedItem) {
    return desc ? -1 : 1
  } else if (itemA.contentType !== ItemType.RedactedItem && itemB.contentType === ItemType.RedactedItem) {
    return desc ? 1 : -1
  }

  if (rowAPosition === -1 && rowBPosition !== -1) {
    return desc ? -1 : 1
  } else if (rowAPosition !== -1 && rowBPosition === -1) {
    return desc ? 1 : -1
  }

  if (rowAPosition > rowBPosition) {
    return 1
  } else if (rowAPosition < rowBPosition) {
    return -1
  }

  // to ensure more stable sorting, use a fallback order, unless the isUnstableSort
  // flag is true, in which we return them as equal and let the caller decide what to do
  return isUnstableSort ? 0 : stableSortFn(itemA, itemB)
}
