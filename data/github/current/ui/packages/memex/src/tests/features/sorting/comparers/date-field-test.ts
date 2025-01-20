import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareDateField} from '../../../../client/features/sorting/comparers/date-field'
import {DateColumnModel} from '../../../../client/models/column-model/custom/date'
import type {MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'
import {createMemexItemModel} from '../../../mocks/models/memex-item-model'

const dateColumn = customColumnFactory.date().build({name: 'Due Date'})
const dateColumnModel = new DateColumnModel(dateColumn)

function sortByDateField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareDateField(left, right, dateColumnModel, desc))
}

function columnValue(dateStr: string) {
  return columnValueFactory.date(dateStr, 'Due Date', [dateColumn]).build()
}

function createIssue(dateStr?: string, params?: Partial<Issue>) {
  if (dateStr) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(dateStr)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareDateField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue('2021-05-22')
    const secondItem = createIssue('2022-11-03')

    const ascending = sortByDateField([secondItem, firstItem], false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByDateField([secondItem, firstItem], true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue('2022-07-12')
    const secondItem = createIssue()

    const ascending = sortByDateField([secondItem, firstItem], false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByDateField([secondItem, firstItem], true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue('2022-06-12', {id: 19})
    const secondItem = createIssue('2022-06-12', {id: 12})
    const thirdItem = createIssue('2022-06-12', {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByDateField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByDateField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue('2022-11-22')
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const ascending = sortByDateField([redactedItem, itemWithoutValue, itemWithValue], false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByDateField([redactedItem, itemWithoutValue, itemWithValue], true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
