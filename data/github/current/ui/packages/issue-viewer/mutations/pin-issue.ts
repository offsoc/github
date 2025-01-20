import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {pinIssueMutation} from './__generated__/pinIssueMutation.graphql'

export function commitPinIssueMutation({
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
  return commitMutation<pinIssueMutation>(environment, {
    mutation: graphql`
      mutation pinIssueMutation($input: PinIssueInput!) @raw_response_type {
        pinIssue(input: $input) {
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
