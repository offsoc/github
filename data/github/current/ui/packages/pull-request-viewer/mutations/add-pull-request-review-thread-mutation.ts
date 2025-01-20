import {commitMutation, ConnectionHandler, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {activityViewForwardPaginationConnectionId} from '../components/activity/ActivityView'
import {commentsSidesheetConnectionId} from '../components/diffs/CommentsSidesheet'
import {threadNavigationConnectionId} from '../components/PullRequestMarkers'
import {
  incrementConnectionCount,
  updateTotalCommentsCount,
  updateUnresolvedCommentCount,
} from '../helpers/mutation-helpers'
import type {
  AddPullRequestReviewThreadInput,
  addPullRequestReviewThreadMutation as addPullRequestReviewThreadMutationType,
  addPullRequestReviewThreadMutation$data,
} from './__generated__/addPullRequestReviewThreadMutation.graphql'

export default function addPullRequestReviewThreadMutation({
  environment,
  threadsConnectionId,
  input,
  onCompleted,
  onError,
  pullRequestId,
  filePath,
}: {
  environment: Environment
  threadsConnectionId?: string
  input: AddPullRequestReviewThreadInput
  onCompleted?: (response: addPullRequestReviewThreadMutation$data) => void
  onError?: (error: Error) => void
  pullRequestId: string
  filePath?: string
}) {
  const connections = threadsConnectionId ? [threadsConnectionId] : []

  return commitMutation<addPullRequestReviewThreadMutationType>(environment, {
    mutation: graphql`
      mutation addPullRequestReviewThreadMutation(
        $connections: [ID!]!
        $input: AddPullRequestReviewThreadInput!
        $filePath: String
      ) @raw_response_type {
        addPullRequestReviewThread(input: $input) {
          pullRequestThread @appendNode(connections: $connections, edgeTypeName: "PullRequestReviewThreadEdge") {
            __id
            id
            diffSide
            isOutdated
            line
            startDiffSide
            startLine
            viewerCanReply
            ...ThreadPreview_pullRequestThread
            ...PullRequestMarkers_pullRequestThread
            comments(first: 50) @connection(key: "ReviewThread_comments") {
              __id
              edges {
                node {
                  ...useFetchThread_PullRequestReviewComment
                }
              }
            }
            comments(first: 50) {
              edges {
                node {
                  id
                }
              }
              totalCount
            }
            pullRequest {
              # annotate with @connection to keep the connection name the same and update the total count
              threads(first: 50, isPositioned: false, subjectType: FILE, path: $filePath)
                @connection(key: "SingleFileViewConversation_threads") {
                totalCommentsCount
                edges {
                  __typename
                }
              }
              ...OpenCommentsPanelButton_pullRequest
              viewerPendingReview {
                id
                ...PullRequestReview_pullRequestReview
                comments {
                  totalCount
                }
              }
            }
            id
          }
          errors {
            shortMessage
          }
        }
      }
    `,
    variables: {input, connections, filePath},
    onCompleted,
    onError,
    updater(store) {
      incrementConnectionCount(store, threadsConnectionId, 'totalCommentsCount')
      incrementConnectionCount(store, threadsConnectionId, 'totalCount')

      const path = filePath ?? input.path
      updateUnresolvedCommentCount(store, pullRequestId, path, 'increment')
      updateTotalCommentsCount(store, pullRequestId, path, 'increment')

      // Update timeline items for the ActivityView
      const newReview = store.getRootField('addPullRequestReviewThread').getLinkedRecord('pullRequestThread')
      const activityViewconnectionId = activityViewForwardPaginationConnectionId(pullRequestId)

      const activityViewConnectionRecord = store.get(activityViewconnectionId)

      if (activityViewConnectionRecord && newReview) {
        const newEdge = ConnectionHandler.createEdge(
          store,
          activityViewConnectionRecord,
          newReview,
          'PullRequestTimelineItemEdge',
        )
        ConnectionHandler.insertEdgeAfter(activityViewConnectionRecord, newEdge)
      }

      // Update the threads used for thread navigation and sidesheet
      const newThread = store.getRootField('addPullRequestReviewThread').getLinkedRecord('pullRequestThread')
      const connectionIds = [commentsSidesheetConnectionId(pullRequestId), threadNavigationConnectionId(pullRequestId)]
      for (const connectionId of connectionIds) {
        const connectionRecord = store.get(connectionId)
        if (connectionRecord) {
          const newEdge = ConnectionHandler.createEdge(
            store,
            connectionRecord,
            newThread,
            'PullRequestReviewThreadEdge',
          )
          ConnectionHandler.insertEdgeAfter(connectionRecord, newEdge)
        }
      }

      // need to update the user's pending review data if this wasn't a single comment submission
      if (input.submitReview) return
      const mutationResult = store.getRootField('addPullRequestReviewThread')
      const review = mutationResult
        .getLinkedRecord('pullRequestThread')
        .getLinkedRecord('pullRequest')
        .getLinkedRecord('viewerPendingReview')

      const rootPullRequest = store.get(pullRequestId)
      rootPullRequest?.setLinkedRecord(review, 'viewerPendingReview')
    },
  })
}
