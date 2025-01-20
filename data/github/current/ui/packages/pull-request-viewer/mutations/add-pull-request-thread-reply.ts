import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {
  incrementConnectionCount,
  updateTotalCommentsCount,
  updateUnresolvedCommentCount,
} from '../helpers/mutation-helpers'
import type {
  AddPullRequestThreadReplyInput,
  addPullRequestThreadReplyMutation as addPullRequestThreadReplyMutationType,
  addPullRequestThreadReplyMutation$data,
} from './__generated__/addPullRequestThreadReplyMutation.graphql'

export default function addPullRequestThreadReplyMutation({
  environment,
  commentsConnectionIds,
  input,
  onCompleted,
  onError,
  pullRequestId,
  threadsConnectionId,
  filePath,
}: {
  environment: Environment
  commentsConnectionIds: string[]
  input: AddPullRequestThreadReplyInput
  onCompleted?: (response: addPullRequestThreadReplyMutation$data) => void
  onError: (error: Error) => void
  pullRequestId: string
  threadsConnectionId?: string
  filePath: string
}) {
  return commitMutation<addPullRequestThreadReplyMutationType>(environment, {
    mutation: graphql`
      mutation addPullRequestThreadReplyMutation(
        $connections: [ID!]!
        $input: AddPullRequestThreadReplyInput!
        $filePath: String
      ) @raw_response_type {
        addPullRequestThreadReply(input: $input) {
          comment @appendNode(connections: $connections, edgeTypeName: "PullRequestReviewCommentEdge") {
            ...useFetchThread_PullRequestReviewComment
            pullRequest {
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
              id
              comments {
                totalCount
              }
            }
          }
        }
      }
    `,
    variables: {input, connections: commentsConnectionIds, filePath},
    onCompleted,
    onError,
    updater(store) {
      incrementConnectionCount(store, threadsConnectionId, 'totalCommentsCount')
      for (const connectionId of commentsConnectionIds) {
        incrementConnectionCount(store, connectionId, 'totalCount')
      }

      updateTotalCommentsCount(store, pullRequestId, filePath, 'increment')
      updateUnresolvedCommentCount(store, pullRequestId, filePath, 'increment')

      // need to update the user's pending review data if this wasn't a single comment submission
      if (input.submitReview) return

      const mutationResult = store.getRootField('addPullRequestThreadReply')
      const review = mutationResult.getLinkedRecord('comment').getLinkedRecord('pullRequestReview')
      const rootPullRequest = store.get(pullRequestId)
      rootPullRequest?.setLinkedRecord(review, 'viewerPendingReview')
    },
  })
}
