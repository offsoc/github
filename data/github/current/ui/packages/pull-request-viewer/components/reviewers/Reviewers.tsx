import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {Section} from '@github-ui/issue-metadata/Section'
import {SectionHeader} from '@github-ui/issue-metadata/SectionHeader'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import useSafeState from '@github-ui/use-safe-state'
import {Box} from '@primer/react'
import {Suspense, useCallback, useMemo} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import requestReviewsMutation from '../../mutations/request-reviews-mutation'
import type {Reviewers_pullRequest$key} from './__generated__/Reviewers_pullRequest.graphql'
import CodeownersToBeAssigned from './CodeownersToBeAssigned'
import ReviewDetails from './ReviewDetails'
import {LazyReviewerPicker} from './ReviewersPicker'
import ReviewRequestDetails from './ReviewRequestDetails'
import SuggestedReviewers from './SuggestedReviewers'

/**
 * The Reviewers section of the sidebar that displays
 * the reviews, review requests, reviewers who will be assigned as codeowners, and suggested reviewers
 * of a pull request
 */
export default function Reviewers({pullRequest}: {pullRequest: Reviewers_pullRequest$key}) {
  const reviewRequestData = useFragment(
    graphql`
      fragment Reviewers_pullRequest on PullRequest
      @argumentDefinitions(
        latestReviewsCount: {type: "Int", defaultValue: 100}
        reviewRequestsCount: {type: "Int", defaultValue: 100}
      ) {
        ...ReviewRequestDetails_pullRequest
        ...ReviewDetails_pullRequest
        id
        isDraft
        state
        viewerCanUpdate
        codeowners {
          __typename
        }
        latestReviews(first: $latestReviewsCount, preferOpinionatedReviews: true) {
          edges {
            node {
              author {
                login
              }
              state
            }
          }
        }
        reviewRequests(first: $reviewRequestsCount) {
          edges {
            node {
              requestedReviewer {
                ... on User {
                  id
                  __typename
                }
                ... on Team {
                  id
                  __typename
                }
              }
            }
          }
        }
      }
    `,
    pullRequest,
  )

  const [updatingRequestedReviewers, setUpdatingRequestedReviewers] = useSafeState(false)
  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()

  const reviewRequests = reviewRequestData.reviewRequests?.edges?.map(edge => edge?.node)
  const reviews = reviewRequestData.latestReviews?.edges?.map(edge => edge?.node)
  const codeowners = reviewRequestData.codeowners
  const noReviewRequests = !reviewRequests || reviewRequests.length === 0
  const noReviews = !reviews || reviews.length === 0
  const noCodeowners = !codeowners || codeowners.length === 0

  // Show suggested reviewers if there are no reviews, review requests, or codeowners to show
  const showSuggestedReviewers = noReviewRequests && noReviews && noCodeowners

  const reviewerLogins = useMemo(() => {
    const reviewerNodes = reviewRequestData.latestReviews?.edges?.map(edge => edge?.node)
    if (!reviewerNodes) return []
    const logins = []
    for (const review of reviewerNodes) {
      if (review?.author?.login) {
        logins.push(review.author.login)
      }
    }

    return logins
  }, [reviewRequestData.latestReviews?.edges])

  const [requestedReviewerIds, requestedUserIds, requestedTeamIds] = useMemo(() => {
    const reviewerNodes = reviewRequestData.reviewRequests?.edges?.map(edge => edge?.node)
    if (!reviewerNodes) return [[], [], []]

    const teamIds: string[] = []
    const userIds: string[] = []
    for (const reviewerNode of reviewerNodes) {
      const reviewer = reviewerNode?.requestedReviewer
      if (!reviewer) continue
      if (reviewer.__typename === 'User') {
        userIds.push(reviewer.id)
      } else if (reviewer.__typename === 'Team') {
        teamIds.push(reviewer.id)
      }
    }

    const combinedIds = [...userIds, ...teamIds]

    // Return the combined ids and the user and team ids separately so we can use them when deleting reviewers
    return [combinedIds, userIds, teamIds]
  }, [reviewRequestData.reviewRequests?.edges])

  const updateRequestedReviewers = useCallback(
    (updatedTeamIds?: string[], updatedUserIds?: string[], failureMessage?: string) => {
      if (updatingRequestedReviewers) return
      if (!updatedTeamIds && !updatedUserIds) return

      updatedTeamIds = updatedTeamIds ?? requestedTeamIds
      updatedUserIds = updatedUserIds ?? requestedUserIds

      setUpdatingRequestedReviewers(true)
      requestReviewsMutation({
        environment,
        input: {pullRequestId: reviewRequestData.id, teamIds: updatedTeamIds, userIds: updatedUserIds},
        onCompleted: () => {
          setUpdatingRequestedReviewers(false)
        },
        onError: () => {
          setUpdatingRequestedReviewers(false)
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: failureMessage ?? 'Failed to update requested reviewers',
          })
        },
      })
    },
    [
      addToast,
      environment,
      requestedTeamIds,
      requestedUserIds,
      reviewRequestData.id,
      setUpdatingRequestedReviewers,
      updatingRequestedReviewers,
    ],
  )

  const requestUserReview = useCallback(
    (reviewerId: string) => updateRequestedReviewers(undefined, [reviewerId], 'Failed to request review'),
    [updateRequestedReviewers],
  )

  const viewerCanRequestReviews = reviewRequestData.state === 'OPEN' && reviewRequestData.viewerCanUpdate

  const reviewerSectionHeader = useMemo(() => {
    return viewerCanRequestReviews ? (
      <LazyReviewerPicker
        anchorElement={props => <SectionHeader buttonProps={props} headingProps={{as: 'h3'}} title="Reviewers" />}
        assignedReviewerIds={requestedReviewerIds}
        isRequestingReviews={updatingRequestedReviewers}
        pullRequestId={reviewRequestData.id}
        onUpdateRequestedReviewers={updateRequestedReviewers}
      />
    ) : (
      <ReadonlySectionHeader headingProps={{as: 'h3'}} title="Reviewers" />
    )
  }, [
    viewerCanRequestReviews,
    requestedReviewerIds,
    updatingRequestedReviewers,
    reviewRequestData,
    updateRequestedReviewers,
  ])

  return (
    <Section data-testid="label-section" sectionHeader={reviewerSectionHeader}>
      <Box as="ul" sx={{width: '100%', listStyleType: 'none'}}>
        {showSuggestedReviewers ? (
          <Suspense fallback={<Loading />}>
            <SuggestedReviewers
              isRequestingReviews={updatingRequestedReviewers}
              pullRequestId={reviewRequestData.id}
              onRequestReview={requestUserReview}
            />
          </Suspense>
        ) : (
          <>
            <ReviewDetails pullRequest={reviewRequestData} />
            <ReviewRequestDetails
              pullRequest={reviewRequestData}
              updateRequestedReviewers={updateRequestedReviewers}
              viewerCanRequestReviews={viewerCanRequestReviews}
            />
          </>
        )}

        {reviewRequestData.isDraft && (
          <Suspense fallback={<Loading />}>
            <CodeownersToBeAssigned
              pullRequestId={reviewRequestData.id}
              requestedReviewerIds={requestedReviewerIds}
              reviewerLogins={reviewerLogins}
            />
          </Suspense>
        )}
      </Box>
    </Section>
  )
}

function Loading(): JSX.Element {
  return (
    <div className="d-flex flex-column gap-2 pt-2 px-3">
      <LoadingSkeleton height="md" variant="rounded" width="clamp(80px, 70%, 240px)" />
      <LoadingSkeleton height="md" variant="rounded" width="clamp(120px, 90%, 260px)" />
      <LoadingSkeleton height="md" variant="rounded" width="clamp(90px, 80%, 260px)" />
    </div>
  )
}
