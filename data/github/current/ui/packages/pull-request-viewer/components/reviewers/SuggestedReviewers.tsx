import {userHovercardPath} from '@github-ui/paths'
import {Button, Text} from '@primer/react'
import {graphql, useFragment, useLazyLoadQuery} from 'react-relay'

import type {SuggestedReviewers_pullRequest$key} from './__generated__/SuggestedReviewers_pullRequest.graphql'
import type {SuggestedReviewersQuery} from './__generated__/SuggestedReviewersQuery.graphql'
import Reviewer from './Reviewer'

/**
 * Displays the suggested reviewers for a pull request
 */
export default function SuggestedReviewers({
  pullRequestId,
  ...rest
}: {
  isRequestingReviews: boolean
  onRequestReview: (reviewerId: string) => void
  pullRequestId: string
}) {
  const pullRequestData = useLazyLoadQuery<SuggestedReviewersQuery>(
    graphql`
      query SuggestedReviewersQuery($pullRequestId: ID!) {
        pullRequest: node(id: $pullRequestId) {
          ... on PullRequest {
            ...SuggestedReviewers_pullRequest
          }
        }
      }
    `,
    {
      pullRequestId,
    },
  )
  if (!pullRequestData.pullRequest) return null

  return <SuggestedReviewersInner pullRequest={pullRequestData.pullRequest} {...rest} />
}

export function SuggestedReviewersInner({
  isRequestingReviews,
  onRequestReview,
  pullRequest,
}: {
  isRequestingReviews: boolean
  onRequestReview: (reviewerId: string) => void
  pullRequest: SuggestedReviewers_pullRequest$key
}) {
  const pullRequestData = useFragment(
    graphql`
      fragment SuggestedReviewers_pullRequest on PullRequest {
        id
        state
        suggestedReviewers {
          reviewer {
            id
            avatarUrl
            login
            url
          }
        }
        viewerCanUpdate
      }
    `,
    pullRequest,
  )

  const state = pullRequestData.state
  if (state === 'CLOSED' || state === 'MERGED') {
    return null
  }
  const suggestedReviewers = pullRequestData.suggestedReviewers

  // show empty state when there are no suggestions
  if (suggestedReviewers.length < 1) {
    return (
      <li>
        <Text sx={{px: 2, color: 'fg.muted', fontSize: 0}}>None</Text>
      </li>
    )
  }

  return (
    <>
      {suggestedReviewers.map(suggestedReviewer => {
        const reviewer = suggestedReviewer?.reviewer
        if (!reviewer) return null

        return (
          <Reviewer
            key={reviewer.login}
            afterAvatarContent={<Text sx={{color: 'fg.muted', fontWeight: 400, fontSize: 0}}>Suggested</Text>}
            avatarUrl={reviewer.avatarUrl || ''}
            displayName={reviewer.login}
            hovercardUrl={userHovercardPath({owner: reviewer.login || ''})}
            reviewState="SUGGESTED"
            url={reviewer.url}
            trailingContent={
              pullRequestData.viewerCanUpdate ? (
                <Button
                  disabled={isRequestingReviews}
                  size="small"
                  variant="invisible"
                  onClick={() => onRequestReview(reviewer.id)}
                >
                  Request
                </Button>
              ) : null
            }
          />
        )
      })}
    </>
  )
}
