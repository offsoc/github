import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareIterationField} from '../../../../client/features/sorting/comparers/iteration-field'
import {IterationColumnModel} from '../../../../client/models/column-model/custom/iteration'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

const iterationColumn = customColumnFactory
  .iteration({
    configuration: {
      startDay: 1,
      duration: 7,
      iterations: [
        {startDate: '2022-07-07', title: 'Sprint 1', titleHtml: 'Sprint 1', duration: 7, id: '1'},
        {startDate: '2022-07-14', title: 'Sprint 2', titleHtml: 'Sprint 2', duration: 7, id: '2'},
        {startDate: '2022-07-21', title: 'Sprint 3', titleHtml: 'Sprint 3', duration: 7, id: '3'},
      ],
      completedIterations: [],
    },
  })
  .build({name: 'Sprint'})

const iterationColumnModel = new IterationColumnModel(iterationColumn)

function sortByIterationField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareIterationField(left, right, iterationColumnModel, desc))
}

function columnValue(iterationTitle: string) {
  return columnValueFactory.iteration(iterationTitle, 'Sprint', [iterationColumn]).build()
}

function createIssue(iterationTitle?: string, params?: Partial<Issue>) {
  if (iterationTitle) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(iterationTitle)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareIterationField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue('Sprint 1')
    const secondItem = createIssue('Sprint 3')

    const items = [secondItem, firstItem]

    const ascending = sortByIterationField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByIterationField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue('Sprint 2')
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortByIterationField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByIterationField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue('Sprint 3', {id: 19})
    const secondItem = createIssue('Sprint 3', {id: 12})
    const thirdItem = createIssue('Sprint 3', {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByIterationField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByIterationField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue('Sprint 2')
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByIterationField(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByIterationField(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
