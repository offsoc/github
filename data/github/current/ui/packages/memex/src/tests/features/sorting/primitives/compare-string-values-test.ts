import {ItemType} from '../../../../client/api/memex-items/item-type'
import {compareStringValues} from '../../../../client/features/sorting/primitives/compare-string-values'
import type {RowWithId} from '../../../../client/features/sorting/primitives/types'

type RowAndValue = {
  value: string
  row: RowWithId
}

function sortWithValues(items: Array<RowAndValue>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareStringValues(left.value, right.value, left.row, right.row, desc))
}

describe('simpleTextComparator', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = {value: 'aardvarks', row: {id: 23, prioritizedIndex: 23, contentType: ItemType.Issue}}
    const secondItem = {value: 'cybercats', row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}

    const ascending = sortWithValues([secondItem, firstItem], false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortWithValues([secondItem, firstItem], true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('sorts multiple items into expected order', () => {
    const firstItem = {value: 'alpha', row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue}}
    const secondItem = {value: '', row: {id: 1, prioritizedIndex: 1, contentType: ItemType.RedactedItem}}
    const thirdItem = {value: 'bravo', row: {id: 22, prioritizedIndex: 22, contentType: ItemType.Issue}}
    const fourthItem = {value: '', row: {id: 17, prioritizedIndex: 17, contentType: ItemType.RedactedItem}}
    const fifthItem = {value: 'charlie', row: {id: 8, prioritizedIndex: 8, contentType: ItemType.Issue}}

    const items = [firstItem, secondItem, thirdItem, fourthItem, fifthItem]

    const ascending = sortWithValues(items, false)

    expect(ascending).toMatchObject([firstItem, thirdItem, fifthItem, secondItem, fourthItem])

    const descending = sortWithValues(items, true)

    expect(descending).toMatchObject([fifthItem, thirdItem, firstItem, secondItem, fourthItem])
  })

  it('sort order is stable after multiple runs', () => {
    const firstItem = {value: 'alpha', row: {id: 4, prioritizedIndex: 4, contentType: ItemType.Issue}}
    const secondItem = {value: '', row: {id: 6, prioritizedIndex: 6, contentType: ItemType.RedactedItem}}
    const thirdItem = {value: 'bravo', row: {id: 7, prioritizedIndex: 7, contentType: ItemType.Issue}}
    const fourthItem = {value: '', row: {id: 1, prioritizedIndex: 1, contentType: ItemType.RedactedItem}}
    const fifthItem = {value: 'charlie', row: {id: 9, prioritizedIndex: 9, contentType: ItemType.Issue}}

    const items = [firstItem, secondItem, thirdItem, fourthItem, fifthItem]

    const ascending = sortWithValues(items, false)
    const ascendingMultipleSorts = sortWithValues(
      sortWithValues(sortWithValues(sortWithValues(ascending, false), false), false),
      false,
    )
    expect(ascendingMultipleSorts).toMatchObject(ascending)

    const descending = sortWithValues(items, true)
    const descendingMultipleSorts = sortWithValues(
      sortWithValues(sortWithValues(sortWithValues(descending, true), true), true),
      false,
    )
    expect(descendingMultipleSorts).toMatchObject(descending)
  })

  it('puts items without value after other items', () => {
    const firstItem = {value: 'aardvarks', row: {id: 5, prioritizedIndex: 5, contentType: ItemType.Issue}}
    const secondItem = {value: '', row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}

    const ascending = sortWithValues([secondItem, firstItem], false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortWithValues([secondItem, firstItem], true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = {value: 'aardvarks', row: {id: 6, prioritizedIndex: 6, contentType: ItemType.Issue}}
    const itemWithEmptyValue = {value: '', row: {id: 1, prioritizedIndex: 1, contentType: ItemType.Issue}}
    const redactedItem = {value: '', row: {id: 8, prioritizedIndex: 8, contentType: ItemType.RedactedItem}}

    const ascending = sortWithValues([redactedItem, itemWithEmptyValue, itemWithValue], false)

    expect(ascending).toMatchObject([itemWithValue, itemWithEmptyValue, redactedItem])

    const descending = sortWithValues([redactedItem, itemWithEmptyValue, itemWithValue], true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithEmptyValue, redactedItem])
  })
})
