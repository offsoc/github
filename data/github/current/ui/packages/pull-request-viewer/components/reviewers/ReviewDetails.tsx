import {userHovercardPath} from '@github-ui/paths'
import {graphql, useFragment} from 'react-relay'

import type {ReviewDetails_pullRequest$key} from './__generated__/ReviewDetails_pullRequest.graphql'
import {sortByState} from './review-helpers'
import Reviewer from './Reviewer'

/**
 * Displays the details, state, codeowner status of a review left on a pull request
 */
export default function ReviewDetails({pullRequest}: {pullRequest: ReviewDetails_pullRequest$key}) {
  const reviewRequestData = useFragment(
    graphql`
      fragment ReviewDetails_pullRequest on PullRequest
      @argumentDefinitions(latestReviewsCount: {type: "Int", defaultValue: 100}) {
        latestReviews(first: $latestReviewsCount, preferOpinionatedReviews: true) {
          edges {
            node {
              onBehalfOfReviewers {
                asCodeowner
                reviewer {
                  ... on Team {
                    __typename
                    combinedSlug
                  }
                  ... on User {
                    __typename
                    login
                  }
                }
              }
              author {
                avatarUrl
                login
                url
              }
              state
            }
          }
        }
      }
    `,
    pullRequest,
  )

  const reviews = reviewRequestData.latestReviews?.edges?.map(edge => edge?.node).sort(sortByState)

  return (
    <>
      {reviews?.map(review => {
        const reviewAuthor = review?.author
        if (!reviewAuthor) return null

        let codeownerTooltip: string | undefined = undefined
        const onBehalfOfTeams: string[] = []
        const onBehalfOfCodeownerTeams: string[] = []
        if (review.onBehalfOfReviewers.length > 0) {
          for (const onBehalfOf of review.onBehalfOfReviewers) {
            if (!onBehalfOf.reviewer) continue

            let name = ''
            let isTeam = false
            switch (onBehalfOf.reviewer.__typename) {
              case 'User':
                name = onBehalfOf.reviewer.login
                break
              case 'Team':
                name = onBehalfOf.reviewer.combinedSlug
                isTeam = true
            }

            if (!name) continue

            if (onBehalfOf.asCodeowner) {
              // once the tooltip is set, the user themself is a codeowner and we can ignore codeowner teams
              if (codeownerTooltip) continue
              if (isTeam) {
                onBehalfOfCodeownerTeams.push(name)
              } else {
                codeownerTooltip = `${name} is a codeowner`
              }
            } else if (isTeam) {
              onBehalfOfTeams.push(name)
            }
          }
        }

        const reviewTeamNames = onBehalfOfTeams.join(', ')
        if (!codeownerTooltip && onBehalfOfCodeownerTeams.length > 0) {
          const codeownerTeams = onBehalfOfCodeownerTeams.join(', ')
          codeownerTooltip = `${reviewAuthor.login} left a review as a codeowner on behalf of ${codeownerTeams}`
        }

        return (
          <Reviewer
            key={reviewAuthor.login}
            avatarUrl={reviewAuthor.avatarUrl}
            codeownerTooltip={codeownerTooltip}
            displayName={reviewAuthor.login}
            hovercardUrl={userHovercardPath({owner: reviewAuthor.login || ''})}
            reviewState={review.state}
            url={reviewAuthor.url}
            onBehalfOfTeam={reviewTeamNames}
          />
        )
      })}
    </>
  )
}
