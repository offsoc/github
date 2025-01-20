import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {UpdatePullRequestInput, updatePullRequestMutation} from './__generated__/updatePullRequestMutation.graphql'

export function updatePullRequestMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: UpdatePullRequestInput
  onCompleted?: () => void
  onError?: (error: Error) => void
}) {
  return commitMutation<updatePullRequestMutation>(environment, {
    mutation: graphql`
      mutation updatePullRequestMutation($input: UpdatePullRequestInput!) @raw_response_type {
        updatePullRequest(input: $input) {
          pullRequest {
            ...Description_pullRequest
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
