import {filterMap, type MapFilter} from '../filter-map'

describe('filterMap', function () {
  test('removes null values', function () {
    const evens: MapFilter<number, number> = x => (x % 2 === 0 ? x * 2 : null)
    const result = [...filterMap([1, 2, 3, 4, 5, 6], evens)]
    expect(result).toEqual([4, 8, 12])
  })
})
