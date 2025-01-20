import {graphql, useLazyLoadQuery} from 'react-relay'
import type {
  useLoadTreeComparisonQuery,
  useLoadTreeComparisonQuery$data,
} from './__generated__/useLoadTreeComparisonQuery.graphql'
import type {TreeComparisonReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'

const pullRequestQuery = graphql`
  query useLoadTreeComparisonQuery($pullRequestId: ID!) {
    node(id: $pullRequestId) {
      ... on PullRequest {
        additions
        deletions
        author {
          login
        }
        baseRefOid
        baseRepository {
          databaseId
        }
        closed
        headRefOid
        headRepository {
          databaseId
        }
        isDraft
      }
    }
    viewer {
      login
      isCopilotDotcomChatEnabled
    }
  }
`

export function useLoadTreeComparison(pullRequestId: string) {
  const apiData = useLazyLoadQuery<useLoadTreeComparisonQuery>(
    pullRequestQuery,
    {pullRequestId},
    {fetchPolicy: 'store-or-network'},
  )
  const {node: pullRequest, viewer} = apiData
  if (!shouldRenderBannerForPullRequest(pullRequest, viewer)) return null

  const baseRepoId = pullRequest?.baseRepository?.databaseId
  if (typeof baseRepoId !== 'number') return null

  const headRepoId = pullRequest?.headRepository?.databaseId
  if (typeof headRepoId !== 'number') return null

  return {
    baseRepoId,
    baseRevision: pullRequest?.baseRefOid,
    headRepoId,
    headRevision: pullRequest?.headRefOid,
    diffHunks: [],
  } satisfies Omit<TreeComparisonReference, 'type'>
}

// Keep this function in sync with logic in the Rails view component
// PullRequests::Copilot::PullRequestReviewBannerComponent#render?. Logic here in `shouldRenderBannerForPullRequest`
// affects when the pre-review banner is shown on React'ified pull request pages behind the `prx` feature flag.
// Logic in the Rails view component affects when the pre-review banner is shown on non-React'ified PR pages.
function shouldRenderBannerForPullRequest(
  pullRequest: useLoadTreeComparisonQuery$data['node'],
  viewer: useLoadTreeComparisonQuery$data['viewer'],
) {
  return (
    isOpenDraftPullRequest(pullRequest) &&
    isViewerThePullRequestAuthor(pullRequest, viewer) &&
    doesPullRequestHaveAnyChanges(pullRequest) &&
    viewer?.isCopilotDotcomChatEnabled
  )
}

// Only want to show the pre-review banner on open, draft pull requests
function isOpenDraftPullRequest(pullRequest: useLoadTreeComparisonQuery$data['node']) {
  return pullRequest && !pullRequest.closed && pullRequest.isDraft
}

// Only want to show the Copilot pre-review banner to the author of the pull request
function isViewerThePullRequestAuthor(
  pullRequest: useLoadTreeComparisonQuery$data['node'],
  viewer: useLoadTreeComparisonQuery$data['viewer'],
) {
  return viewer && pullRequest && pullRequest.author && viewer.login === pullRequest.author.login
}

// Copilot won't be able to make any suggestions about an empty diff, so don't show the banner for one
function doesPullRequestHaveAnyChanges(pullRequest: useLoadTreeComparisonQuery$data['node']) {
  const linesChanged = (pullRequest?.additions ?? 0) + (pullRequest?.deletions ?? 0)
  return linesChanged > 0
}
