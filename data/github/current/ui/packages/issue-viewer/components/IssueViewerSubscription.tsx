import {useMemo, useState} from 'react'
import {ConnectionHandler, graphql, useSubscription} from 'react-relay'

import type {
  IssueViewerSubscription,
  IssueViewerSubscription$data,
} from './__generated__/IssueViewerSubscription.graphql'

const subscription = graphql`
  subscription IssueViewerSubscription($issueId: ID!, $connections: [ID!]!, $skip: Int) {
    issueUpdated(id: $issueId) {
      deletedCommentId @deleteRecord
      issueMetadataUpdated {
        ...LabelsSectionAssignedLabels
        ...AssigneesSectionAssignees
        ...MilestonesSectionMilestone
        ...ProjectsSectionFragment
      }
      issueBodyUpdated {
        ...IssueBodyContent
      }
      issueTitleUpdated {
        ...Header
      }
      issueStateUpdated {
        ...HeaderState
        ...IssueActions
      }
      issueTypeUpdated {
        ...HeaderIssueType
      }
      issueReactionUpdated {
        ...ReactionViewerGroups
      }
      commentReactionUpdated {
        ...ReactionViewerGroups
      }
      commentUpdated {
        ...IssueCommentViewerMarkdownViewer
        ...IssueCommentEditorBodyFragment
      }
      subIssuesUpdated {
        ...SubIssuesList
        ...useHasSubIssues
      }
      issueTransferStateUpdated {
        ...SubIssuesList
        ...useHasSubIssues
        ...IssueBodyViewerSubIssues
      }
      # subIssuesSummaryUpdated: no need to subscribe to this here since we calculate that from the subIssues list directly
      parentIssueUpdated {
        ...RelationshipsSectionFragment
        ...HeaderParentTitle
      }
      issueTimelineUpdated {
        timelineItems(skip: $skip, first: 10, visibleEventsOnly: true) {
          totalCount
          edges @appendEdge(connections: $connections) {
            node {
              __id
              __typename
              ...AddedToProjectEvent
              ...MovedColumnsInProjectEvent
              ...RemovedFromProjectEvent
              ...SubscribedEvent
              ...UnsubscribedEvent
              ...MentionedEvent
              ...IssueComment_issueComment
              ...ReactionViewerGroups
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
        }
      }
    }
  }
`

export const useIssueViewerSubscription = (issueId: string, initialSkip: number | null) => {
  const [skipCount, setSkipCount] = useState(initialSkip || 0)
  const timelineConnectionId = ConnectionHandler.getConnectionID(
    issueId, // passed as input to the mutation/subscription
    'IssueBacksideTimeline_timelineItems',
  )
  const connectionId = `${timelineConnectionId}(visibleEventsOnly:true)`

  const config = useMemo(() => {
    return {
      subscription,
      onNext: (resp: IssueViewerSubscription$data | null | undefined) => {
        if (!resp) return

        // Since we only care about events after a certain point, we need to resubscribe with the new skip count if there are newer events
        const newTotalCount = resp.issueUpdated?.issueTimelineUpdated?.timelineItems?.totalCount
        if (newTotalCount && newTotalCount > skipCount) {
          setSkipCount(newTotalCount)
        }
      },
      variables: {
        issueId,
        connections: [connectionId],
        skip: skipCount,
      },
    }
  }, [issueId, skipCount, connectionId])

  useSubscription<IssueViewerSubscription>(config)
}
