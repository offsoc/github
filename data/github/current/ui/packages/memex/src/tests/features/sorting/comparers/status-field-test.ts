import type {MemexColumnDataType} from '../../../../client/api/columns/contracts/memex-column'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareSingleSelectField} from '../../../../client/features/sorting/comparers/single-select-field'
import type {ColumnModelForDataType} from '../../../../client/models/column-model'
import {StatusColumnModel} from '../../../../client/models/column-model/system/status'
import type {MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {systemColumnFactory} from '../../../factories/columns/system-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'
import {createMemexItemModel} from '../../../mocks/models/memex-item-model'

const statusColumn = systemColumnFactory.status({optionNames: ['Backlog', 'Planned', 'Doing', 'Done']}).build()
const statusColumnModel = new StatusColumnModel(statusColumn)

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
  return columnValueFactory.singleSelect(statusOptionName, 'Status', [statusColumn]).build()
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

describe('comparing status field', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue('Doing')
    const secondItem = createIssue('Done')

    const items = [secondItem, firstItem]

    const ascending = sortBySingleSelectField(items, statusColumnModel, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortBySingleSelectField(items, statusColumnModel, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue('Planned')
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortBySingleSelectField(items, statusColumnModel, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortBySingleSelectField(items, statusColumnModel, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same status', () => {
    const firstItem = createIssue('Planned', {id: 19})
    const secondItem = createIssue('Planned', {id: 12})
    const thirdItem = createIssue('Planned', {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortBySingleSelectField(items, statusColumnModel, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortBySingleSelectField(items, statusColumnModel, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue('Backlog')
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortBySingleSelectField(items, statusColumnModel, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortBySingleSelectField(items, statusColumnModel, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
