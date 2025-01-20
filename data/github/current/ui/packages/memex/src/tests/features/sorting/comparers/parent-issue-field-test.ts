import type {ParentIssue} from '../../../../client/api/common-contracts'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareParentIssueField} from '../../../../client/features/sorting/comparers/parent-issue-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {mockParentIssues} from '../../../../mocks/data/parent-issues'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByTitle(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareParentIssueField(left, right, desc))
}

function columnValue(parentIssue: ParentIssue) {
  return columnValueFactory.parentIssue(parentIssue).build()
}

function createIssue(parentIssue?: ParentIssue, params?: Partial<Issue>) {
  if (parentIssue) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(parentIssue)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareParentIssueField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue(mockParentIssues[0])
    const secondItem = createIssue(mockParentIssues[1])

    const items = [secondItem, firstItem]

    const ascending = sortByTitle(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByTitle(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue(mockParentIssues[0])
    const secondItem = createMemexItemModel(issueFactory.build())

    const items = [secondItem, firstItem]

    const ascending = sortByTitle(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByTitle(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue(mockParentIssues[0], {id: 19})
    const secondItem = createIssue(mockParentIssues[0], {id: 12})
    const thirdItem = createIssue(mockParentIssues[0], {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByTitle(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByTitle(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue(mockParentIssues[0])
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByTitle(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByTitle(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
