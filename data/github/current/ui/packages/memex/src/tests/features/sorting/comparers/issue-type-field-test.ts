import type {IssueType} from '../../../../client/api/common-contracts'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareIssueTypeField} from '../../../../client/features/sorting/comparers/issue-type-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByIssueType(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareIssueTypeField(left, right, desc))
}

function columnValue(issueType: IssueType) {
  return columnValueFactory.issueType(issueType).build()
}

function createIssue(issueType?: IssueType, params?: Partial<Issue>) {
  if (issueType) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(issueType)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

const enhancementType: IssueType = {
  name: 'enhancement',
  id: 1111,
  description: '',
}

const bugType: IssueType = {
  name: 'bug',
  id: 2222,
  description: '',
}

const featureType: IssueType = {
  name: 'feature',
  id: 3333,
  description: '',
}

const customType: IssueType = {
  name: 'custom',
  id: 8888,
  description: '',
}

describe('compareIssueTypeField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue(bugType)
    const secondItem = createIssue(enhancementType)

    const items = [secondItem, firstItem]

    const ascending = sortByIssueType(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByIssueType(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue(customType)
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortByIssueType(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByIssueType(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue(customType, {id: 19})
    const secondItem = createIssue(customType, {id: 12})
    const thirdItem = createIssue(customType, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByIssueType(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByIssueType(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue(featureType)
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByIssueType(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByIssueType(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
