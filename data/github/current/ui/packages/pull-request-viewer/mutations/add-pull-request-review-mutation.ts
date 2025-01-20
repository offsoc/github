import {commitMutation, ConnectionHandler, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {activityViewForwardPaginationConnectionId} from '../components/activity/ActivityView'
import type {
  addPullRequestReviewMutation as addPullRequestReviewMutationType,
  addPullRequestReviewMutation$data,
  DraftPullRequestReviewComment,
  DraftPullRequestReviewThread,
  PullRequestReviewEvent,
} from './__generated__/addPullRequestReviewMutation.graphql'

interface AddPullRequestReviewInput {
  body?: string
  commitOID?: string
  event: PullRequestReviewEvent
  pullRequestId: string
  comments?: DraftPullRequestReviewComment[]
  threads?: DraftPullRequestReviewThread[]
}

export default function addPullRequestReviewMutation({
  environment,
  input,
  onCompleted,
  onError,
  pullRequestId,
}: {
  environment: Environment
  input: AddPullRequestReviewInput
  onCompleted?: (response: addPullRequestReviewMutation$data) => void
  onError?: (error: Error) => void
  pullRequestId: string
}) {
  return commitMutation<addPullRequestReviewMutationType>(environment, {
    mutation: graphql`
      mutation addPullRequestReviewMutation($input: AddPullRequestReviewInput!) @raw_response_type {
        addPullRequestReview(input: $input) {
          pullRequestReview {
            url
            ...PullRequestReview_pullRequestReview
            pullRequest {
              latestReviews(first: 100) {
                edges {
                  node {
                    authorCanPushToRepository
                    author {
                      login
                      avatarUrl
                      name
                      url
                    }
                    onBehalfOf(first: 10) {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                    onBehalfOfReviewers {
                      asCodeowner
                      reviewer {
                        ... on Team {
                          __typename
                          combinedSlug
                        }
                        ... on User {
                          __typename
                          login
                        }
                      }
                    }
                    state
                  }
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
      const newReview = store.getRootField('addPullRequestReview').getLinkedRecord('pullRequestReview')
      const connectionId = activityViewForwardPaginationConnectionId(pullRequestId)

      const connectionRecord = store.get(connectionId)
      if (connectionRecord) {
        const newEdge = ConnectionHandler.createEdge(store, connectionRecord, newReview, 'PullRequestTimelineItemEdge')
        ConnectionHandler.insertEdgeAfter(connectionRecord, newEdge)
      }
    },
  })
}
