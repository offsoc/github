import type {MapKey, Comparator} from '../filter-sort'
import {filterSort} from '../filter-sort'

describe('filterSort', function () {
  test('removes items with null sort keys', function () {
    const odds: MapKey<number, number> = x => (x % 2 === 0 ? null : x)
    const compare: Comparator<number> = (a, b) => a - b
    const result = filterSort([3, 1, 2], odds, compare)
    expect(result).toEqual([1, 3])
  })

  test('does not remove items with falsy sort keys', function () {
    const evensFirst: MapKey<number, number> = x => (x % 2 === 0 ? 0 : x)
    const compare: Comparator<number> = (a, b) => a - b
    const result = filterSort([3, 1, 2], evensFirst, compare)
    expect(result).toEqual([2, 1, 3])
  })
})
