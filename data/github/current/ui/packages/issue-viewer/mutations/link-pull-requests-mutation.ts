import type {PullRequestPickerPullRequest$data} from '@github-ui/item-picker/PullRequestPickerPullRequest.graphql'
import {commitMutation, type Environment, graphql} from 'react-relay'
import type {linkPullRequestsMutation} from './__generated__/linkPullRequestsMutation.graphql'

type LinkPullRequestsMutationParams = {
  environment: Environment
  input: {baseIssueOrPullRequestId: string; linkingIds: string[]}
  onError: (error: Error) => void
  linkingPrs: PullRequestPickerPullRequest$data[]
}

export function linkPullRequestsMutation({
  environment,
  input: {baseIssueOrPullRequestId, linkingIds},
  onError,
  linkingPrs,
}: LinkPullRequestsMutationParams) {
  const optimisticResponse = {
    linkIssueOrPullRequest: {
      baseIssueOrPullRequest: {
        __typename: 'Issue',
        id: baseIssueOrPullRequestId,
        __isNode: 'Issue',
        closedByPullRequestsReferences: {
          nodes: (linkingPrs || []).map(pr => {
            const {url, number, title, isDraft, isInMergeQueue, state, repository, id, createdAt} = pr
            const {id: repoId, name, nameWithOwner, owner} = repository
            const {login, __typename} = owner

            return {
              id,
              createdAt,
              isDraft,
              isInMergeQueue,
              number,
              url,
              title,
              state,
              __typename: 'PullRequest',
              repository: {
                id: repoId,
                name,
                nameWithOwner,
                owner: {
                  id,
                  login,
                  __typename,
                },
              },
            }
          }),
        },
      },
    },
  }

  return commitMutation<linkPullRequestsMutation>(environment, {
    mutation: graphql`
      mutation linkPullRequestsMutation($baseIssueOrPullRequestId: ID!, $linkingIds: [ID!]!) @raw_response_type {
        linkIssueOrPullRequest(input: {baseIssueOrPullRequestId: $baseIssueOrPullRequestId, linkingIds: $linkingIds}) {
          baseIssueOrPullRequest {
            ... on Issue {
              closedByPullRequestsReferences(first: 10, includeClosedPrs: true) {
                nodes {
                  ...PullRequestPickerPullRequest
                }
              }
            }
          }
        }
      }
    `,
    variables: {baseIssueOrPullRequestId, linkingIds},
    optimisticResponse,
    onError,
  })
}
