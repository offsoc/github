import {parseTitleDefaultHtml} from '../../../helpers/parsing'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {compareStringValues} from '../primitives/compare-string-values'

/**
 * Compare the title text for two project items, using the rich text
 * representation.
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same title value.
 */
export function compareTitleField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const titleA = parseTitleDefaultHtml(itemA.columns.Title)
  const titleB = parseTitleDefaultHtml(itemB.columns.Title)

  return compareStringValues(titleA, titleB, itemA, itemB, desc, isUnstableSort)
}
