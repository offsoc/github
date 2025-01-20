import {ItemType} from '../../../../client/api/memex-items/item-type'
import {compareNumberValues} from '../../../../client/features/sorting/primitives/compare-number-values'
import type {RowWithId} from '../../../../client/features/sorting/primitives/types'

type RowAndValue = {
  value: number | undefined
  row: RowWithId
}

function sortByValues(items: Array<RowAndValue>, desc: boolean) {
  return items.sort((left, right) => {
    const result = compareNumberValues(left.value, right.value, left.row, right.row, desc)
    // Reverse the result if `desc` to match the react-table implementation
    return desc ? -result : result
  })
}

describe('compareNumberValues', () => {
  it('sorts items into expected order', () => {
    const firstItem = {value: 1, row: {id: 2, prioritizedIndex: 2, contentType: ItemType.Issue}}
    const secondItem = {value: 2, row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}

    const ascending = sortByValues([secondItem, firstItem], false)

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(secondItem)

    const descending = sortByValues([secondItem, firstItem], true)

    expect(descending[0]).toEqual(secondItem)
    expect(descending[1]).toEqual(firstItem)
  })

  it('sorts multiple items into expected order', () => {
    const firstItem = {value: 1, row: {id: 9, prioritizedIndex: 9, contentType: ItemType.Issue}}
    const secondItem = {value: undefined, row: {id: 8, prioritizedIndex: 8, contentType: ItemType.RedactedItem}}
    const thirdItem = {value: 10, row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue}}
    const fourthItem = {value: undefined, row: {id: 5, prioritizedIndex: 5, contentType: ItemType.RedactedItem}}
    const fifthItem = {value: 100, row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}

    const items = [firstItem, secondItem, thirdItem, fourthItem, fifthItem]

    const ascending = sortByValues(items, false)

    expect(ascending).toMatchObject([firstItem, thirdItem, fifthItem, secondItem, fourthItem])

    const descending = sortByValues(items, true)

    expect(descending).toMatchObject([fifthItem, thirdItem, firstItem, secondItem, fourthItem])
  })

  it('sort order is stable after multiple runs', () => {
    const firstItem = {value: 1, row: {id: 2, prioritizedIndex: 2, contentType: ItemType.Issue}}
    const secondItem = {value: undefined, row: {id: 9, prioritizedIndex: 9, contentType: ItemType.RedactedItem}}
    const thirdItem = {value: 10, row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue}}
    const fourthItem = {value: undefined, row: {id: 7, prioritizedIndex: 7, contentType: ItemType.RedactedItem}}
    const fifthItem = {value: 100, row: {id: 6, prioritizedIndex: 6, contentType: ItemType.Issue}}

    const items = [firstItem, secondItem, thirdItem, fourthItem, fifthItem]

    const ascending = sortByValues(items, false)
    const ascendingMultipleSorts = sortByValues(
      sortByValues(sortByValues(sortByValues(ascending, false), false), false),
      false,
    )
    expect(ascendingMultipleSorts).toMatchObject(ascending)

    const descending = sortByValues(items, true)
    const descendingMultipleSorts = sortByValues(
      sortByValues(sortByValues(sortByValues(descending, true), true), true),
      false,
    )
    expect(descendingMultipleSorts).toMatchObject(descending)
  })

  it('sorts undefined items at the bottom', () => {
    const itemWithValue = {value: 1, row: {id: 2, prioritizedIndex: 2, contentType: ItemType.Issue}}
    const itemWithUndefinedValue = {value: undefined, row: {id: 5, prioritizedIndex: 5, contentType: ItemType.Issue}}

    const ascending = sortByValues([itemWithUndefinedValue, itemWithValue], false)

    expect(ascending[0]).toEqual(itemWithValue)
    expect(ascending[1]).toEqual(itemWithUndefinedValue)

    const descending = sortByValues([itemWithUndefinedValue, itemWithValue], true)

    // undefined is always at the bottom, even in descending
    expect(descending[0]).toEqual(itemWithValue)
    expect(descending[1]).toEqual(itemWithUndefinedValue)
  })

  it('sorts redacted items below empty', () => {
    const itemWithValue = {value: 1, row: {id: 7, prioritizedIndex: 7, contentType: ItemType.Issue}}
    const itemWithUndefinedValue = {value: undefined, row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue}}
    const redactedItem = {value: undefined, row: {id: 3, prioritizedIndex: 3, contentType: ItemType.RedactedItem}}

    const ascending = sortByValues([redactedItem, itemWithUndefinedValue, itemWithValue], false)

    expect(ascending[0]).toEqual(itemWithValue)
    expect(ascending[1]).toEqual(itemWithUndefinedValue)
    expect(ascending[2]).toEqual(redactedItem)

    const descending = sortByValues([redactedItem, itemWithUndefinedValue, itemWithValue], true)

    // redacted item is always at the bottom, even in descending
    expect(descending[0]).toEqual(itemWithValue)
    expect(descending[1]).toEqual(itemWithUndefinedValue)
    expect(descending[2]).toEqual(redactedItem)
  })
})
