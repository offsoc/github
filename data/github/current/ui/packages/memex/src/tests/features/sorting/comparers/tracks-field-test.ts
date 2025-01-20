import type {Progress} from '../../../../client/api/columns/contracts/tracks'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareTracksField} from '../../../../client/features/sorting/comparers/tracks-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByTracksField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareTracksField(left, right, desc))
}

function columnValue(progress: Progress) {
  return columnValueFactory.tracks(progress).build()
}

function createIssue(progress?: Progress, params?: Partial<Issue>) {
  if (progress) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(progress)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareTracksField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue({
      total: 10,
      completed: 2,
      percent: 50,
    })

    const secondItem = createIssue({
      total: 10,
      completed: 7,
      percent: 70,
    })

    const items = [secondItem, firstItem]

    const ascending = sortByTracksField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByTracksField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue({
      total: 6,
      completed: 3,
      percent: 50,
    })

    const secondItem = createMemexItemModel(issueFactory.build())

    const items = [secondItem, firstItem]

    const ascending = sortByTracksField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByTracksField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const progress = {
      total: 6,
      completed: 3,
      percent: 50,
    }

    const firstItem = createIssue(progress, {id: 19})
    const secondItem = createIssue(progress, {id: 12})
    const thirdItem = createIssue(progress, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByTracksField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByTracksField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue({
      total: 10,
      completed: 0,
      percent: 0,
    })
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByTracksField(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByTracksField(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
