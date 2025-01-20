import {asCustomTextValue} from '../../../helpers/parsing'
import type {TextColumnModel} from '../../../models/column-model/custom/text'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {compareStringValues} from '../primitives/compare-string-values'

/**
 * Compare the provided text column value for two project items
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param column the text column being sorted on
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same text value.
 */
export function compareTextField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  column: TextColumnModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const customTextA = asCustomTextValue(itemA.columns[column.id])
  const customTextB = asCustomTextValue(itemB.columns[column.id])

  const textA = customTextA?.raw ?? ''
  const textB = customTextB?.raw ?? ''

  return compareStringValues(textA, textB, itemA, itemB, desc, isUnstableSort)
}
