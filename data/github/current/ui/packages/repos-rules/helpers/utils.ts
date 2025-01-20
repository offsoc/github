import {INHERITED_SOURCE_TYPE_ORDER_MAP} from './constants'
import type {InheritedSourceType, Ruleset} from '../types/rules-types'

/*
  Split an array into two parts by a predicate
*/
export function partition<T>(list: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const matches: T[] = []
  const notMatches: T[] = []

  for (const item of list) {
    if (predicate(item)) {
      matches.push(item)
    } else {
      notMatches.push(item)
    }
  }

  return [matches, notMatches]
}

/*
  Split an map into two parts by a predicate
*/
export function partitionMap<K, V>(
  map: Map<K, V>,
  predicate: (key: K, value: V) => boolean,
): [Array<[K, V]>, Array<[K, V]>] {
  const matches: Array<[K, V]> = []
  const notMatches: Array<[K, V]> = []

  for (const item of map.entries()) {
    if (predicate(item[0], item[1])) {
      matches.push([item[0], item[1]])
    } else {
      notMatches.push([item[0], item[1]])
    }
  }

  return [matches, notMatches]
}

/*
 * a function to pass to Array.sort that orders the given array against
 * INHERITED_SOURCE_TYPE_ORDER_MAP, where unknown keys are arbitrarily
 * ordered last
 */
export function sortSourceTypes(a: string, b: string) {
  return (
    (INHERITED_SOURCE_TYPE_ORDER_MAP[a as InheritedSourceType] ?? Infinity) -
    (INHERITED_SOURCE_TYPE_ORDER_MAP[b as InheritedSourceType] ?? Infinity)
  )
}

export function isRulesetInherited(source: {id: number; type: string}, ruleset: Ruleset) {
  return source.id !== ruleset.source.id || source.type.toLowerCase() !== ruleset.source.type.toLowerCase()
}
