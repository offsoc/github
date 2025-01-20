import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {MergeMethod} from '../types'
import type {
  PullRequestBranchUpdateMethod,
  updatePullRequestBranchMutation as updatePullRequestBranchType,
  updatePullRequestBranchMutation$data,
} from './__generated__/updatePullRequestBranchMutation.graphql'

interface UpdatePullRequestBranchInput {
  pullRequestId: string
  updateMethod: PullRequestBranchUpdateMethod | null | undefined
}

export default function updatePullRequestBranch({
  environment,
  input,
  onCompleted,
  onError,
  mergeMethod,
}: {
  environment: Environment
  input: UpdatePullRequestBranchInput
  onCompleted?: (response: updatePullRequestBranchMutation$data) => void
  onError?: (error: Error) => void
  mergeMethod: MergeMethod
}) {
  return commitMutation<updatePullRequestBranchType>(environment, {
    mutation: graphql`
      mutation updatePullRequestBranchMutation(
        $input: UpdatePullRequestBranchInput!
        $mergeMethod: PullRequestMergeMethod
      ) {
        updatePullRequestBranch(input: $input) {
          pullRequest {
            ...useLoadMergeBoxQuery_pullRequest
          }
        }
      }
    `,
    variables: {input, mergeMethod},
    onCompleted,
    onError,
  })
}
