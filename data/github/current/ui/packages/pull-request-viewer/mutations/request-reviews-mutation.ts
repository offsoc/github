import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  RequestReviewsInput,
  requestReviewsMutation as requestReviewsMutationType,
  requestReviewsMutation$data,
} from './__generated__/requestReviewsMutation.graphql'

export default function requestReviewsMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: RequestReviewsInput
  onCompleted?: (response: requestReviewsMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<requestReviewsMutationType>(environment, {
    mutation: graphql`
      mutation requestReviewsMutation($input: RequestReviewsInput!) @raw_response_type {
        requestReviews(input: $input) {
          pullRequest {
            ...ReviewRequestDetails_pullRequest
          }
        }
      }
    `,
    variables: {input},
    onCompleted,
    onError,
  })
}
