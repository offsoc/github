import {TimelineRow} from '@github-ui/timeline-items/TimelineRow'
import {EyeIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import type {ReviewRequestedEvent_reviewRequestedEvent$key} from './__generated__/ReviewRequestedEvent_reviewRequestedEvent.graphql'

function RequestedReviewFrom({reviewer, reviewerPath}: {reviewer: string; reviewerPath: string}) {
  return (
    <span>
      requested a review from{' '}
      <Link inline href={reviewerPath} sx={{color: 'fg.default'}}>
        {reviewer}
      </Link>{' '}
    </span>
  )
}

function AssignedFrom({assignedFromTeamName}: {assignedFromTeamName?: string}) {
  if (!assignedFromTeamName) return null

  return <span>(assigned from {assignedFromTeamName}) </span>
}

function AsCodeowner({codeOwnersResourcePath}: {codeOwnersResourcePath?: string}) {
  if (!codeOwnersResourcePath) return null

  return (
    <span>
      as a{' '}
      <Link inline href={codeOwnersResourcePath} sx={{color: 'fg.default'}}>
        code owner
      </Link>{' '}
    </span>
  )
}

export type ReviewRequestedEventProps = {
  queryRef: ReviewRequestedEvent_reviewRequestedEvent$key
  pullRequestUrl: string
}

export function ReviewRequestedEvent({queryRef, pullRequestUrl}: ReviewRequestedEventProps) {
  const {actor, requestedReviewAssignedFromTeamName, reviewRequest, createdAt, databaseId} = useFragment(
    graphql`
      fragment ReviewRequestedEvent_reviewRequestedEvent on ReviewRequestedEvent {
        actor {
          ...TimelineRowEventActor
        }
        requestedReviewAssignedFromTeamName
        reviewRequest {
          codeOwnersResourcePath
          requestedReviewer {
            __typename
            ... on User {
              login
              resourcePath
            }

            ... on Team {
              combinedSlug
              resourcePath
            }
          }
        }
        createdAt
        databaseId
      }
    `,
    queryRef,
  )

  const requestedReviewer = reviewRequest?.requestedReviewer

  let reviewer = null
  switch (requestedReviewer?.__typename) {
    case 'User':
      reviewer = requestedReviewer.login
      break
    case 'Team':
      reviewer = requestedReviewer.combinedSlug
      break
    default:
      // Unsupported type - don't render
      return null
  }

  return (
    <TimelineRow
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={`${pullRequestUrl}#event-${databaseId}`}
      highlighted={false}
      leadingIcon={EyeIcon}
    >
      <TimelineRow.Main>
        <RequestedReviewFrom reviewer={reviewer} reviewerPath={requestedReviewer.resourcePath} />
        <AssignedFrom assignedFromTeamName={requestedReviewAssignedFromTeamName ?? undefined} />
        <AsCodeowner codeOwnersResourcePath={reviewRequest?.codeOwnersResourcePath ?? undefined} />
      </TimelineRow.Main>
    </TimelineRow>
  )
}
