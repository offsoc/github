/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/must-colocate-fragment-spreads */

import {graphql} from 'react-relay'
import type {IssueEventWrapperQuery, IssueEventWrapperQuery$data} from './__generated__/IssueEventWrapperQuery.graphql'
import type {Decorator} from '@storybook/react'

// Corresponding to Interfaces::TimelineEvent in the graphQL schema
export interface TimelineEventNode {
  __typename: string
  databaseId: number
  createdAt: string
  actor: {
    __typename: string
    login: string
    avatarUrl: string
  }
}

export type IssuesTimelineQueries = {
  issueTimelineQuery: IssueEventWrapperQuery
}

export function getExample(decorators: Decorator[], resolvedNode: TimelineEventNode) {
  return {
    decorators,
    parameters: {
      relay: {
        queries: {
          issueTimelineQuery: {
            type: 'fragment',
            query: graphql`
              query IssueEventWrapperQuery @relay_test_operation {
                node(id: "SSC_asdkasd") {
                  __typename
                  ...IssueComment_issueComment
                  ...ReactionViewerGroups
                  ...AddedToProjectEvent
                  ...MovedColumnsInProjectEvent
                  ...RemovedFromProjectEvent
                  ...SubscribedEvent
                  ...UnsubscribedEvent
                  ...MentionedEvent
                  ...ClosedEvent
                  ...ReopenedEvent
                  ...LockedEvent
                  ...UnlockedEvent
                  ...PinnedEvent
                  ...UnpinnedEvent
                  ...LabeledEvent
                  ...RenamedTitleEvent
                  ...UnlabeledEvent
                  ...UnassignedEvent
                  ...AssignedEvent
                  ...CommentDeletedEvent
                  ...UserBlockedEvent
                  ...MilestonedEvent
                  ...DemilestonedEvent
                  ...CrossReferencedEvent
                  ...ReferencedEvent
                  ...ConnectedEvent
                  ...TransferredEvent
                  ...ConvertedNoteToIssueEvent
                  ...DisconnectedEvent
                  ...MarkedAsDuplicateEvent
                  ...UnmarkedAsDuplicateEvent
                  ...ConvertedToDiscussionEvent
                  ...AddedToProjectV2Event
                  ...RemovedFromProjectV2Event
                  ...ProjectV2ItemStatusChangedEvent
                  ...ConvertedFromDraftEvent
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Node() {
            return resolvedNode
          },
        },
        mapStoryArgs: ({queryData}: {queryData: {issueTimelineQuery: IssueEventWrapperQuery$data}}) => ({
          queryRef: queryData.issueTimelineQuery.node,
          issueUrl: 'issue.link',
        }),
      },
    },
  }
}
