import {buildReview} from '../../../test-utils/query-data'
import {sortByState} from '../review-helpers'

describe('sortByState', () => {
  test('it sorts reviews by APPROVED, CHANGES_REQUESTED, COMMENTED, DISMISSED, PENDING', () => {
    const reviews = [
      buildReview({login: 'reviewer1', state: 'COMMENTED'}),
      buildReview({login: 'reviewer2', state: 'CHANGES_REQUESTED'}),
      buildReview({login: 'reviewer3', state: 'APPROVED'}),
      buildReview({login: 'reviewer4', state: 'DISMISSED'}),
      buildReview({login: 'reviewer5', state: 'PENDING'}),
    ]
    const sortedReviews = reviews.sort(sortByState)
    expect(sortedReviews.map(node => node.author.login)).toEqual([
      'reviewer3',
      'reviewer2',
      'reviewer1',
      'reviewer4',
      'reviewer5',
    ])
  })

  test('it handles duplicates', () => {
    const reviews = [
      buildReview({login: 'reviewer1', state: 'APPROVED'}),
      buildReview({login: 'reviewer2', state: 'COMMENTED'}),
      buildReview({login: 'reviewer3', state: 'CHANGES_REQUESTED'}),
      buildReview({login: 'reviewer4', state: 'COMMENTED'}),
      buildReview({login: 'reviewer5', state: 'APPROVED'}),
      buildReview({login: 'reviewer6', state: 'DISMISSED'}),
      buildReview({login: 'reviewer7', state: 'CHANGES_REQUESTED'}),
    ]
    const sortedReviews = reviews.sort(sortByState)
    expect(sortedReviews.map(node => node.author.login)).toEqual([
      'reviewer1',
      'reviewer5',
      'reviewer3',
      'reviewer7',
      'reviewer2',
      'reviewer4',
      'reviewer6',
    ])
  })
})
