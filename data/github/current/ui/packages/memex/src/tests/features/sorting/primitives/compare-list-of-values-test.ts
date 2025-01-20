import {ItemType} from '../../../../client/api/memex-items/item-type'
import {compareListOfValues} from '../../../../client/features/sorting/primitives/compare-list-of-values'
import type {RowWithId} from '../../../../client/features/sorting/primitives/types'

type RowAndValue = {
  value: Array<string | number>
  row: RowWithId
}

function sortItems(items: Array<RowAndValue>, desc: boolean) {
  return items.sort((left, right) => {
    const result = compareListOfValues(left.value, right.value, left.row, right.row, desc)
    // Reverse the result if `desc` to match the react-table implementation
    return desc ? -result : result
  })
}

describe('simpleListComparator', () => {
  it('sorts items into expected order', () => {
    const firstItem = {value: ['aardvarks'], row: {id: 8, prioritizedIndex: 8, contentType: ItemType.Issue}}
    const secondItem = {value: ['cybercats'], row: {id: 13, prioritizedIndex: 13, contentType: ItemType.Issue}}

    const ascending = sortItems([secondItem, firstItem], false)

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(secondItem)

    const descending = sortItems([secondItem, firstItem], true)

    expect(descending[0]).toEqual(secondItem)
    expect(descending[1]).toEqual(firstItem)
  })

  it('sorts items into expected order with a case insensitive compare', () => {
    const firstItem = {value: ['azenMatt'], row: {id: 13, prioritizedIndex: 13, contentType: ItemType.Issue}}
    const secondItem = {value: ['Mattamorphic'], row: {id: 2, prioritizedIndex: 2, contentType: ItemType.Issue}}

    const ascending = sortItems([secondItem, firstItem], false)

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(secondItem)

    const descending = sortItems([secondItem, firstItem], true)

    expect(descending[0]).toEqual(secondItem)
    expect(descending[1]).toEqual(firstItem)
  })

  it('sorts items based on shortest array fully existing in longer array', () => {
    const firstItem = {value: ['deferred timeline'], row: {id: 13, prioritizedIndex: 13, contentType: ItemType.Issue}}
    const secondItem = {value: ['deferred timeline'], row: {id: 14, prioritizedIndex: 14, contentType: ItemType.Issue}}
    const thirdItem = {
      value: ['deferred timeline', 'question'],
      row: {id: 14, prioritizedIndex: 14, contentType: ItemType.Issue},
    }
    const fourthItem = {
      value: ['deferred timeline', 'question', 'documentation'],
      row: {id: 2, prioritizedIndex: 2, contentType: ItemType.Issue},
    }
    const fifthItem = {value: ['question'], row: {id: 14, prioritizedIndex: 14, contentType: ItemType.Issue}}

    const ascending = sortItems([thirdItem, secondItem, fourthItem, firstItem, fifthItem], false)

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(secondItem)
    expect(ascending[2]).toEqual(thirdItem)
    expect(ascending[3]).toEqual(fourthItem)
    expect(ascending[4]).toEqual(fifthItem)

    const descending = sortItems([thirdItem, secondItem, fourthItem, firstItem, fifthItem], true)

    expect(descending[0]).toEqual(fifthItem)
    expect(descending[1]).toEqual(fourthItem)
    expect(descending[2]).toEqual(thirdItem)
    expect(descending[3]).toEqual(secondItem)
    expect(descending[4]).toEqual(firstItem)
  })

  it('sorts items into expected order with more items in the list', () => {
    const firstItem = {
      value: ['aardvarks'],
      row: {id: 10, prioritizedIndex: 10, contentType: ItemType.Issue},
    }
    const secondItem = {
      value: ['aardvarks', 'cybercats'],
      row: {id: 8, prioritizedIndex: 8, contentType: ItemType.Issue},
    }
    const thirdItem = {value: ['cybercats'], row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}

    const ascending = sortItems([secondItem, thirdItem, firstItem], false)

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(secondItem)
    expect(ascending[2]).toEqual(thirdItem)

    const descending = sortItems([secondItem, thirdItem, firstItem], true)

    expect(descending[0]).toEqual(thirdItem)
    expect(descending[1]).toEqual(secondItem)
    expect(descending[2]).toEqual(firstItem)
  })

  /**
   * This test case reflects a scenario where an item with many values is
   * placed after items with one value because of how the sorting works.
   *
   * Documenting this behaviour for follow-up to understand whether it makes
   * sense.
   */
  it('sorts items into expected order where one item has many entries', () => {
    const firstItem = {
      value: ['aardvarks'],
      row: {id: 10, prioritizedIndex: 10, contentType: ItemType.Issue},
    }
    const itemWithManyEntries = {
      value: ['cybercats', 'items', 'long-list', 'very-long-list'],
      row: {id: 8, prioritizedIndex: 8, contentType: ItemType.Issue},
    }
    const thirdItem = {value: ['cybercats'], row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}

    const ascending = sortItems([itemWithManyEntries, thirdItem, firstItem], false)

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(thirdItem)
    expect(ascending[2]).toEqual(itemWithManyEntries)

    const descending = sortItems([itemWithManyEntries, thirdItem, firstItem], true)

    expect(descending[0]).toEqual(itemWithManyEntries)
    expect(descending[1]).toEqual(thirdItem)
    expect(descending[2]).toEqual(firstItem)
  })

  it('sorts numbers into expected order with more items in the list', () => {
    const firstItem = {value: [55], row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}
    const secondItem = {value: [55], row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue}}
    const thirdItem = {value: [55, 99], row: {id: 2, prioritizedIndex: 2, contentType: ItemType.Issue}}
    const fourthItem = {value: [55, 100], row: {id: 34, prioritizedIndex: 34, contentType: ItemType.Issue}}
    const fifthItem = {value: [55, 101], row: {id: 45, prioritizedIndex: 45, contentType: ItemType.Issue}}
    const sixthItem = {value: [56], row: {id: 43, prioritizedIndex: 43, contentType: ItemType.Issue}}
    const seventhItem = {value: [100], row: {id: 6, prioritizedIndex: 6, contentType: ItemType.Issue}}

    const ascending = sortItems(
      [secondItem, seventhItem, sixthItem, fifthItem, thirdItem, fourthItem, firstItem],
      false,
    )

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(secondItem)
    expect(ascending[2]).toEqual(thirdItem)
    expect(ascending[3]).toEqual(fourthItem)
    expect(ascending[4]).toEqual(fifthItem)
    expect(ascending[5]).toEqual(sixthItem)
    expect(ascending[6]).toEqual(seventhItem)

    const descending = sortItems(
      [secondItem, seventhItem, sixthItem, fifthItem, thirdItem, fourthItem, firstItem],
      true,
    )

    expect(descending[0]).toEqual(seventhItem)
    expect(descending[1]).toEqual(sixthItem)
    expect(descending[2]).toEqual(fifthItem)
    expect(descending[3]).toEqual(fourthItem)
    expect(descending[4]).toEqual(thirdItem)
    expect(descending[5]).toEqual(secondItem)
    expect(descending[6]).toEqual(firstItem)
  })

  it('sorts empty lists at the bottom', () => {
    const firstItem = {value: ['aardvarks'], row: {id: 9, prioritizedIndex: 9, contentType: ItemType.Issue}}
    const secondItem = {value: [], row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue}}

    const ascending = sortItems([secondItem, firstItem], false)

    expect(ascending[0]).toEqual(firstItem)
    expect(ascending[1]).toEqual(secondItem)

    const descending = sortItems([secondItem, firstItem], true)

    expect(descending[0]).toEqual(firstItem)
    expect(descending[1]).toEqual(secondItem)
  })

  it('sorts redacted items below empty', () => {
    const itemWithValue = {value: ['aardvarks'], row: {id: 16, prioritizedIndex: 16, contentType: ItemType.Issue}}
    const itemWithEmptyList = {value: [], row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue}}
    const redactedItem = {value: [], row: {id: 21, prioritizedIndex: 21, contentType: ItemType.RedactedItem}}

    const ascending = sortItems([redactedItem, itemWithEmptyList, itemWithValue], false)

    expect(ascending[0]).toEqual(itemWithValue)
    expect(ascending[1]).toEqual(itemWithEmptyList)
    expect(ascending[2]).toEqual(redactedItem)

    const descending = sortItems([redactedItem, itemWithEmptyList, itemWithValue], true)

    // redacted item is always at the bottom, even in descending
    expect(descending[0]).toEqual(itemWithValue)
    expect(descending[1]).toEqual(itemWithEmptyList)
    expect(descending[2]).toEqual(redactedItem)
  })
})
