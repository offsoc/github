import {teamHovercardPath, userHovercardPath} from '@github-ui/paths'
import {MoonIcon} from '@primer/octicons-react'
import {Box, Octicon, Tooltip} from '@primer/react'
import {graphql, useFragment, useLazyLoadQuery} from 'react-relay'

import type {CodeownersToBeAssigned_pullRequest$key} from './__generated__/CodeownersToBeAssigned_pullRequest.graphql'
import type {CodeownersToBeAssignedQuery} from './__generated__/CodeownersToBeAssignedQuery.graphql'
import Reviewer from './Reviewer'

/**
 * Displays the review requests that will be made to codeowners of files changed in the pull request
 * after the pull request is changed from draft to ready for review.
 */
export default function CodeownersToBeAssigned({
  pullRequestId,
  requestedReviewerIds,
  reviewerLogins,
}: {
  pullRequestId: string
  requestedReviewerIds: string[]
  reviewerLogins: string[]
}) {
  const pullRequestData = useLazyLoadQuery<CodeownersToBeAssignedQuery>(
    graphql`
      query CodeownersToBeAssignedQuery($pullRequestId: ID!) {
        pullRequest: node(id: $pullRequestId) {
          ... on PullRequest {
            ...CodeownersToBeAssigned_pullRequest
          }
        }
      }
    `,
    {
      pullRequestId,
    },
  )

  if (!pullRequestData.pullRequest) return null

  return (
    <CodeownersToBeAssignedInner
      pullRequest={pullRequestData.pullRequest}
      requestedReviewerIds={requestedReviewerIds}
      reviewerLogins={reviewerLogins}
    />
  )
}

function CodeownersToBeAssignedInner({
  pullRequest,
  requestedReviewerIds,
  reviewerLogins,
}: {
  pullRequest: CodeownersToBeAssigned_pullRequest$key
  requestedReviewerIds: string[]
  reviewerLogins: string[]
}) {
  const pullRequestData = useFragment(
    graphql`
      fragment CodeownersToBeAssigned_pullRequest on PullRequest {
        codeowners {
          ... on User {
            avatarUrl
            id
            login
            url
            __typename
          }
          ... on Team {
            teamAvatarUrl: avatarUrl
            combinedSlug
            id
            name
            url
            organization {
              name
            }
            __typename
          }
        }
      }
    `,
    pullRequest,
  )

  const toBeAutoAssignedIcon = (
    <Tooltip aria-label="To be requested once ready for review" direction="nw">
      <Box sx={{p: '6px', display: 'flex'}}>
        <Octicon icon={MoonIcon} sx={{color: 'fg.muted'}} />
      </Box>
    </Tooltip>
  )

  return (
    <>
      {pullRequestData.codeowners?.map(codeowner => {
        if (codeowner.__typename === 'Team') {
          if (requestedReviewerIds.includes(codeowner.id)) return

          return (
            <Reviewer
              key={codeowner.name}
              avatarUrl={codeowner.teamAvatarUrl || ''}
              codeownerTooltip={`${codeowner.combinedSlug} is a codeowner`}
              displayName={codeowner.name}
              reviewState="PENDING"
              trailingContent={toBeAutoAssignedIcon}
              url={codeowner.url}
              hovercardUrl={
                codeowner.organization.name
                  ? teamHovercardPath({
                      owner: codeowner.organization.name,
                      team: codeowner.name,
                    })
                  : ''
              }
            />
          )
        } else if (codeowner.__typename === 'User') {
          if (requestedReviewerIds.includes(codeowner.id) || reviewerLogins.includes(codeowner.login)) return

          return (
            <Reviewer
              key={codeowner.login}
              avatarUrl={codeowner.avatarUrl}
              codeownerTooltip={`${codeowner.login} is a codeowner`}
              displayName={codeowner.login}
              hovercardUrl={userHovercardPath({owner: codeowner.login || ''})}
              reviewState="PENDING"
              trailingContent={toBeAutoAssignedIcon}
              url={codeowner.url}
            />
          )
        }
      })}
    </>
  )
}
