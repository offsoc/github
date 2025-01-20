import {userHovercardPath} from '@github-ui/paths'
import {ReviewerAvatar} from '@github-ui/reviewer-avatar'
import {useAnalytics} from '@github-ui/use-analytics'
import {CheckIcon, CodeReviewIcon, FileDiffIcon, XIcon} from '@primer/octicons-react'
import {ActionList, CircleOcticon, Label, Tooltip} from '@primer/react'
import {clsx} from 'clsx'
import {useState} from 'react'

import {accessibleReviewSummary} from '../../accessible-review-summary'
import {HEADER_ICON_SIZE} from '../../constants'
import {MergeBoxSectionHeader} from './common/MergeBoxSectionHeader'
import type {PullRequestReviewState, PullRequestRuleFailureReason, Review} from '../../types'
import styles from './ReviewerSection.module.css'
import {MergeBoxExpandable} from './common/MergeBoxExpandable'

export enum ConsolidatedReviewState {
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  REVIEWED = 'REVIEWED',
}

export const getReviewsState = (
  reviewsRequired: number,
  isCodeownersRequired: boolean,
  reviews: Array<{
    authorCanPushToRepository: boolean
    state: PullRequestReviewState
  }>,
  failureReasons: PullRequestRuleFailureReason[],
): ConsolidatedReviewState => {
  if (failureReasons.length === 0 && reviews.length > 0 && (reviewsRequired > 0 || isCodeownersRequired)) {
    return ConsolidatedReviewState.APPROVED
  }
  if (
    failureReasons.includes('CODE_OWNER_REVIEW_REQUIRED') ||
    failureReasons.includes('SOC2_APPROVAL_PROCESS_REQUIRED') ||
    failureReasons.includes('MORE_REVIEWS_REQUIRED')
  ) {
    return ConsolidatedReviewState.REVIEW_REQUIRED
  }
  if (failureReasons.includes('CHANGES_REQUESTED')) {
    return ConsolidatedReviewState.CHANGES_REQUESTED
  }
  // we can assume if we fall through to here that there is a review because if
  // no reviews are required and we have none, we return early and don't render
  return ConsolidatedReviewState.REVIEWED
}

const reviewRequiredSummary = (reviewsRequired: number, failureReasons: PullRequestRuleFailureReason[]): string => {
  if (failureReasons.includes('MORE_REVIEWS_REQUIRED')) {
    if (reviewsRequired === 1) {
      return 'At least 1 approving review is required'
    } else {
      return `At least ${reviewsRequired} approving reviews are required`
    }
  } else {
    if (failureReasons.includes('CODE_OWNER_REVIEW_REQUIRED')) {
      return 'Code owner review required'
    } else if (failureReasons.includes('SOC2_APPROVAL_PROCESS_REQUIRED')) {
      return 'A review from a compliance team is required'
    }
  }
  return ''
}

const heading: {[key: string]: string} = {
  APPROVED: 'Changes approved',
  CHANGES_REQUESTED: 'Changes requested',
  REVIEW_REQUIRED: 'Review required',
  REVIEWED: 'Changes reviewed',
}

const icon: {[key: string]: JSX.Element} = {
  APPROVED: (
    <CircleOcticon
      className="bgColor-success-emphasis fgColor-onEmphasis"
      icon={() => <CheckIcon size={16} />}
      size={HEADER_ICON_SIZE}
    />
  ),
  CHANGES_REQUESTED: (
    <CircleOcticon
      className="bgColor-danger-emphasis fgColor-onEmphasis"
      icon={() => <FileDiffIcon size={16} />}
      size={HEADER_ICON_SIZE}
    />
  ),
  REVIEW_REQUIRED: (
    <CircleOcticon
      className="bgColor-danger-emphasis fgColor-onEmphasis"
      icon={() => <XIcon size={16} />}
      size={HEADER_ICON_SIZE}
    />
  ),
  REVIEWED: (
    <CircleOcticon
      className={clsx(styles.reviewedIcon, 'fgColor-onEmphasis')}
      icon={() => <CodeReviewIcon size={16} />}
      size={HEADER_ICON_SIZE}
    />
  ),
}

const joinWithAnd = (items: string[]) => {
  if (items.length === 0) {
    return ''
  } else if (items.length === 1) {
    return items[0]
  } else if (items.length === 2) {
    return items.join(' and ')
  } else {
    const last = items.pop()
    return `${items.join(', ')}, and ${last}`
  }
}

const reviewStatusText = (state: string, onBehalfOf: string[]) => {
  let statusText = ''
  switch (state) {
    case 'APPROVED':
      statusText += 'Approved these changes'
      break
    case 'CHANGES_REQUESTED':
      statusText += 'Requested changes'
      break
    case 'COMMENTED':
      statusText += 'Commented'
      break
  }
  if (state === 'APPROVED' && onBehalfOf.length > 0) {
    statusText += ` for ${joinWithAnd(onBehalfOf)}`
  }
  return statusText
}

const isReviewRelatedFailureReason = (r: PullRequestRuleFailureReason) => {
  return (
    r === 'CODE_OWNER_REVIEW_REQUIRED' ||
    r === 'SOC2_APPROVAL_PROCESS_REQUIRED' ||
    r === 'CHANGES_REQUESTED' ||
    r === 'MORE_REVIEWS_REQUIRED'
  )
}

export type ReviewerSectionProps = {
  reviewerRuleRollups: Array<{
    requiredReviewers?: number
    requiresCodeowners?: boolean
    failureReasons?: PullRequestRuleFailureReason[]
  }>
  latestOpinionatedReviews: Review[]
}

/**
 * Renders a collapsible section with a list of reviewers and their reviews.
 */
export function ReviewerSection({reviewerRuleRollups, latestOpinionatedReviews}: ReviewerSectionProps) {
  const reviews = latestOpinionatedReviews
  const [reviewersExpanded, setReviewersExpanded] = useState(false)
  const {sendAnalyticsEvent} = useAnalytics()

  const reviewRules = reviewerRuleRollups

  const requiredReviewCounts = reviewRules?.flatMap(rule => rule.requiredReviewers || []) || []
  const numReviewsRequired = requiredReviewCounts.length ? Math.max(...requiredReviewCounts) : 0

  const codeownersRequiredRules = reviewRules?.filter(rule => rule.requiresCodeowners) || []
  const codeownersRequired = codeownersRequiredRules.length > 0

  const allFailureReasons = reviewRules?.flatMap(rule => rule.failureReasons || []) || []
  const consolidatedFailureReasons = [...new Set(allFailureReasons)].filter(isReviewRelatedFailureReason)

  const reviewsState = getReviewsState(numReviewsRequired, codeownersRequired, reviews, consolidatedFailureReasons)

  // don't render if there are no reviews and no reviews are required
  if (reviews.length === 0 && consolidatedFailureReasons.length === 0) {
    return null
  }

  return (
    <section aria-label="Reviews" className="border-bottom color-border-subtle">
      <MergeBoxSectionHeader
        title={heading[reviewsState]}
        subtitle={`${
          reviewsState === ConsolidatedReviewState.REVIEW_REQUIRED
            ? reviewRequiredSummary(numReviewsRequired, consolidatedFailureReasons)
            : accessibleReviewSummary(reviews)
        }
          by reviewers with write access.`}
        icon={icon[reviewsState]}
        expandableProps={
          reviews.length > 0
            ? {
                ariaLabel: reviewersExpanded ? 'Collapse reviews' : 'Expand reviews',
                isExpanded: reviewersExpanded,
                onToggle: () => {
                  const eventType = reviewersExpanded ? 'reviewers_section.collapse' : 'reviewers_section.expand'
                  const eventTarget = 'MERGEBOX_REVIEWERS_SECTION_TOGGLE_BUTTON'
                  sendAnalyticsEvent(eventType, eventTarget)
                  setReviewersExpanded(!reviewersExpanded)
                },
              }
            : undefined
        }
      />
      <MergeBoxExpandable isExpanded={reviewersExpanded}>
        <ActionList showDividers>
          {reviews.map(review => {
            const onBehalfOfTeams = review.onBehalfOf
            return (
              review.author && (
                <ActionList.LinkItem
                  key={review.author.login}
                  data-hovercard-url={userHovercardPath({owner: review.author.login})}
                  href={review.author.url}
                  className={styles.reviewerRow}
                >
                  <ActionList.LeadingVisual>
                    <ReviewerAvatar
                      author={{login: review.author.login, avatarUrl: review.author.avatarUrl}}
                      state={review.state}
                    />
                  </ActionList.LeadingVisual>
                  <div className={clsx(styles.reviewAuthor)}>{review.author.login}</div>
                  <ActionList.Description>{reviewStatusText(review.state, onBehalfOfTeams)}</ActionList.Description>
                  {review.authorCanPushToRepository || (
                    <ActionList.TrailingVisual>
                      <Label>
                        <Tooltip aria-label="User has read access to this repository" direction="n">
                          Read-only
                        </Tooltip>
                      </Label>
                    </ActionList.TrailingVisual>
                  )}
                </ActionList.LinkItem>
              )
            )
          })}
        </ActionList>
      </MergeBoxExpandable>
    </section>
  )
}
