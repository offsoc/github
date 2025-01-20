import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  RemoveSubIssueInput,
  removeSubIssueMutation,
  removeSubIssueMutation$data,
} from './__generated__/removeSubIssueMutation.graphql'

export function commitRemoveSubIssueMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: RemoveSubIssueInput
  onError?: (error: Error) => void
  onCompleted?: (response: removeSubIssueMutation$data) => void
}) {
  return commitMutation<removeSubIssueMutation>(environment, {
    mutation: graphql`
      mutation removeSubIssueMutation($input: RemoveSubIssueInput!) @raw_response_type {
        removeSubIssue(input: $input) {
          issue {
            ... on Issue {
              ...SubIssuesListItem
              subIssues(first: 50) {
                nodes {
                  id
                }
              }
            }
          }
          subIssue {
            id
            parent {
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
