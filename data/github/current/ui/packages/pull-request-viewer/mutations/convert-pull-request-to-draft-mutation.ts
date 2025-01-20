import {commitMutation, type Environment, graphql} from 'react-relay'

import type {
  ConvertPullRequestToDraftInput,
  convertPullRequestToDraftMutation as convertPullRequestToDraftMutationType,
  convertPullRequestToDraftMutation$data,
} from './__generated__/convertPullRequestToDraftMutation.graphql'

export default function convertPullRequestToDraftMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: ConvertPullRequestToDraftInput
  onCompleted?: (response: convertPullRequestToDraftMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<convertPullRequestToDraftMutationType>(environment, {
    mutation: graphql`
      mutation convertPullRequestToDraftMutation($input: ConvertPullRequestToDraftInput!) @raw_response_type {
        convertPullRequestToDraft(input: $input) {
          pullRequest {
            id
            isDraft
          }
        }
      }
    `,
    variables: {input},
    optimisticResponse: {
      convertPullRequestToDraft: {
        pullRequest: {
          id: input.pullRequestId,
          isDraft: true,
        },
      },
    },
    onCompleted,
    onError,
  })
}
