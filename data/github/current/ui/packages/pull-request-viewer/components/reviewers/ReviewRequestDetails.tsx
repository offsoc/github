import {teamHovercardPath, userHovercardPath} from '@github-ui/paths'
import {TrashIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import {useMemo} from 'react'
import {graphql, useFragment} from 'react-relay'

import type {ReviewRequestDetails_pullRequest$key} from './__generated__/ReviewRequestDetails_pullRequest.graphql'
import Reviewer from './Reviewer'

type ReviewRequestDetailsProps = {
  pullRequest: ReviewRequestDetails_pullRequest$key
  updateRequestedReviewers: (updatedTeamIds?: string[], updatedUserIds?: string[], failureMessage?: string) => void
  viewerCanRequestReviews: boolean
}

function CancelReviewRequestButton({
  requestedReviewer,
  onDeleteReviewer,
}: {
  requestedReviewer: string
  onDeleteReviewer: () => void
}) {
  return (
    // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
    <IconButton
      aria-label={`Cancel review request to ${requestedReviewer}`}
      icon={TrashIcon}
      size="small"
      sx={{flexShrink: 0}}
      unsafeDisableTooltip={true}
      variant="invisible"
      onClick={onDeleteReviewer}
    />
  )
}

/**
 * Displays the details of a review request, including codeowner information
 * provides the ability to delete/cancel a review request
 */
export default function ReviewRequestDetails({
  pullRequest,
  updateRequestedReviewers,
  viewerCanRequestReviews,
}: ReviewRequestDetailsProps) {
  const reviewRequestData = useFragment(
    graphql`
      fragment ReviewRequestDetails_pullRequest on PullRequest
      @argumentDefinitions(reviewRequestsCount: {type: "Int", defaultValue: 100}) {
        id
        reviewRequests(first: $reviewRequestsCount) {
          edges {
            node {
              asCodeOwner
              assignedFromReviewRequest {
                requestedReviewer {
                  ... on Team {
                    id
                    __typename
                    name
                  }
                  ... on User {
                    id
                    login
                    __typename
                  }
                }
                asCodeOwner
              }
              requestedReviewer {
                ... on User {
                  id
                  avatarUrl
                  login
                  url
                  __typename
                }
                ... on Team {
                  combinedSlug
                  id
                  teamAvatarUrl: avatarUrl
                  name
                  url
                  organization {
                    name
                  }
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

  const reviewRequests = reviewRequestData.reviewRequests?.edges?.map(edge => edge?.node)

  const [requestedUserIds, requestedTeamIds] = useMemo(() => {
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

    // Return the user and team ids separately so we can use them when deleting reviewers
    return [userIds, teamIds]
  }, [reviewRequestData.reviewRequests?.edges])

  return (
    <>
      {reviewRequests?.map(node => {
        const requestedReviewer = node?.requestedReviewer
        if (!requestedReviewer) return null
        if (requestedReviewer.__typename === 'Team') {
          const isCodeowner = node.asCodeOwner
          const handleDeleteReviewer = () => {
            // remove the reviewer from the list of requested reviewers
            const updatedTeamIds = [...requestedTeamIds]
            updatedTeamIds.splice(updatedTeamIds.indexOf(requestedReviewer.id), 1)
            updateRequestedReviewers(
              updatedTeamIds,
              requestedUserIds,
              `Failed to remove reviewer ${requestedReviewer.name}`,
            )
          }

          return (
            <Reviewer
              key={requestedReviewer.name}
              avatarUrl={requestedReviewer.teamAvatarUrl || ''}
              codeownerTooltip={isCodeowner ? `${requestedReviewer.combinedSlug} is a codeowner` : undefined}
              displayName={requestedReviewer.name}
              reviewState="PENDING"
              url={requestedReviewer.url}
              hovercardUrl={
                requestedReviewer.organization.name
                  ? teamHovercardPath({
                      owner: requestedReviewer.organization.name,
                      team: requestedReviewer.name,
                    })
                  : ''
              }
              trailingContent={
                viewerCanRequestReviews && (
                  <CancelReviewRequestButton
                    requestedReviewer={requestedReviewer.name}
                    onDeleteReviewer={handleDeleteReviewer}
                  />
                )
              }
            />
          )
        } else if (requestedReviewer.__typename === 'User') {
          const requestedReviewerWhoDelegatedRequest = node.assignedFromReviewRequest?.requestedReviewer
          let requestedReviewerTeamName = ''
          if (requestedReviewerWhoDelegatedRequest?.__typename === 'Team') {
            requestedReviewerTeamName = requestedReviewerWhoDelegatedRequest.name || ''
          }
          let codeOwnerText
          if (node.asCodeOwner) {
            codeOwnerText = `${requestedReviewer.login} is a codeowner`
          } else if (node.assignedFromReviewRequest?.asCodeOwner) {
            if (requestedReviewerWhoDelegatedRequest?.__typename === 'Team') {
              codeOwnerText = `${requestedReviewer.login} is a codeowner assigned automatically on behalf of ${requestedReviewerTeamName}`
            }
          }
          const handleDeleteReviewer = () => {
            // remove the reviewer from the list of requested reviewers
            const updatedUserIds = [...requestedUserIds]
            updatedUserIds.splice(updatedUserIds.indexOf(requestedReviewer.id), 1)
            updateRequestedReviewers(
              requestedTeamIds,
              updatedUserIds,
              `Failed to remove reviewer ${requestedReviewer.login}`,
            )
          }

          return (
            <Reviewer
              key={requestedReviewer.login}
              assignedFromTeam={requestedReviewerTeamName}
              avatarUrl={requestedReviewer.avatarUrl}
              codeownerTooltip={codeOwnerText}
              displayName={requestedReviewer.login}
              hovercardUrl={userHovercardPath({owner: requestedReviewer.login || ''})}
              reviewState="PENDING"
              url={requestedReviewer.url}
              trailingContent={
                viewerCanRequestReviews && (
                  <CancelReviewRequestButton
                    requestedReviewer={requestedReviewer.login}
                    onDeleteReviewer={handleDeleteReviewer}
                  />
                )
              }
            />
          )
        }
      })}
    </>
  )
}
