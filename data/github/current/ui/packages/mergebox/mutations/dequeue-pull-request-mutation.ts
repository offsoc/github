import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {MergeMethod} from '../types'
import type {dequeuePullRequestMutation} from './__generated__/dequeuePullRequestMutation.graphql'

export default function removePullRequestFromMergeQueue({
  environment,
  input,
  onCompleted,
  onError,
  mergeMethod,
}: {
  environment: Environment
  input: {id: string}
  onCompleted?: () => void
  onError?: (error: Error) => void
  mergeMethod: MergeMethod
}) {
  return commitMutation<dequeuePullRequestMutation>(environment, {
    mutation: graphql`
      mutation dequeuePullRequestMutation($input: DequeuePullRequestInput!, $mergeMethod: PullRequestMergeMethod) {
        dequeuePullRequest(input: $input) {
          mergeQueueEntry {
            pullRequest {
              ...useLoadMergeBoxQuery_pullRequest
              ...HeaderMetadata_pullRequest
            }
          }
        }
      }
    `,
    variables: {input, mergeMethod},
    onCompleted,
    onError,
  })
}
