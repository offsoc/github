/**
 *  Returns a text summary of the counts of change requests and approvals
 *  for screen readers
 *
 *  examples:
 *   - "2 approving reviews"
 *   - "1 change requested, 2 approving review"
 *   - "2 changes requested, 2 approving reviews"
 */
export function accessibleReviewSummary(
  reviews: Array<{state: string; authorCanPushToRepository: boolean} | null | undefined>,
): string {
  const changeRequests = reviews.filter(
    review => review && review.state === 'CHANGES_REQUESTED' && review.authorCanPushToRepository,
  ).length
  const approvals = reviews.filter(
    review => review && review.state === 'APPROVED' && review.authorCanPushToRepository,
  ).length

  if (changeRequests === 0 && approvals === 0) {
    return 'No applicable reviews submitted'
  }

  const changeRequestText =
    changeRequests > 0 ? `${changeRequests} change${changeRequests === 1 ? '' : 's'} requested` : undefined
  const approvalText = approvals > 0 ? `${approvals} approving review${approvals === 1 ? '' : 's'}` : undefined

  const summaryText = [changeRequestText, approvalText].filter(Boolean).join(', ')

  return summaryText
}
