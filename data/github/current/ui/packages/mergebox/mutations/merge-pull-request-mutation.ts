import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {MergeMethod} from '../types'

export default function mergePullRequest({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {
    pullRequestId: string
    mergeMethod: MergeMethod
    authorEmail?: string
    commitHeadline: string
    commitBody: string
  }
  onCompleted?: () => void
  onError?: (error: Error) => void
}) {
  return commitMutation(environment, {
    mutation: graphql`
      mutation mergePullRequestMutation($input: MergePullRequestInput!) {
        mergePullRequest(input: $input) {
          pullRequest {
            id
            state
            headRefName
            headRepository {
              owner {
                login
              }
              name
            }
            viewerCanDeleteHeadRef
            viewerCanRestoreHeadRef
          }
        }
      }
    `,
    variables: {input},
    onCompleted,
    onError,
  })
}
