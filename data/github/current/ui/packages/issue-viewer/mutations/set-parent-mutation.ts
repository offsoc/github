import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  AddSubIssueInput,
  setParentMutation,
  setParentMutation$data,
} from './__generated__/setParentMutation.graphql'

export function setParentMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: AddSubIssueInput
  onError?: (error: Error) => void
  onCompleted?: (response: setParentMutation$data) => void
}) {
  return commitMutation<setParentMutation>(environment, {
    mutation: graphql`
      mutation setParentMutation($input: AddSubIssueInput!) @raw_response_type {
        addSubIssue(input: $input) {
          subIssue {
            ...RelationshipsSectionFragment
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
