import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {prioritizePinnedIssuesMutation} from './__generated__/prioritizePinnedIssuesMutation.graphql'

export function commitPrioritizePinnedIssuesMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {repositoryId: string; issueIds: string[]}
  onCompleted?: () => void
  onError?: (error: Error) => void
}) {
  return commitMutation<prioritizePinnedIssuesMutation>(environment, {
    mutation: graphql`
      mutation prioritizePinnedIssuesMutation($input: PrioritizePinnedIssuesInput!) @raw_response_type {
        prioritizePinnedIssues(input: $input) {
          repository {
            pinnedIssues(first: 3) {
              nodes {
                issue {
                  id
                  title
                  ...PinnedIssueIssue
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      input,
    },
    onCompleted: () => onCompleted?.(),
    onError: error => onError?.(error),
  })
}
