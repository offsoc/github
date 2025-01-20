import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {updateUnresolvedCommentCount} from '../helpers/mutation-helpers'
import type {
  resolvePullRequestThreadMutation as resolvePullRequestThreadMutationType,
  resolvePullRequestThreadMutation$data,
} from './__generated__/resolvePullRequestThreadMutation.graphql'

export default function resolvePullRequestThreadMutation({
  environment,
  input: {threadId},
  onCompleted,
  onError,
  pullRequestId,
}: {
  environment: Environment
  input: {threadId: string}
  onCompleted?: (response: resolvePullRequestThreadMutation$data) => void
  onError?: (error: Error) => void
  pullRequestId: string
}) {
  return commitMutation<resolvePullRequestThreadMutationType>(environment, {
    mutation: graphql`
      mutation resolvePullRequestThreadMutation($id: ID!) @raw_response_type {
        resolvePullRequestThread(input: {threadId: $id}) {
          thread {
            resolvedByActor {
              login
            }
            id
            isResolved
            viewerCanResolve
            viewerCanUnresolve
            path
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
      const mutationResult = store.getRootField('resolvePullRequestThread')
      const thread = mutationResult.getLinkedRecord('thread')
      const path = thread.getValue('path')
      const commentCount = thread.getLinkedRecord('comments').getValue('totalCount')

      updateUnresolvedCommentCount(store, pullRequestId, path, -commentCount)
    },
  })
}
