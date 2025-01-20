import type {MemexColumnDataType} from '../../../../client/api/columns/contracts/memex-column'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareSingleSelectField} from '../../../../client/features/sorting/comparers/single-select-field'
import type {ColumnModelForDataType} from '../../../../client/models/column-model'
import {SingleSelectColumnModel} from '../../../../client/models/column-model/custom/single-select'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

const singleSelectColumn = customColumnFactory
  .singleSelect({optionNames: ['Small', 'Medium', 'Large', 'X-Large']})
  .build({name: 'Size'})

function sortBySingleSelectField(
  items: Array<MemexItemModel>,
  columnModel: ColumnModelForDataType<typeof MemexColumnDataType.SingleSelect>,
  desc: boolean,
) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareSingleSelectField(left, right, columnModel, desc))
}

function columnValue(statusOptionName: string) {
  return columnValueFactory.singleSelect(statusOptionName, 'Size', [singleSelectColumn]).build()
}

function createIssue(statusOptionName?: string, params?: Partial<Issue>) {
  if (statusOptionName) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(statusOptionName)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

const singleSelectColumnModel = new SingleSelectColumnModel(singleSelectColumn)

describe('comparing single-select field', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue('Small')
    const secondItem = createIssue('Large')

    const items = [secondItem, firstItem]

    const ascending = sortBySingleSelectField(items, singleSelectColumnModel, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortBySingleSelectField(items, singleSelectColumnModel, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue('Medium')
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortBySingleSelectField(items, singleSelectColumnModel, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortBySingleSelectField(items, singleSelectColumnModel, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue('X-Large', {id: 19})
    const secondItem = createIssue('X-Large', {id: 12})
    const thirdItem = createIssue('X-Large', {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortBySingleSelectField(items, singleSelectColumnModel, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortBySingleSelectField(items, singleSelectColumnModel, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue('X-Large')
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortBySingleSelectField(items, singleSelectColumnModel, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortBySingleSelectField(items, singleSelectColumnModel, true)

    expect(descending[0]).toEqual(itemWithValue)
    expect(descending[1]).toEqual(itemWithoutValue)
    expect(descending[2]).toEqual(redactedItem)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
