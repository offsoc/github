import type {RowWithId} from './primitives/types'

// A fall back sort order to ensure more stable sorting that sorts by
// the item's prioritized index (client version of the priority)
// when two items appear to have the same value.
// If the prioritized index is not reset by createPageQueryDataFromItems, the value
// will be the item's id.
//
// NOTE: At time of writing, createPageQueryDataFromItems resets the prioritizedIndex
// for _all_ items. If this ever changes, there's nothing preventing a
// situation where we're effectively doing something like
// a.id - b.prioritizedIndex, where a's prioritizedIndex was never reset.
export const stableSortFn = (a: RowWithId, b: RowWithId) => {
  return a.prioritizedIndex - b.prioritizedIndex
}
