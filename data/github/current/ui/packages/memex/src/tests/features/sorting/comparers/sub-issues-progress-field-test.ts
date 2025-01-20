import type {SubIssuesProgress} from '../../../../client/api/common-contracts'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareSubIssuesProgressField} from '../../../../client/features/sorting/comparers/sub-issues-progress-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortBySubIssuesProgressField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareSubIssuesProgressField(left, right, desc))
}

function columnValue(progress: SubIssuesProgress) {
  return columnValueFactory.subIssuesProgress(progress).build()
}

function createIssue(progress?: SubIssuesProgress, params?: Partial<Issue>) {
  if (progress) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(progress)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareSubIssuesProgressField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue({
      id: 1234,
      total: 10,
      completed: 5,
      percentCompleted: 50,
    })

    const secondItem = createIssue({
      id: 2345,
      total: 10,
      completed: 7,
      percentCompleted: 70,
    })

    const items = [secondItem, firstItem]

    const ascending = sortBySubIssuesProgressField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortBySubIssuesProgressField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue({
      id: 3456,
      total: 6,
      completed: 3,
      percentCompleted: 50,
    })

    const secondItem = createMemexItemModel(issueFactory.build())

    const items = [secondItem, firstItem]

    const ascending = sortBySubIssuesProgressField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortBySubIssuesProgressField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const progress = {
      id: 4321,
      total: 6,
      completed: 3,
      percentCompleted: 50,
    }

    const firstItem = createIssue(progress, {id: 19})
    const secondItem = createIssue(progress, {id: 12})
    const thirdItem = createIssue(progress, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortBySubIssuesProgressField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortBySubIssuesProgressField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts sub-issues progress with 0 total at bottom (no sub-issues)', () => {
    const firstItem = createIssue({
      id: 1234,
      total: 0,
      completed: 0,
      percentCompleted: 0,
    })

    const secondItem = createIssue({
      id: 2345,
      total: 10,
      completed: 7,
      percentCompleted: 70,
    })

    const items = [secondItem, firstItem]

    const ascending = sortBySubIssuesProgressField(items, false)

    expect(ascending).toMatchObject([secondItem, firstItem])

    const descending = sortBySubIssuesProgressField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue({
      id: 5678,
      total: 10,
      completed: 0,
      percentCompleted: 0,
    })
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortBySubIssuesProgressField(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortBySubIssuesProgressField(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
