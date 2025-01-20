import {asCustomNumberValue} from '../../../helpers/parsing'
import type {NumberColumnModel} from '../../../models/column-model/custom/number'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {compareNumberValues} from '../primitives/compare-number-values'

/**
 * Compare the provided number column value for two project items
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param column the number column being sorted on
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same number value.
 */
export function compareNumberField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  column: NumberColumnModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const customNumberA = asCustomNumberValue(itemA.columns[column.id])
  const customNumberB = asCustomNumberValue(itemB.columns[column.id])

  const numberA = customNumberA?.value
  const numberB = customNumberB?.value

  return compareNumberValues(numberA, numberB, itemA, itemB, desc, isUnstableSort)
}
