import type {Review} from '../../../../client/api/common-contracts'
import type {Issue} from '../../../../client/api/memex-items/contracts'
import {compareReviewersField} from '../../../../client/features/sorting/comparers/reviewers-field'
import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'

function sortByReviewersField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareReviewersField(left, right, desc))
}

function columnValue(reviewers: Array<Review>) {
  return columnValueFactory.reviewers(reviewers).build()
}

function createIssue(reviewers: Array<Review>, params?: Partial<Issue>) {
  return createMemexItemModel(issueFactory.withColumnValues([columnValue(reviewers)]).build(params))
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('compareReviewersField', () => {
  it('sorts items with values into expected order', () => {
    const firstPullRequest: Review = {
      reviewer: {
        type: 'Team',
        name: 'memex/reviewers',
        id: 1234,
        url: 'https://github.com/orgs/github/teams/memex-reviewers',
        avatarUrl: 'https://github.com/orgs/github/teams/memex-reviewers.png',
      },
    }

    const secondPullRequest: Review = {
      reviewer: {
        type: 'User',
        name: 'dmarcey',
        id: 5678,
        url: 'https://github.com/dmarcey',
        avatarUrl: 'https://github.com/dmarcey.png',
      },
    }

    const thirdPullRequest: Review = {
      reviewer: {
        type: 'User',
        name: 'shiftkey',
        id: 9999,
        url: 'https://github.com/shiftkey',
        avatarUrl: 'https://github.com/shiftkey.png',
      },
    }

    const firstItem = createIssue([firstPullRequest, secondPullRequest])
    const secondItem = createIssue([thirdPullRequest])

    const items = [secondItem, firstItem]

    const ascending = sortByReviewersField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByReviewersField(items, true)

    expect(descending).toMatchObject([secondItem, firstItem])
  })

  it('puts items without value after other items', () => {
    const someReview: Review = {
      reviewer: {
        type: 'User',
        name: 'j0siepy',
        id: 9999,
        url: 'https://github.com/j0siepy',
        avatarUrl: 'https://github.com/j0siepy.png',
      },
    }

    const firstItem = createIssue([someReview])
    const secondItem = createIssue([])

    const items = [secondItem, firstItem]

    const ascending = sortByReviewersField(items, false)

    expect(ascending).toMatchObject([firstItem, secondItem])

    const descending = sortByReviewersField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem])
  })

  it('applies predictable order when items have same value', () => {
    const reviews: Array<Review> = [
      {
        reviewer: {
          type: 'User',
          name: 'jellobagel',
          id: 9999,
          url: 'https://github.com/jellobagel',
          avatarUrl: 'https://github.com/jellobagel.png',
        },
      },
    ]

    const firstItem = createIssue(reviews, {id: 19})
    const secondItem = createIssue(reviews, {id: 12})
    const thirdItem = createIssue(reviews, {id: 4})

    const items = [secondItem, firstItem, thirdItem]

    const ascending = sortByReviewersField(items, false)

    expect(ascending).toMatchObject([thirdItem, secondItem, firstItem])

    const descending = sortByReviewersField(items, true)

    expect(descending).toMatchObject([firstItem, secondItem, thirdItem])
  })

  it('puts redacted items at the end of the array', () => {
    const anotherReview: Review = {
      reviewer: {
        type: 'User',
        name: 'jellobagel',
        id: 9999,
        url: 'https://github.com/jellobagel',
        avatarUrl: 'https://github.com/jellobagel.png',
      },
    }

    const itemWithValue = createIssue([anotherReview])
    const itemWithoutValue = createIssue([])
    const redactedItem = createRedactedItem()

    const items = [redactedItem, itemWithoutValue, itemWithValue]

    const ascending = sortByReviewersField(items, false)

    expect(ascending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])

    const descending = sortByReviewersField(items, true)

    // redacted item is always at the bottom, even in descending
    expect(descending).toMatchObject([itemWithValue, itemWithoutValue, redactedItem])
  })
})
