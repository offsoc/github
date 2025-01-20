import {ItemType} from '../../../../client/api/memex-items/item-type'
import {compareNumberValues} from '../../../../client/features/sorting/primitives/compare-number-values'
import type {RowWithId} from '../../../../client/features/sorting/primitives/types'

// Date Fields use the `simpleNumberComparator` under the hood
// by parsing the date field into a Date number.

type RowAndValue = {
  value: number | undefined
  row: RowWithId
}

function sortItems(items: Array<RowAndValue>, desc: boolean) {
  return items.sort((left, right) => {
    const result = compareNumberValues(left.value, right.value, left.row, right.row, desc)
    // Reverse the result if `desc` to match the react-table implementation
    return desc ? -result : result
  })
}

describe('Sorting with comparator', () => {
  it('sorts items into expected order', () => {
    const firstItem = {
      value: Date.parse('2021-01-01'),
      row: {id: 12, prioritizedIndex: 12, contentType: ItemType.Issue},
    }
    const secondItem = {value: Date.parse('2021-01-31'), row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}

    const ascending = sortItems([secondItem, firstItem], false)

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(secondItem)

    const descending = sortItems([secondItem, firstItem], true)

    expect(descending[0]).toEqual(secondItem)
    expect(descending[1]).toEqual(firstItem)
  })

  it('sorts undefined items at the bottom', () => {
    const itemWithValue = {
      value: Date.parse('2021-01-01'),
      row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue},
    }
    const itemWithUndefinedValue = {value: undefined, row: {id: 5, prioritizedIndex: 5, contentType: ItemType.Issue}}

    const ascending = sortItems([itemWithUndefinedValue, itemWithValue], false)

    expect(ascending[0]).toEqual(itemWithValue)
    expect(ascending[1]).toEqual(itemWithUndefinedValue)

    const descending = sortItems([itemWithUndefinedValue, itemWithValue], true)

    // undefined is always at the bottom, even in descending
    expect(descending[0]).toEqual(itemWithValue)
    expect(descending[1]).toEqual(itemWithUndefinedValue)
  })

  it('sorts redacted items below empty', () => {
    const itemWithValue = {
      value: Date.parse('2021-01-01'),
      row: {id: 5, prioritizedIndex: 5, contentType: ItemType.Issue},
    }
    const itemWithUndefinedValue = {value: undefined, row: {id: 10, prioritizedIndex: 10, contentType: ItemType.Issue}}
    const redactedItem = {value: undefined, row: {id: 1, prioritizedIndex: 1, contentType: ItemType.RedactedItem}}

    const ascending = sortItems([redactedItem, itemWithUndefinedValue, itemWithValue], false)

    expect(ascending[0]).toEqual(itemWithValue)
    expect(ascending[1]).toEqual(itemWithUndefinedValue)
    expect(ascending[2]).toEqual(redactedItem)

    const descending = sortItems([redactedItem, itemWithUndefinedValue, itemWithValue], true)

    // redacted item is always at the bottom, even in descending
    expect(descending[0]).toEqual(itemWithValue)
    expect(descending[1]).toEqual(itemWithUndefinedValue)
    expect(descending[2]).toEqual(redactedItem)
  })
})
