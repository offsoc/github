import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  updateIssueSubscriptionMutation,
  UpdateSubscriptionInput,
} from './__generated__/updateIssueSubscriptionMutation.graphql'

export function commitUpdateIssueSubscriptionMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: UpdateSubscriptionInput
  onCompleted?: () => void
  onError?: (error: Error) => void
}) {
  return commitMutation<updateIssueSubscriptionMutation>(environment, {
    mutation: graphql`
      mutation updateIssueSubscriptionMutation($input: UpdateSubscriptionInput!) @raw_response_type {
        updateSubscription(input: $input) {
          subscribable {
            ... on Issue {
              id
              viewerThreadSubscriptionFormAction
            }
          }
        }
      }
    `,
    variables: {
      input,
    },
    onCompleted: () => onCompleted && onCompleted(),
    onError: error => onError && onError(error),
  })
}
