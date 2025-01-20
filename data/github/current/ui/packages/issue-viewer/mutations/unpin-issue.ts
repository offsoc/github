import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {unpinIssueMutation} from './__generated__/unpinIssueMutation.graphql'

export function commitUnpinIssueMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {issueId: string}
  onCompleted?: () => void
  onError?: (error: Error) => void
}) {
  return commitMutation<unpinIssueMutation>(environment, {
    mutation: graphql`
      mutation unpinIssueMutation($input: UnpinIssueInput!) @raw_response_type {
        unpinIssue(input: $input) {
          id @deleteRecord
          issue {
            isPinned
            repository {
              pinnedIssues(first: 3) {
                totalCount
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
