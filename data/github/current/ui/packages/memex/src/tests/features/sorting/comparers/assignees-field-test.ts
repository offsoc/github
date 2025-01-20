import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareAssigneesField} from '../../../../client/features/sorting/comparers/assignees-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByAssigneesField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareAssigneesField(left, right, desc))
}

function columnValue(assignees: Array<string>) {
  return columnValueFactory.assignees(assignees).build()
}

function createIssue(assignees?: Array<string>, params?: Partial<Issue>) {
  if (assignees && assignees.length) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(assignees)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareAssigneesField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue(['dmarcey', 'mattcosta'])
    const secondItem = createIssue(['shiftkey'])

    const items = [secondItem, firstItem]

    const ascending = sortByAssigneesField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByAssigneesField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue(['j0siepy'])
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortByAssigneesField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByAssigneesField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const assignees = ['dmarcey', 'mattcosta7']

    const firstItem = createIssue(assignees, {id: 19})
    const secondItem = createIssue(assignees, {id: 12})
    const thirdItem = createIssue(assignees, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByAssigneesField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByAssigneesField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue(['abigailychen', 'jellobagel'])
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByAssigneesField(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByAssigneesField(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
