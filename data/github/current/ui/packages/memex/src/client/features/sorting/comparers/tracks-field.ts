import {progressAsFraction} from '../../../helpers/parsing'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {compareNumberValues} from '../primitives/compare-number-values'

/**
 * Compare the found Tracks column value for two project items
 *
 * @param itemA the "left" item of the comparison operation
 * @param itemB the "right" item of the comparison operation
 * @param desc whether the sort order is ascending or descending.
 *             Defaults to ascending if omitted.
 * @param isUnstableSort whether to perform a stable sort by id if the values are equal.
 *
 * @returns <0 if "left" item should appear before "right" item in array,
 *          >0 if "left" item should appear after "right" item in array,
 *          or === 0 if "left" and "right" have the same tracks value.
 */
export function compareTracksField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  desc?: boolean,
  isUnstableSort?: boolean,
) {
  const tracksAValue = progressAsFraction(itemA.columns.Tracks)
  const tracksBValue = progressAsFraction(itemB.columns.Tracks)

  return compareNumberValues(tracksAValue, tracksBValue, itemA, itemB, desc, isUnstableSort)
}
