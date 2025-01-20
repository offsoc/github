/* eslint eslint-comments/no-use: off */
import {Timeline} from '@primer/react'
import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import {AddedToProjectEvent} from '@github-ui/timeline-items/AddedToProjectEvent'
import {MovedColumnsInProjectEvent} from '@github-ui/timeline-items/MovedColumnsInProjectEvent'
import {RemovedFromProjectEvent} from '@github-ui/timeline-items/RemovedFromProjectEvent'
import {SubscribedEvent} from '@github-ui/timeline-items/SubscribedEvent'
import {UnsubscribedEvent} from '@github-ui/timeline-items/UnsubscribedEvent'
import {MentionedEvent} from '@github-ui/timeline-items/MentionedEvent'
import {ClosedEvent} from '@github-ui/timeline-items/ClosedEvent'
import {ReopenedEvent} from '@github-ui/timeline-items/ReopenedEvent'
import {RenamedTitleEvent} from '@github-ui/timeline-items/RenamedTitleEvent'
import {LockedEvent} from '@github-ui/timeline-items/LockedEvent'
import {UnlockedEvent} from '@github-ui/timeline-items/UnlockedEvent'
import {PinnedEvent} from '@github-ui/timeline-items/PinnedEvent'
import {UnpinnedEvent} from '@github-ui/timeline-items/UnpinnedEvent'
import {LabeledEvent} from '@github-ui/timeline-items/LabeledEvent'
import {UnlabeledEvent} from '@github-ui/timeline-items/UnlabeledEvent'
import {UnassignedEvent} from '@github-ui/timeline-items/UnassignedEvent'
import {AssignedEvent} from '@github-ui/timeline-items/AssignedEvent'
import {CommentDeletedEvent} from '@github-ui/timeline-items/CommentDeletedEvent'
import {UserBlockedEvent} from '@github-ui/timeline-items/UserBlockedEvent'
import {MilestonedEvent} from '@github-ui/timeline-items/MilestonedEvent'
import {DemilestonedEvent} from '@github-ui/timeline-items/DemilestonedEvent'
import {CrossReferencedEvent} from '@github-ui/timeline-items/CrossReferencedEvent'
import {ReferencedEvent} from '@github-ui/timeline-items/ReferencedEvent'
import {ConnectedEvent} from '@github-ui/timeline-items/ConnectedEvent'
import {TransferredEvent} from '@github-ui/timeline-items/TransferredEvent'
import {ConvertedNoteToIssueEvent} from '@github-ui/timeline-items/ConvertedNoteToIssueEvent'
import {DisconnectedEvent} from '@github-ui/timeline-items/DisconnectedEvent'
import {MarkedAsDuplicateEvent} from '@github-ui/timeline-items/MarkedAsDuplicateEvent'
import {UnmarkedAsDuplicateEvent} from '@github-ui/timeline-items/UnmarkedAsDuplicateEvent'
import {ConvertedToDiscussionEvent} from '@github-ui/timeline-items/ConvertedToDiscussionEvent'
import {AddedToProjectV2Event} from '@github-ui/timeline-items/AddedToProjectV2Event'
import {RemovedFromProjectV2Event} from '@github-ui/timeline-items/RemovedFromProjectV2Event'
import {ProjectV2ItemStatusChangedEvent} from '@github-ui/timeline-items/ProjectV2ItemStatusChangedEvent'
import {ConvertedFromDraftEvent} from '@github-ui/timeline-items/ConvertedFromDraftEvent'
import {VALUES} from '@github-ui/timeline-items/Values'
import {TimelineRowBorder} from '@github-ui/timeline-items/TimelineRowBorder'
import {FallbackEvent} from '@github-ui/timeline-items/FallbackEvent'
import type {HighlightedEvent} from '@github-ui/timeline-items/HighlightedEvent'
import type {ReferenceTypes} from '@github-ui/timeline-items/CrossReferencedEvent'
import type {TimelineRowBorderCommentParams} from '@github-ui/timeline-items/TimelineRowBorder'
import {IssueComment} from '@github-ui/commenting/IssueComment'
import {createElement, useCallback, useEffect, forwardRef, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {TEST_IDS} from '../constants/test-ids'
import type {TimelineItemsPaginated$key} from './__generated__/TimelineItemsPaginated.graphql'
import {rollupEvents, type RolledUpTimelineItem, type TimelineItem} from '../utils/timeline-rollups'
import type {IssueTimelineSecondary$key} from './__generated__/IssueTimelineSecondary.graphql'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'

export type TimelineBaseProps = {
  viewer: string | null
  commentBoxConfig?: CommentBoxConfig
  onCommentChange?: (id: string) => void
  onCommentEditCancel?: (id: string) => void
  onCommentReply?: (quotedComment: string) => void
  onLinkClick?: (event: MouseEvent) => void
  navigate: (url: string) => void
  timelineEventBaseUrl?: string
  withLiveUpdates?: boolean
  relayConnectionIds: string[]
  commentSubjectAuthorLogin?: string
  highlightedEvent?: HighlightedEvent
  highlightedEventText?: string
  issueSecondary?: IssueTimelineSecondary$key
}

export type TimelineItemsProps = {
  issue: TimelineItemsPaginated$key
  highlightedCommentId?: string
  timelineEventBaseUrl?: string
  currentIssueId: string
  issueUrl: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  type: string
  hideTopSeparator?: boolean
} & TimelineBaseProps

type timelineProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryRef: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rollupGroup?: Record<string, any[]>
  currentIssueId: string
  issueUrl: string
  timelineEventBaseUrl: string
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  referenceTypes?: ReferenceTypes
  viewer: string | null
  onLinkClick?: (event: MouseEvent) => void
}

const useShouldIncludeClassicProjectEvents = () => {
  const {projects_classic_sunset_ui, projects_classic_sunset_override} = useFeatureFlags()

  if (projects_classic_sunset_override) return true

  return !projects_classic_sunset_ui
}

const CLASSIC_PROJECT_EVENTS = [
  'AddedToProjectEvent',
  'MovedColumnsInProjectEvent',
  'RemovedFromProjectEvent',
  'ConvertedNoteToIssueEvent',
]

export const TIMELINE_ITEMS: Record<string, ((args: timelineProps) => JSX.Element) | undefined> = {
  AddedToProjectEvent,
  MovedColumnsInProjectEvent,
  RemovedFromProjectEvent,
  SubscribedEvent,
  UnsubscribedEvent,
  MentionedEvent,
  ClosedEvent,
  ReopenedEvent,
  RenamedTitleEvent,
  LockedEvent,
  UnlockedEvent,
  PinnedEvent,
  UnpinnedEvent,
  LabeledEvent,
  UnlabeledEvent,
  UnassignedEvent,
  AssignedEvent,
  CommentDeletedEvent,
  UserBlockedEvent,
  MilestonedEvent,
  DemilestonedEvent,
  CrossReferencedEvent,
  ReferencedEvent,
  ConnectedEvent,
  TransferredEvent,
  ConvertedNoteToIssueEvent,
  DisconnectedEvent,
  MarkedAsDuplicateEvent,
  UnmarkedAsDuplicateEvent,
  ConvertedToDiscussionEvent,
  AddedToProjectV2Event,
  RemovedFromProjectV2Event,
  ProjectV2ItemStatusChangedEvent,
  ConvertedFromDraftEvent,
}

export const TimelineItems = forwardRef<HTMLDivElement, TimelineItemsProps>(
  (
    {
      issue,
      onCommentChange,
      onCommentEditCancel,
      onCommentReply,
      highlightedEvent,
      timelineEventBaseUrl,
      currentIssueId: issueId,
      issueUrl,
      type,
      viewer,
      hideTopSeparator,
      ...commentArgs
    },
    ref,
  ) => {
    const [currentHighlightedEvent, setCurrentHighlightedEvent] = useState(highlightedEvent)

    useEffect(() => setCurrentHighlightedEvent(highlightedEvent), [highlightedEvent])

    const data = useFragment(
      graphql`
        fragment TimelineItemsPaginated on IssueTimelineItemsConnection {
          edges {
            node {
              ... on IssueComment {
                databaseId # this is required for highlighting support as this is a major event
                viewerDidAuthor # this is required for giving the viewer's comments a different border color
                issue {
                  author {
                    login
                  }
                }
              }
              ... on ReferencedEvent {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                createdAt
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
              }
              ... on CrossReferencedEvent {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                createdAt
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                source {
                  __typename
                }
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                willCloseTarget
              }
              ... on MentionedEvent {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
              }
              ... on LabeledEvent {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                createdAt
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                label {
                  id
                }
              }
              ... on UnlabeledEvent {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                createdAt
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                label {
                  id
                }
              }
              ... on AssignedEvent {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                createdAt
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                assignee {
                  ... on User {
                    id
                  }
                  ... on Bot {
                    id
                  }
                  ... on Mannequin {
                    id
                  }
                  ... on Organization {
                    id
                  }
                }
              }
              ... on UnassignedEvent {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                createdAt
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                assignee {
                  __typename
                  ... on User {
                    id
                  }
                  ... on Bot {
                    id
                  }
                  ... on Mannequin {
                    id
                  }
                  ... on Organization {
                    id
                  }
                }
              }
              ... on AddedToProjectV2Event {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                createdAt
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
              }
              ... on RemovedFromProjectV2Event {
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                createdAt
                # eslint-disable-next-line relay/unused-fields Required for the rollup calculations
                actor {
                  login
                }
              }
              __id
              __typename
              ...IssueComment_issueComment
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
        }
      `,
      issue,
    )
    const includeClassicProjectEvents = useShouldIncludeClassicProjectEvents()

    let validTimelineItems = (data?.edges || []).flatMap(a => (a ? [a.node] : []))
    if (!includeClassicProjectEvents) {
      validTimelineItems = validTimelineItems.filter(item => {
        if (!item) return false
        return !CLASSIC_PROJECT_EVENTS.includes(item.__typename)
      })
    }

    const rolledUpTimelineItems = rollupEvents(validTimelineItems)

    const handlePageClick = useCallback(() => {
      setCurrentHighlightedEvent(undefined)
    }, [])

    useEffect(() => {
      document.addEventListener('click', handlePageClick)

      return () => {
        document.removeEventListener('click', handlePageClick)
      }
    }, [handlePageClick])

    // Extract just the items from the rollup groups
    const timelineItemsWithoutRollupGroups = rolledUpTimelineItems.map(({item}) => item)

    const getTimelineItemRenderer = useCallback(
      (rolledUpItem: RolledUpTimelineItem, index: number) => {
        const {item, rollupGroup} = rolledUpItem

        // Handling items we couldn't fetch
        if (!item) {
          return (
            <TimelineRowBorder
              key={`failed-timeline-item-${index}`}
              addDivider={true}
              item={{__id: `failed-timeline-item-${index}`}}
              isMajor={false}
              isHighlighted={false}
            >
              <FallbackEvent />
            </TimelineRowBorder>
          )
        }

        const highlightedEventId =
          item.__typename !== 'IssueComment' && currentHighlightedEvent?.prefix !== 'issuecomment'
            ? currentHighlightedEvent?.id
            : undefined
        const highlightedCommentId =
          item.__typename === 'IssueComment' && currentHighlightedEvent?.prefix === 'issuecomment'
            ? currentHighlightedEvent?.id
            : undefined

        const isMajorEvent = VALUES.timeline.majorEventTypes.includes(item.__typename)

        const addDivider = shouldAddDivider(timelineItemsWithoutRollupGroups, index, hideTopSeparator)

        const timelineReactElement = TIMELINE_ITEMS[item.__typename]

        let itemToRender = null
        let commentParams: TimelineRowBorderCommentParams | undefined = undefined

        if (item.__typename === 'IssueComment') {
          commentParams = {
            first: index === 0 || timelineItemsWithoutRollupGroups[index - 1]?.__typename !== 'IssueComment',
            last:
              index === timelineItemsWithoutRollupGroups.length - 1 ||
              timelineItemsWithoutRollupGroups[index + 1]?.__typename !== 'IssueComment',
            viewerDidAuthor: item?.viewerDidAuthor,
          }
          itemToRender = (
            <IssueComment
              comment={item}
              commentSubjectAuthorLogin={item.issue?.author?.login ?? ''}
              onChange={() => onCommentChange && onCommentChange(item.__id)}
              onEditCancel={() => onCommentEditCancel && onCommentEditCancel(item.__id)}
              onReply={quotedComment => onCommentReply && onCommentReply(quotedComment)}
              onSave={() => onCommentEditCancel && onCommentEditCancel(item.__id)}
              highlightedCommentId={highlightedCommentId}
              {...commentArgs}
            />
          )
        }

        if (timelineReactElement) {
          itemToRender = createElement(timelineReactElement, {
            queryRef: item,
            rollupGroup,
            key: item.__id,
            currentIssueId: issueId,
            issueUrl,
            highlightedEventId,
            timelineEventBaseUrl: timelineEventBaseUrl || '/issues',
            refAttribute: commentArgs.refAttribute,
            onLinkClick: commentArgs.onLinkClick,
            viewer,
          })
        }

        const isHighlighted = (highlightedCommentId || highlightedEventId) === String(item.databaseId)

        return (
          <TimelineRowBorder
            key={item.__id}
            addDivider={addDivider}
            item={item}
            isMajor={isMajorEvent && VALUES.timeline.borderedMajorEventTypes.includes(item.__typename)}
            isHighlighted={isHighlighted}
            commentParams={commentParams}
          >
            {itemToRender}
          </TimelineRowBorder>
        )
      },
      [
        commentArgs,
        currentHighlightedEvent?.id,
        currentHighlightedEvent?.prefix,
        hideTopSeparator,
        issueId,
        issueUrl,
        onCommentChange,
        onCommentEditCancel,
        onCommentReply,
        timelineEventBaseUrl,
        timelineItemsWithoutRollupGroups,
        viewer,
      ],
    )

    return (
      <Timeline ref={ref} data-testid={TEST_IDS.issueTimeline(type)}>
        {rolledUpTimelineItems
          .map((rolledUpItem, index) => {
            const renderItem = getTimelineItemRenderer(rolledUpItem, index)
            return {type: rolledUpItem.item?.__typename, item: renderItem, processed: false}
          })
          // This is grouping events that are rendered next to eachother
          // inside <section> tags for adding the correct landmarks for screenreaders
          .reduce((newArr, currentItem, currentIndex, allItems) => {
            if (currentItem.processed) return newArr
            if (currentItem.type === 'IssueComment') {
              currentItem.processed = true
              newArr.push(currentItem.item)
              return newArr
            }

            const endSectionIndex = rolledUpTimelineItems.findIndex((item, index) => {
              if (index > currentIndex && item.item?.__typename === 'IssueComment') return index
              return false
            })
            const sectionElement = (
              <section key={`events-${currentIndex}`} aria-label="Events">
                {allItems.slice(currentIndex, endSectionIndex > -1 ? endSectionIndex : undefined).map(item => {
                  item.processed = true
                  return item.item
                })}
              </section>
            )

            newArr.push(sectionElement)
            return newArr
          }, [] as JSX.Element[])}
      </Timeline>
    )
  },
)
TimelineItems.displayName = 'TimelineItems'

function shouldAddDivider(items: TimelineItem[], index: number, hideTopSeparator: boolean = false) {
  if (index === 0 && hideTopSeparator) return false

  if (index > 0 && items[index - 1]) {
    const eventType = items[index]!.__typename
    const previousEventType = items[index - 1]!.__typename
    const isMajorEvent = VALUES.timeline.majorEventTypes.includes(eventType)
    const previousIsMajorEvent = VALUES.timeline.majorEventTypes.includes(previousEventType)

    if (isMajorEvent === previousIsMajorEvent) {
      if (eventType === 'IssueComment' && previousEventType === 'IssueComment') {
        return false
      } else if (eventType !== 'IssueComment' && previousEventType !== 'IssueComment') {
        return false
      }
    }
  }
  return true
}
