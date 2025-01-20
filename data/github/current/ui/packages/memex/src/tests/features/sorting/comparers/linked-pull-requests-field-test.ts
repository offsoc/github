import {type LinkedPullRequest, PullRequestState} from '../../../../client/api/common-contracts'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareLinkedPullRequestsField} from '../../../../client/features/sorting/comparers/linked-pull-requests-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByLinkedPullRequestsField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareLinkedPullRequestsField(left, right, desc))
}

function columnValue(linkedPullRequests: Array<LinkedPullRequest>) {
  return columnValueFactory.linkedPullRequests(linkedPullRequests).build()
}

function createIssue(linkedPullRequests: Array<LinkedPullRequest>, params?: Partial<Issue>) {
  return createMemexItemModel(issueFactory.withColumnValues([columnValue(linkedPullRequests)]).build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareLinkedPullRequestsField', () => {
  it('sorts items with values into expected order', () => {
    const firstPullRequest: LinkedPullRequest = {
      id: 1234,
      number: 10,
      url: 'https://github.com/github/memex/pull/10',
      isDraft: false,
      state: PullRequestState.Merged,
    }

    const secondPullRequest: LinkedPullRequest = {
      id: 5678,
      number: 20,
      url: 'https://github.com/github/memex/pull/20',
      isDraft: false,
      state: PullRequestState.Merged,
    }

    const thirdPullRequest: LinkedPullRequest = {
      id: 999,
      number: 300,
      url: 'https://github.com/github/memex/pull/300',
      isDraft: false,
      state: PullRequestState.Merged,
    }

    const firstItem = createIssue([firstPullRequest, secondPullRequest])
    const secondItem = createIssue([thirdPullRequest])

    const items = [secondItem, firstItem]

    const ascending = sortByLinkedPullRequestsField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByLinkedPullRequestsField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const somePullRequest: LinkedPullRequest = {
      id: 999,
      number: 440,
      url: 'https://github.com/github/memex/pull/440',
      isDraft: false,
      state: PullRequestState.Merged,
    }

    const firstItem = createIssue([somePullRequest])
    const secondItem = createIssue([])

    const items = [secondItem, firstItem]

    const ascending = sortByLinkedPullRequestsField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByLinkedPullRequestsField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const reviews: Array<LinkedPullRequest> = [
      {
        id: 999,
        number: 500,
        url: 'https://github.com/github/memex/pull/500',
        isDraft: false,
        state: PullRequestState.Merged,
      },
    ]

    const firstItem = createIssue(reviews, {id: 19})
    const secondItem = createIssue(reviews, {id: 12})
    const thirdItem = createIssue(reviews, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByLinkedPullRequestsField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByLinkedPullRequestsField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const anotherPullRequest: LinkedPullRequest = {
      id: 999,
      number: 500,
      url: 'https://github.com/github/memex/pull/500',
      isDraft: false,
      state: PullRequestState.Merged,
    }

    const itemWithValue = createIssue([anotherPullRequest])
    const itemWithoutValue = createIssue([])
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByLinkedPullRequestsField(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByLinkedPullRequestsField(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
