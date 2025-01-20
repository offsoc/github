import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareNumberField} from '../../../../client/features/sorting/comparers/number-field'
import {NumberColumnModel} from '../../../../client/models/column-model/custom/number'
import type {MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'
import {createMemexItemModel} from '../../../mocks/models/memex-item-model'

const numberColumn = customColumnFactory.number().build({name: 'Size'})

const numberColumnModel = new NumberColumnModel(numberColumn)

function sortByNumberField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareNumberField(left, right, numberColumnModel, desc))
}

function columnValue(num: number) {
  return columnValueFactory.number(num, 'Size', [numberColumn]).build()
}

function createIssue(num?: number, params?: Partial<Issue>) {
  if (num) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(num)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareNumberField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue(10)
    const secondItem = createIssue(34)

    const ascending = sortByNumberField([secondItem, firstItem], false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByNumberField([secondItem, firstItem], true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue(23)
    const secondItem = createIssue()

    const ascending = sortByNumberField([secondItem, firstItem], false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByNumberField([secondItem, firstItem], true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue(100, {id: 19})
    const secondItem = createIssue(100, {id: 12})
    const thirdItem = createIssue(100, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByNumberField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByNumberField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue(42)
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const ascending = sortByNumberField([redactedItem, itemWithoutValue, itemWithValue], false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByNumberField([redactedItem, itemWithoutValue, itemWithValue], true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
