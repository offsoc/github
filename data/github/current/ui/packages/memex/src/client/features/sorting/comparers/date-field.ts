import {asCustomDateValue} from '../../../helpers/parsing'
import type {DateColumnModel} from '../../../models/column-model/custom/date'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {compareNumberValues} from '../primitives/compare-number-values'

/**
 * Compare the provided date column value for two project items
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
 *          or === 0 if "left" and "right" have the same date value.
 */
export function compareDateField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  column: DateColumnModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const customDateA = asCustomDateValue(itemA.columns[column.id])
  const customDateB = asCustomDateValue(itemB.columns[column.id])

  const numberA = customDateA?.value.getTime()
  const numberB = customDateB?.value.getTime()

  return compareNumberValues(numberA, numberB, itemA, itemB, desc, isUnstableSort)
}
