import type {ReviewDetails_pullRequest$data} from './__generated__/ReviewDetails_pullRequest.graphql'
import type {PullRequestReviewState} from './__generated__/Reviewers_pullRequest.graphql'

type Review =
  | NonNullable<NonNullable<NonNullable<ReviewDetails_pullRequest$data['latestReviews']>['edges']>[number]>['node']
  | null
  | undefined

function getStateRanking(state: PullRequestReviewState | undefined) {
  switch (state) {
    case 'APPROVED':
      return 0
    case 'CHANGES_REQUESTED':
      return 1
    case 'COMMENTED':
      return 2
    case 'DISMISSED':
      return 3
    case 'PENDING':
      return 4
    default:
      return 5
  }
}

/**
 * Comparison function to sort reviews by ranked state
 */
export function sortByState(reviewA: Review, reviewB: Review): number {
  return getStateRanking(reviewA?.state) - getStateRanking(reviewB?.state)
}
