import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {decrementConnectionCount, updateTotalCommentsCount} from '../helpers/mutation-helpers'
import type {
  deletePullRequestCommentMutation as deletePullRequestCommentMutationType,
  deletePullRequestCommentMutation$data,
  DeletePullRequestReviewCommentInput,
} from './__generated__/deletePullRequestCommentMutation.graphql'

export default function deletePullRequestReviewCommentMutation({
  environment,
  filePath,
  connectionId,
  input,
  onCompleted,
  onError,
  threadCommentCount,
  threadId,
  threadsConnectionId,
  pullRequestId,
}: {
  environment: Environment
  filePath: string
  connectionId?: string
  input: DeletePullRequestReviewCommentInput
  onCompleted?: (response: deletePullRequestCommentMutation$data) => void
  onError?: (error: Error) => void
  threadCommentCount?: number
  threadId: string
  threadsConnectionId?: string
  pullRequestId: string
}) {
  return commitMutation<deletePullRequestCommentMutationType>(environment, {
    mutation: graphql`
      mutation deletePullRequestCommentMutation(
        $connections: [ID!]!
        $input: DeletePullRequestReviewCommentInput!
        $filePath: String
        $singleCommitOid: String
        $startOid: String
        $endOid: String
      ) @raw_response_type {
        deletePullRequestReviewComment(input: $input) {
          pullRequestReviewComment {
            id @deleteEdge(connections: $connections)
            pullRequest {
              ...ReviewMenu_pullRequest
              # annotate with @connection to keep the connection name the same and update the file-level comment total count
              threads(first: 50, isPositioned: false, subjectType: FILE, path: $filePath)
                @connection(key: "SingleFileViewConversation_threads") {
                totalCommentsCount
                edges {
                  __typename
                }
              }
            }
            pullRequestReview {
              pullRequestThreadsAndReplies(first: 100)
                @connection(key: "PullRequestReview_pullRequestThreadsAndReplies") {
                totalCount
                edges {
                  __typename
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      connections: connectionId ? [connectionId] : [],
      input,
      filePath,
    },
    onCompleted,
    onError,
    updater(store) {
      decrementConnectionCount(store, threadsConnectionId, 'totalCommentsCount')
      updateTotalCommentsCount(store, pullRequestId, filePath, 'decrement')

      // delete the comment from the store
      const mutationResult = store.getRootField('deletePullRequestReviewComment')
      const deletedComment = mutationResult.getLinkedRecord('pullRequestReviewComment')
      const deletedCommentId = deletedComment.getValue('id')
      store.delete(deletedCommentId)

      // Check if there are additional thread comments
      // If this is the last one, delete the associated PullRequestThread as it now an orphaned thread.
      if (threadCommentCount && threadCommentCount <= 1) store.delete(threadId)
    },
  })
}
