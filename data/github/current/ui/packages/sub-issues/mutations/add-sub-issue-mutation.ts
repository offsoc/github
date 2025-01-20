import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  AddSubIssueInput,
  addSubIssueMutation,
  addSubIssueMutation$data,
} from './__generated__/addSubIssueMutation.graphql'

export function addSubIssueMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: AddSubIssueInput
  onError?: (error: Error) => void
  onCompleted?: (response: addSubIssueMutation$data) => void
}) {
  return commitMutation<addSubIssueMutation>(environment, {
    mutation: graphql`
      mutation addSubIssueMutation($input: AddSubIssueInput!) @raw_response_type {
        addSubIssue(input: $input) {
          issue {
            id
            ...SubIssuesListView
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
