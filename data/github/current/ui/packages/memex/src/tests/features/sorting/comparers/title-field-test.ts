import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareTitleField} from '../../../../client/features/sorting/comparers/title-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByTitle(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareTitleField(left, right, desc))
}

function createIssue(title?: string, params?: Partial<Issue>) {
  if (title) {
    return createMemexItemModel(issueFactory.withTitleColumnValue(title).build(params))
  }
  // NOTE: items should always have a title column, but this is our way of
  //       ensuring this case is handled correctly
  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareTitleField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue('Bug: unable to paste assignees into draft issue')
    const secondItem = createIssue('Feature request: nested grouping of hierarchy')

    const items = [secondItem, firstItem]

    const ascending = sortByTitle(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByTitle(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue('Implement hierarchy layout')
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortByTitle(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByTitle(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const title = 'Memex Date Picker / Formatting'

    const firstItem = createIssue(title, {id: 19})
    const secondItem = createIssue(title, {id: 12})
    const thirdItem = createIssue(title, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByTitle(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByTitle(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue('Implementing roadmap layout')
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
