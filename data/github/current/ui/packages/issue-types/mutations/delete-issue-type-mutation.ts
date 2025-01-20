import {type Environment, commitMutation, graphql} from 'react-relay'
import type {
  DeleteIssueTypeInput,
  deleteIssueTypeMutation,
  deleteIssueTypeMutation$data,
} from './__generated__/deleteIssueTypeMutation.graphql'

type deleteIssueTypeMutationParams = {
  environment: Environment
  input: DeleteIssueTypeInput
  onError?: (error: Error) => void
  onCompleted?: (response: deleteIssueTypeMutation$data) => void
}

export function commitDeleteIssueTypeMutation({
  environment,
  input,
  onError,
  onCompleted,
}: deleteIssueTypeMutationParams) {
  return commitMutation<deleteIssueTypeMutation>(environment, {
    mutation: graphql`
      mutation deleteIssueTypeMutation($input: DeleteIssueTypeInput!) @raw_response_type {
        deleteIssueType(input: $input) {
          deletedIssueTypeId
          errors {
            message
          }
        }
      }
    `,
    variables: {input},
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
