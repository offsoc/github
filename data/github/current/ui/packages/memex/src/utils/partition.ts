import {group} from './group'

// Using integers here to represent pass/fail in a more compact way, since we
// need to group by a number/string value, rather than a boolean.
const ITEMS_MATCHING = 0
const ITEMS_FAILING = 1

/**
 * Splits an array of elements split into two arrays:
 * - the first array has all elements `predicate` returns truthy for
 * - the second array has all elements `predicate` returns falsey for.
 */
export function partition<T>(list: Array<T>, predicate: (item: T) => boolean): [Array<T>, Array<T>] {
  const {[ITEMS_MATCHING]: itemsMatchingPredicate = [], [ITEMS_FAILING]: itemsNotMatchingPredicate = []} = group(
    list,
    el => (predicate(el) ? ITEMS_MATCHING : ITEMS_FAILING),
  )
  return [itemsMatchingPredicate, itemsNotMatchingPredicate]
}
