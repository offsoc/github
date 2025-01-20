import {commitMutation, ConnectionHandler, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {activityViewForwardPaginationConnectionId} from '../components/activity/ActivityView'
import type {
  SubmitPullRequestReviewInput,
  submitPullRequestReviewMutation as submitPullRequestReviewMutationType,
  submitPullRequestReviewMutation$data,
} from './__generated__/submitPullRequestReviewMutation.graphql'

export default function submitPullRequestReviewMutation({
  environment,
  input,
  onCompleted,
  onError,
  pullRequestId,
  pathsToInvalidate,
}: {
  environment: Environment
  input: SubmitPullRequestReviewInput
  onCompleted?: (response: submitPullRequestReviewMutation$data) => void
  onError?: (error: Error) => void
  pullRequestId: string
  pathsToInvalidate?: string[]
}) {
  return commitMutation<submitPullRequestReviewMutationType>(environment, {
    mutation: graphql`
      mutation submitPullRequestReviewMutation($input: SubmitPullRequestReviewInput!) @raw_response_type {
        submitPullRequestReview(input: $input) {
          pullRequestReview {
            ...PullRequestReviewHeaderAndComment_pullRequestReview
            url
            state
            pullRequest {
              viewerPendingReview {
                id
                comments {
                  totalCount
                }
              }
            }
            comments(first: 100) {
              edges {
                node {
                  state
                }
              }
            }
          }
        }
      }
    `,
    variables: {input},
    onCompleted,
    onError,
    updater: store => {
      for (const path of pathsToInvalidate ?? []) {
        store
          .get(pullRequestId)
          ?.getLinkedRecord('comparison')
          ?.getLinkedRecord('diffEntry', {path})
          ?.invalidateRecord()
      }

      // Update timeline items for the ActivityView
      const newReview = store.getRootField('submitPullRequestReview').getLinkedRecord('pullRequestReview')
      const connectionId = activityViewForwardPaginationConnectionId(pullRequestId)

      const connectionRecord = store.get(connectionId)
      if (connectionRecord && newReview) {
        const edges = connectionRecord.getLinkedRecords('edges')
        // Check if there are any duplicate edges
        if (edges) {
          const duplicateEdge = edges.find(edge => {
            const node = edge.getLinkedRecord('node')
            return node && node.getDataID() === newReview.getDataID()
          })

          if (!duplicateEdge) {
            const newEdge = ConnectionHandler.createEdge(
              store,
              connectionRecord,
              newReview,
              'PullRequestTimelineItemEdge',
            )
            ConnectionHandler.insertEdgeAfter(connectionRecord, newEdge)
          }
        }
      }
    },
  })
}
