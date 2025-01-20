import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareTextField} from '../../../../client/features/sorting/comparers/text-field'
import {TextColumnModel} from '../../../../client/models/column-model/custom/text'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

const textColumn = customColumnFactory.text().build({name: 'Size'})

const textColumnModel = new TextColumnModel(textColumn)

function sortByTextField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareTextField(left, right, textColumnModel, desc))
}

function columnValue(text: string) {
  return columnValueFactory.text(text, 'Size', [textColumn]).build()
}

function createIssue(text?: string, params?: Partial<Issue>) {
  if (text) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(text)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareTextField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue('Large')
    const secondItem = createIssue('Small')

    const items = [secondItem, firstItem]

    const ascending = sortByTextField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByTextField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue('Large')
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortByTextField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByTextField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue('Something', {id: 19})
    const secondItem = createIssue('Something', {id: 12})
    const thirdItem = createIssue('Something', {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByTextField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByTextField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue('Large')
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByTextField(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByTextField(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
