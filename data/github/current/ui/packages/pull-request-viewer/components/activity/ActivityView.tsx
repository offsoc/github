import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import {useCommentEditsContext} from '@github-ui/commenting/CommentEditsContext'
import {CLASS_NAMES} from '@github-ui/commenting/DomElements'
import {IssueComment, type IssueCommentProps} from '@github-ui/commenting/IssueComment'
import {PullRequestCommentComposer} from '@github-ui/commenting/PullRequestCommentComposer'
import type {CommentingAppPayload} from '@github-ui/commenting/Types'
import type {MarkdownComposerRef} from '@github-ui/commenting/useMarkdownBody'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {ClosedEvent, type ClosedEventProps} from '@github-ui/timeline-items/ClosedEvent'
import {EVENTS, PULL_REQUEST_EVENTS} from '@github-ui/timeline-items/Events'
import {getHighlightedEvent, getHighlightedEventText} from '@github-ui/timeline-items/HighlightedEvent'
import {ReopenedEvent, type ReopenedEventProps} from '@github-ui/timeline-items/ReopenedEvent'
import {TimelineLoadMore} from '@github-ui/timeline-items/TimelineLoadMore'
import {TimelineRowBorder} from '@github-ui/timeline-items/TimelineRowBorder'
import {VALUES} from '@github-ui/timeline-items/Values'
import type {SxProp} from '@primer/react'
import {createElement, useCallback, useEffect, useMemo, useRef} from 'react'
import {ConnectionHandler, graphql, useFragment, usePaginationFragment} from 'react-relay'
import {useLocation} from 'react-router-dom'

import {RELAY_CONSTANTS} from '../../constants'
import cleanData from '../../helpers/clean-query-data'
import {shouldAddTimelineDivider} from '../../helpers/should-add-timeline-divider-helper'
import type {
  ActivityView_pullRequest$data,
  ActivityView_pullRequest$key,
} from './__generated__/ActivityView_pullRequest.graphql'
import type {ActivityView_pullRequest_backwardPagination$key} from './__generated__/ActivityView_pullRequest_backwardPagination.graphql'
import type {ActivityView_pullRequest_forwardPagination$key} from './__generated__/ActivityView_pullRequest_forwardPagination.graphql'
import type {ActivityView_PullRequestTimeline_pullRequest$key} from './__generated__/ActivityView_PullRequestTimeline_pullRequest.graphql'
import type {ActivityView_viewer$key} from './__generated__/ActivityView_viewer.graphql'
import type {PullRequestActivityBackwardPaginationQuery} from './__generated__/PullRequestActivityBackwardPaginationQuery.graphql'
import type {PullRequestActivityForwardPaginationQuery} from './__generated__/PullRequestActivityForwardPaginationQuery.graphql'
import {BaseRefForcePushedEvent, type BaseRefForcePushedEventProps} from './timeline-items/BaseRefForcePushedEvent'
import {HeadRefForcePushedEvent, type HeadRefForcePushedEventProps} from './timeline-items/HeadRefForcePushedEvent'
import {MergedEvent, type MergedEventProps} from './timeline-items/MergedEvent'
import {PullRequestCommit, type PullRequestCommitProps} from './timeline-items/PullRequestCommit'
import {PullRequestReview, type PullRequestReviewProps} from './timeline-items/PullRequestReview'
import {ReviewDismissedEvent, type ReviewDismissedEventProps} from './timeline-items/ReviewDismissedEvent'
import {ReviewRequestedEvent, type ReviewRequestedEventProps} from './timeline-items/ReviewRequestedEvent'

type TimelineItemProps = BaseRefForcePushedEventProps &
  ClosedEventProps &
  HeadRefForcePushedEventProps &
  MergedEventProps &
  ReopenedEventProps &
  ReviewDismissedEventProps &
  ReviewRequestedEventProps &
  IssueCommentProps &
  PullRequestCommitProps &
  PullRequestReviewProps

export const TIMELINE_ITEMS: Record<string, ((args: TimelineItemProps) => JSX.Element | null) | undefined> = {
  BaseRefForcePushedEvent,
  ClosedEvent,
  HeadRefForcePushedEvent,
  MergedEvent,
  ReopenedEvent,
  ReviewDismissedEvent,
  ReviewRequestedEvent,
  IssueComment,
  PullRequestCommit,
  PullRequestReview,
}

function useIsActivityPage() {
  const location = useLocation()
  return location.pathname.includes('/activity')
}

const typenameToEventPrefix: {[key: string]: string} = {
  IssueComment: EVENTS.issueComment,
  PullRequestReview: EVENTS.pullRequestReview,
  PullRequestComment: EVENTS.pullRequestComment,
}

const supportedTimelineItems = [
  'ISSUE_COMMENT',
  'PULL_REQUEST_REVIEW',
  'PULL_REQUEST_COMMIT',
  'BASE_REF_FORCE_PUSHED_EVENT',
  'HEAD_REF_FORCE_PUSHED_EVENT',
  'CLOSED_EVENT',
  'REOPENED_EVENT',
  'MERGED_EVENT',
  'REVIEW_DISMISSED_EVENT',
  'REVIEW_REQUESTED_EVENT',
]

function getTypePrefix(timelineItemType: string): string {
  // We default to "EVENTS.event" if there is not a special typename prefix.
  // This is based on the remaining timeline items having an "events" prefix.
  return typenameToEventPrefix[timelineItemType] || EVENTS.event
}

/**
 * Get the connection ID for the `PullRequestTimelineForwardPagination_forwardTimeline` thread connection
 * The filters should be kept in sync with the arguments used in the `ActivityView_pullRequest_forwardPagination` fragment
 *
 * @param pullRequestId The ID of the pull request
 * @returns The connection ID
 */
export function activityViewForwardPaginationConnectionId(pullRequestId: string) {
  return `${ConnectionHandler.getConnectionID(pullRequestId, `PullRequestTimelineForwardPagination_forwardTimeline`, {
    itemTypes: supportedTimelineItems,
    visibleEventsOnly: true,
  })}`
}

/**
 * Get the connection ID for the `PullRequestTimelineBackwardPagination_backwardTimeline` thread connection
 * The filters should be kept in sync with the arguments used in the `ActivityView_pullRequest_backwardPagination` fragment
 *
 * @param pullRequestId The ID of the pull request
 * @returns The connection ID
 */
export function activityViewBackwardPaginationConnectionId(pullRequestId: string) {
  return `${ConnectionHandler.getConnectionID(pullRequestId, `PullRequestTimelineBackwardPagination_backwardTimeline`, {
    itemTypes: supportedTimelineItems,
    visibleEventsOnly: true,
  })}`
}

export function ActivityView({
  pullRequest,
  viewer,
}: {
  pullRequest: ActivityView_pullRequest$key
  viewer: ActivityView_viewer$key
}) {
  const pullRequestData = useFragment(
    graphql`
      fragment ActivityView_pullRequest on PullRequest @argumentDefinitions(timelinePageSize: {type: "Int"}) {
        ...ActivityView_pullRequest_forwardPagination @arguments(first: $timelinePageSize)
        ...ActivityView_pullRequest_backwardPagination @arguments(last: 0)
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...PullRequestCommentComposer_pullRequest
        ...ActivityView_PullRequestTimeline_pullRequest
      }
    `,
    pullRequest,
  )

  return <PullRequestTimeline pullRequest={pullRequestData} viewer={viewer} />
}

function PullRequestTimeline({
  pullRequest,
  viewer,
}: {
  pullRequest: ActivityView_pullRequest$data
  viewer: ActivityView_viewer$key
} & SxProp) {
  const pullRequestData = useFragment<ActivityView_PullRequestTimeline_pullRequest$key>(
    graphql`
      fragment ActivityView_PullRequestTimeline_pullRequest on PullRequest {
        id
        url
        viewerCanComment
        author {
          login
        }
        repository {
          url
        }
      }
    `,
    pullRequest,
  )

  const {data: forwardTimelineData, loadNext} = usePaginationFragment<
    PullRequestActivityForwardPaginationQuery,
    ActivityView_pullRequest_forwardPagination$key
  >(
    graphql`
      fragment ActivityView_pullRequest_forwardPagination on PullRequest
      @argumentDefinitions(cursor: {type: "String", defaultValue: null}, first: {type: "Int"})
      @refetchable(queryName: "PullRequestActivityForwardPaginationQuery") {
        viewerCanComment
        #  if adding args to the connection, remember to update activityViewForwardPaginationConnectionId to be in sync
        forwardTimeline: timelineItems(
          first: $first
          after: $cursor
          visibleEventsOnly: true
          itemTypes: [
            ISSUE_COMMENT
            PULL_REQUEST_REVIEW
            PULL_REQUEST_COMMIT
            BASE_REF_FORCE_PUSHED_EVENT
            HEAD_REF_FORCE_PUSHED_EVENT
            CLOSED_EVENT
            REOPENED_EVENT
            MERGED_EVENT
            REVIEW_DISMISSED_EVENT
            REVIEW_REQUESTED_EVENT
          ]
        ) @connection(key: "PullRequestTimelineForwardPagination_forwardTimeline") {
          __id
          totalCount
          # eslint-disable-next-line relay/unused-fields
          edges {
            node {
              __id
              __typename
              ...IssueComment_issueComment
              ...PullRequestReview_pullRequestReview
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...ReactionViewerGroups
              ... on IssueComment {
                databaseId
              }
              ... on PullRequestReview {
                databaseId
              }
              ... on PullRequestCommit {
                ...PullRequestCommit_pullRequestCommit
              }
              ... on BaseRefForcePushedEvent {
                databaseId
                ...BaseRefForcePushedEvent_baseRefForcePushedEvent
              }
              ... on HeadRefForcePushedEvent {
                databaseId
                ...HeadRefForcePushedEvent_headRefForcePushedEvent
              }
              ... on ClosedEvent {
                databaseId
                ...ClosedEvent
              }
              ... on ReopenedEvent {
                databaseId
                ...ReopenedEvent
              }
              ... on MergedEvent {
                databaseId
                ...MergedEvent_mergedEvent
              }
              ... on ReviewDismissedEvent {
                databaseId
                ...ReviewDismissedEvent_reviewDismissedEvent
              }
              ... on ReviewRequestedEvent {
                databaseId
                ...ReviewRequestedEvent_reviewRequestedEvent
              }
            }
          }
        }
      }
    `,
    pullRequest,
  )

  const {data: backwardTimelineData, loadPrevious} = usePaginationFragment<
    PullRequestActivityBackwardPaginationQuery,
    ActivityView_pullRequest_backwardPagination$key
  >(
    graphql`
      fragment ActivityView_pullRequest_backwardPagination on PullRequest
      @argumentDefinitions(cursor: {type: "String", defaultValue: null}, last: {type: "Int"})
      @refetchable(queryName: "PullRequestActivityBackwardPaginationQuery") {
        #  if adding args to the connection, remember to update activityViewBackwardPaginationConnectionId to be in sync
        backwardTimeline: timelineItems(
          last: $last
          before: $cursor
          visibleEventsOnly: true
          itemTypes: [
            ISSUE_COMMENT
            PULL_REQUEST_REVIEW
            PULL_REQUEST_COMMIT
            BASE_REF_FORCE_PUSHED_EVENT
            HEAD_REF_FORCE_PUSHED_EVENT
            CLOSED_EVENT
            REOPENED_EVENT
            MERGED_EVENT
            REVIEW_DISMISSED_EVENT
            REVIEW_REQUESTED_EVENT
          ]
        ) @connection(key: "PullRequestTimelineBackwardPagination_backwardTimeline") {
          __id
          # eslint-disable-next-line relay/unused-fields
          edges {
            node {
              __id
              __typename
              ...IssueComment_issueComment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...ReactionViewerGroups
              ...PullRequestReview_pullRequestReview
              ... on IssueComment {
                databaseId
              }
              ... on PullRequestReview {
                databaseId
              }
              ... on PullRequestCommit {
                ...PullRequestCommit_pullRequestCommit
              }
              ... on BaseRefForcePushedEvent {
                databaseId
                ...BaseRefForcePushedEvent_baseRefForcePushedEvent
              }
              ... on HeadRefForcePushedEvent {
                databaseId
                ...HeadRefForcePushedEvent_headRefForcePushedEvent
              }
              ... on ClosedEvent {
                databaseId
                ...ClosedEvent
              }
              ... on ReopenedEvent {
                databaseId
                ...ReopenedEvent
              }
              ... on MergedEvent {
                databaseId
                ...MergedEvent_mergedEvent
              }
              ... on ReviewDismissedEvent {
                databaseId
                ...ReviewDismissedEvent_reviewDismissedEvent
              }
              ... on ReviewRequestedEvent {
                databaseId
                ...ReviewRequestedEvent_reviewRequestedEvent
              }
            }
          }
        }
      }
    `,
    pullRequest,
  )

  const hasScrolledToHighlightedItem = useRef(false)
  const isActivityPage = useIsActivityPage()
  const anchorBaseUrl = isActivityPage ? `${pullRequestData.url}/activity` : pullRequestData.url

  const viewerData = useFragment<ActivityView_viewer$key>(
    graphql`
      fragment ActivityView_viewer on User {
        login
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...Thread_viewer
      }
    `,
    viewer,
  )

  const {startCommentEdit, cancelCommentEdit} = useCommentEditsContext()
  const composerRef = useRef<MarkdownComposerRef>(null)
  const appPayload = useAppPayload<CommentingAppPayload>()
  const pasteUrlsAsPlainText = appPayload?.paste_url_link_as_plain_text || false
  const useMonospaceFont = appPayload?.current_user_settings?.use_monospace_font || false
  const commentBoxConfig: CommentBoxConfig = {
    pasteUrlsAsPlainText,
    useMonospaceFont,
  }
  const validForwardLoadedTimelineItems = cleanData(forwardTimelineData.forwardTimeline)
  const validBackwardLoadedTimelineItems = cleanData(backwardTimelineData.backwardTimeline)
  const loadedTimelineItemsCount = validForwardLoadedTimelineItems.length + validBackwardLoadedTimelineItems.length
  const totalTimelineItemsCount = forwardTimelineData.forwardTimeline.totalCount
  const hasMoreItems = totalTimelineItemsCount > loadedTimelineItemsCount

  const highlightedEventText = getHighlightedEventText(ssrSafeLocation.hash, PULL_REQUEST_EVENTS)
  const highlightedEvent = useMemo(() => getHighlightedEvent(highlightedEventText), [highlightedEventText])

  const loadMoreBackwardTimelineItems = useCallback(
    (count: number, options?: {onComplete?: () => void}) => {
      const itemsLeft = totalTimelineItemsCount - loadedTimelineItemsCount
      const loadCount = Math.min(count, itemsLeft || 0)
      if (loadCount === 0) {
        options?.onComplete?.()
        return
      }
      loadPrevious(loadCount, {
        onComplete: () => {
          options?.onComplete?.()
        },
      })
    },
    [totalTimelineItemsCount, loadPrevious, loadedTimelineItemsCount],
  )

  // Handle rendering backward timeline items
  useEffect(() => {
    if (hasMoreItems && validBackwardLoadedTimelineItems.length === 0) {
      loadMoreBackwardTimelineItems(RELAY_CONSTANTS.timelinePageSize)
    }
  }, [hasMoreItems, loadMoreBackwardTimelineItems, validBackwardLoadedTimelineItems.length])

  // Handle cases where highlighted timeline event hasn't been loaded into the DOM yet
  useEffect(() => {
    if (!highlightedEvent || hasScrolledToHighlightedItem.current) return

    const highlightedEventElement = document.querySelector('[data-highlighted-event="true"]')

    if (!highlightedEventElement && hasMoreItems) {
      loadMoreBackwardTimelineItems(RELAY_CONSTANTS.timelinePageSize)
    }

    if (highlightedEventElement) {
      highlightedEventElement.scrollIntoView({block: 'center'})
      hasScrolledToHighlightedItem.current = true
    }
  }, [
    forwardTimelineData,
    backwardTimelineData,
    highlightedEvent,
    validBackwardLoadedTimelineItems,
    hasMoreItems,
    loadMoreBackwardTimelineItems,
  ])

  const forwardConnectionId = forwardTimelineData.forwardTimeline.__id
  const backwardConnectionId = backwardTimelineData.backwardTimeline.__id
  const commentSubjectAuthorLogin = pullRequestData.author?.login ?? ''

  const focusPullRequestCommentComposer = useCallback(() => {
    setTimeout(() => composerRef.current?.focus(), 0)
  }, [composerRef])

  const handleCommentReply = useCallback(
    (quotedComment: string) => {
      composerRef.current?.setText(quotedComment)
      focusPullRequestCommentComposer()
    },
    [focusPullRequestCommentComposer],
  )

  const renderActivityItem = (
    item: (typeof validForwardLoadedTimelineItems)[0] | (typeof validBackwardLoadedTimelineItems)[0],
    index: number,
    isFrontTimelineItem: boolean,
  ) => {
    const typePrefix = getTypePrefix(item.__typename)
    const isHighlighted = typePrefix === highlightedEvent?.prefix && highlightedEvent?.id === String(item.databaseId)
    const addRowBorder = item.__typename !== 'PullRequestReview' ? true : false
    const isMajor = [...VALUES.timeline.majorEventTypes].includes(item.__typename)
    const addDivider = shouldAddTimelineDivider(
      validForwardLoadedTimelineItems,
      validBackwardLoadedTimelineItems,
      index,
      isFrontTimelineItem,
      isMajor,
    )

    const timelineReactElement = TIMELINE_ITEMS[item.__typename]

    if (!timelineReactElement) return null

    const itemToRender = createElement(timelineReactElement, {
      queryRef: item,
      key: item.__id,
      anchorBaseUrl,
      comment: item,
      commentBoxConfig,
      commentSubjectAuthorLogin,
      highlightedCommentId: highlightedEvent?.id,
      navigate: () => {},
      relayConnectionIds: [forwardConnectionId, backwardConnectionId],
      onReply: handleCommentReply,
      pullRequestUrl: pullRequestData.url,
      repositoryUrl: pullRequestData.repository.url,
      addDivider,
      highlightedEvent,
      viewer: viewerData,
      highlightedEventId: highlightedEvent?.id,
      issueUrl: pullRequestData.url,
      showStateReason: false,
      timelineEventBaseUrl: '',
    })

    if (addRowBorder) {
      return (
        <TimelineRowBorder
          key={item.__id}
          addDivider={addDivider}
          isHighlighted={isHighlighted}
          isMajor={isMajor}
          item={item}
        >
          {itemToRender}
        </TimelineRowBorder>
      )
    }

    return itemToRender
  }

  const loadMoreForwardTimelineItems = useCallback(
    (count: number, options?: {onComplete?: () => void}) => {
      const itemsLeft = totalTimelineItemsCount - loadedTimelineItemsCount
      const loadCount = Math.min(count, itemsLeft || 0)
      if (loadCount === 0) {
        options?.onComplete?.()
        return
      }
      loadNext(loadCount, {
        onComplete: () => {
          options?.onComplete?.()
        },
      })
    },
    [totalTimelineItemsCount, loadNext, loadedTimelineItemsCount],
  )

  return (
    <div className={CLASS_NAMES.commentsContainer}>
      {validForwardLoadedTimelineItems.map((item: (typeof validForwardLoadedTimelineItems)[0], index: number) =>
        renderActivityItem(item, index, true),
      )}
      {hasMoreItems && (
        <TimelineLoadMore
          loadMoreBottomFn={loadMoreBackwardTimelineItems}
          loadMoreTopFn={loadMoreForwardTimelineItems}
          numberOfTimelineItems={totalTimelineItemsCount - loadedTimelineItemsCount}
          type={'front'}
        />
      )}
      {validBackwardLoadedTimelineItems.map((item: (typeof validBackwardLoadedTimelineItems)[0], index: number) =>
        renderActivityItem(item, index, false),
      )}
      {pullRequestData.viewerCanComment && (
        <TimelineRowBorder
          addDivider={validForwardLoadedTimelineItems.length > 0 || validBackwardLoadedTimelineItems.length > 0}
          item={{__id: 'New comment'}}
          sx={{py: 0, pl: 0}}
        >
          <PullRequestCommentComposer
            ref={composerRef}
            commentBoxConfig={commentBoxConfig}
            connectionId={activityViewBackwardPaginationConnectionId(pullRequestData.id)}
            pullRequest={pullRequest}
            onCancel={() => cancelCommentEdit('new-comment')}
            onChange={() => startCommentEdit('new-comment')}
            onSave={() => cancelCommentEdit('new-comment')}
          />
        </TimelineRowBorder>
      )}
    </div>
  )
}
