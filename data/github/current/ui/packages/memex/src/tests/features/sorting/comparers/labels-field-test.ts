import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareLabelsField} from '../../../../client/features/sorting/comparers/labels-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByLabelsField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareLabelsField(left, right, desc))
}

function columnValue(labelNames: Array<string>) {
  return columnValueFactory.labels(labelNames).build()
}

function createIssue(labelNames?: Array<string>, params?: Partial<Issue>) {
  if (labelNames && labelNames.length) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(labelNames)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareLabelsField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue(['bugfix', 'frontend'])
    const secondItem = createIssue(['testing'])

    const items = [secondItem, firstItem]

    const ascending = sortByLabelsField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByLabelsField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue(['backend'])
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortByLabelsField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByLabelsField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const labels = ['bug', 'feature']

    const firstItem = createIssue(labels, {id: 19})
    const secondItem = createIssue(labels, {id: 12})
    const thirdItem = createIssue(labels, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByLabelsField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByLabelsField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue(['bugfix', 'layout:table'])
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByLabelsField(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByLabelsField(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
