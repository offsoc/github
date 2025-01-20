import {type Environment, commitMutation, graphql} from 'react-relay'
import type {
  UpdateIssueTypeInput,
  updateIssueTypeMutation,
  updateIssueTypeMutation$data,
} from './__generated__/updateIssueTypeMutation.graphql'

type UpdateIssueTypeMutationParams = {
  environment: Environment
  input: UpdateIssueTypeInput
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueTypeMutation$data) => void
}

export function commitUpdateIssueTypeMutation({
  environment,
  input,
  onError,
  onCompleted,
}: UpdateIssueTypeMutationParams) {
  return commitMutation<updateIssueTypeMutation>(environment, {
    mutation: graphql`
      mutation updateIssueTypeMutation($input: UpdateIssueTypeInput!) @raw_response_type {
        updateIssueType(input: $input) {
          issueType {
            ...OrganizationIssueTypesSettingsEditInternalIssueType
          }
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
