import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {updateUnresolvedCommentCount} from '../helpers/mutation-helpers'
import type {
  unresolvePullRequestThreadMutation as unresolvePullRequestThreadMutationType,
  unresolvePullRequestThreadMutation$data,
} from './__generated__/unresolvePullRequestThreadMutation.graphql'

export default function unresolvePullRequestThreadMutation({
  environment,
  input: {threadId},
  onCompleted,
  onError,
  pullRequestId,
}: {
  environment: Environment
  input: {threadId: string}
  onCompleted?: (response: unresolvePullRequestThreadMutation$data) => void
  onError?: (error: Error) => void
  pullRequestId: string
}) {
  return commitMutation<unresolvePullRequestThreadMutationType>(environment, {
    mutation: graphql`
      mutation unresolvePullRequestThreadMutation($id: ID!) @raw_response_type {
        unresolvePullRequestThread(input: {threadId: $id}) {
          thread {
            id
            isResolved
            path
            viewerCanResolve
            viewerCanUnresolve
            comments {
              totalCount
            }
          }
        }
      }
    `,
    variables: {id: threadId},
    onCompleted,
    onError,
    updater(store) {
      const mutationResult = store.getRootField('unresolvePullRequestThread')
      const thread = mutationResult.getLinkedRecord('thread')
      const path = thread.getValue('path')
      const commentCount = thread.getLinkedRecord('comments').getValue('totalCount')

      updateUnresolvedCommentCount(store, pullRequestId, path, commentCount)
    },
  })
}
