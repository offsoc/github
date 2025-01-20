import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  UpdateIssueIssueTypeInput,
  updateIssueIssueTypeMutation,
  updateIssueIssueTypeMutation$data,
} from './__generated__/updateIssueIssueTypeMutation.graphql'

export function commitUpdateIssueIssueTypeMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: UpdateIssueIssueTypeInput
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueIssueTypeMutation$data) => void
}) {
  return commitMutation<updateIssueIssueTypeMutation>(environment, {
    mutation: graphql`
      mutation updateIssueIssueTypeMutation($input: UpdateIssueIssueTypeInput!) @raw_response_type {
        updateIssueIssueType(input: $input) {
          issue {
            issueType {
              id
            }
          }
        }
      }
    `,
    variables: {
      input,
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
