import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  CreateIssueTypeInput,
  createIssueTypeMutation,
  createIssueTypeMutation$data,
} from './__generated__/createIssueTypeMutation.graphql'

type CreateIssueTypeMutationParams = {
  environment: Environment
  input: CreateIssueTypeInput
  onError?: (error: Error) => void
  onCompleted?: (response: createIssueTypeMutation$data) => void
}

export function commitCreateIssueTypeMutation({
  environment,
  input,
  onError,
  onCompleted,
}: CreateIssueTypeMutationParams) {
  return commitMutation<createIssueTypeMutation>(environment, {
    mutation: graphql`
      mutation createIssueTypeMutation($input: CreateIssueTypeInput!) @raw_response_type {
        createIssueType(input: $input) {
          issueType {
            id
            name
            description
            color
            isEnabled
            isPrivate
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
