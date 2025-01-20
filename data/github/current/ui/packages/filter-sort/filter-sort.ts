import {filterMap} from './filter-map'

export type MapKey<T, K> = (item: T) => K | null | undefined
export type Comparator<T> = (a: T, b: T) => number

export function filterSort<T, K>(items: T[], map: MapKey<T, K>, compare: Comparator<K>): T[] {
  const sortKey = (item: T): [T, K] | null => {
    const key = map(item)
    return key != null ? [item, key] : null
  }
  return [...filterMap(items, sortKey)].sort((a, b) => compare(a[1], b[1])).map(([item]) => item)
}
