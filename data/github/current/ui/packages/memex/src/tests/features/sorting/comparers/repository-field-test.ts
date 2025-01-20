import type {ExtendedRepository} from '../../../../client/api/common-contracts'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareRepositoryField} from '../../../../client/features/sorting/comparers/repository-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByRepository(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareRepositoryField(left, right, desc))
}

function columnValue(repository: ExtendedRepository) {
  return columnValueFactory.repository(repository).build()
}

function createIssue(repository?: ExtendedRepository, params?: Partial<Issue>) {
  if (repository) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(repository)]).build(params))
  }

  return createMemexItemModel(issueFactory.build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

const memexRepository: ExtendedRepository = {
  name: 'memex',
  nameWithOwner: 'github/memex',
  id: 1111,
  url: 'https://github.com/github/memex',
  isForked: false,
  isPublic: false,
  isArchived: false,
  hasIssues: true,
}

const planningTrackingRepo: ExtendedRepository = {
  name: 'planning-tracking',
  nameWithOwner: 'github/planning-tracking',
  id: 2222,
  url: 'https://github.com/github/planning-tracking',
  isForked: false,
  isPublic: false,
  isArchived: false,
  hasIssues: true,
}

const issuesRepository: ExtendedRepository = {
  name: 'memex',
  nameWithOwner: 'github/issues',
  id: 8888,
  url: 'https://github.com/github/issues',
  isForked: false,
  isPublic: false,
  isArchived: false,
  hasIssues: true,
}

describe('compareRepositoryField', () => {
  it('sorts items with values into expected order', () => {
    const firstItem = createIssue(memexRepository)
    const secondItem = createIssue(planningTrackingRepo)

    const items = [secondItem, firstItem]

    const ascending = sortByRepository(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByRepository(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const firstItem = createIssue(issuesRepository)
    const secondItem = createIssue()

    const items = [secondItem, firstItem]

    const ascending = sortByRepository(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByRepository(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const firstItem = createIssue(issuesRepository, {id: 19})
    const secondItem = createIssue(issuesRepository, {id: 12})
    const thirdItem = createIssue(issuesRepository, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByRepository(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByRepository(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const itemWithValue = createIssue(memexRepository)
    const itemWithoutValue = createIssue()
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByRepository(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByRepository(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
