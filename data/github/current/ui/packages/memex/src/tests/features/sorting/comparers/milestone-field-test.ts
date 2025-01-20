import {type Milestone, MilestoneState} from '../../../../client/api/common-contracts'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareMilestoneField} from '../../../../client/features/sorting/comparers/milestone-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

const firstMilestone: Milestone = {
  title: 'First Milestone',
  id: 1234,
  url: 'https://github.com/github/memex/milestones/1234',
  state: MilestoneState.Open,
  repoNameWithOwner: 'github/memex',
}

const secondMilestone: Milestone = {
  title: 'Second Milestone',
  id: 5678,
  url: 'https://github.com/github/memex/milestones/5678',
  state: MilestoneState.Open,
  repoNameWithOwner: 'github/memex',
}

function sortByMilestone(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareMilestoneField(left, right, desc))
}

function columnValue(milestone: Milestone) {
  return columnValueFactory.milestone(milestone).build()
}

function createIssue(milestone?: Milestone, params?: Partial<Issue>) {
  if (milestone) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(milestone)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareMilestoneField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue(firstMilestone)
    const secondItem = createIssue(secondMilestone)

    const items = [secondItem, firstItem]

    const ascending = sortByMilestone(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByMilestone(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue(firstMilestone)
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortByMilestone(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByMilestone(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue(firstMilestone, {id: 19})
    const secondItem = createIssue(firstMilestone, {id: 12})
    const thirdItem = createIssue(firstMilestone, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByMilestone(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByMilestone(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue(firstMilestone)
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByMilestone(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByMilestone(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
