import {Flash} from '@primer/react'
import {Suspense, useEffect, useRef, useCallback, useMemo, useState, forwardRef} from 'react'
import {graphql, type LoadMoreFn} from 'react-relay'
import {useFragment, usePaginationFragment} from 'react-relay/hooks'
import {CommentLoading} from '@github-ui/commenting/CommentLoading'

import type {IssueTimelinePaginated$key} from './__generated__/IssueTimelinePaginated.graphql'
import type {TimelinePaginationQuery} from './__generated__/TimelinePaginationQuery.graphql'
import {useIssueViewerSubscription} from './IssueViewerSubscription'
import {HighlightedTimeline} from './HighlightedTimeline'
import {type TimelineBaseProps, TimelineItems, type TimelineItemsProps} from './TimelineItems'
import {LABELS} from '@github-ui/timeline-items/Labels'
import {TimelineLoadMore} from '@github-ui/timeline-items/TimelineLoadMore'
import {getHighlightedEvent} from '@github-ui/timeline-items/HighlightedEvent'
import type {TimelinePaginationBackQuery} from './__generated__/TimelinePaginationBackQuery.graphql'
import type {
  IssueTimelineBackPaginated$data,
  IssueTimelineBackPaginated$key,
} from './__generated__/IssueTimelineBackPaginated.graphql'
import type {
  IssueTimelineFrontPaginated$data,
  IssueTimelineFrontPaginated$key,
} from './__generated__/IssueTimelineFrontPaginated.graphql'
import {HighlightedTimelineLoading} from './HighlightedTimelineLoading'
import {MESSAGES} from '../constants/messages'
import {TEST_IDS} from '../constants/test-ids'
import {VALUES} from '../constants/values'
// Using getFocusableChild for a callback after client side loading, won't affect SSR
// eslint-disable-next-line no-restricted-imports
import {getFocusableChild} from '@primer/behaviors/utils'
import {IssueTimelineLoading} from './IssueTimelineLoading'
import {useScrollToHighlighted} from '../hooks/use-scroll-to-highlighted'
import {IS_BROWSER} from '@github-ui/ssr-utils'

export type IssueTimelineProps = Omit<TimelineBaseProps, 'relayConnectionIds'> & {
  issue: IssueTimelinePaginated$key
}

type IssueTimelineInternalMultipleProps = Omit<IssueTimelineProps, 'issue'> & {
  issue: IssueTimelineFrontPaginated$key & IssueTimelineBackPaginated$key
}

type IssueTimelineInternalFragmentProps = TimelineBaseProps & {
  data: IssueTimelineFrontPaginated$data
  backData: IssueTimelineBackPaginated$data
  loadNext: LoadMoreFn<TimelinePaginationQuery>
  loadPrevious: LoadMoreFn<TimelinePaginationBackQuery>
}

type BackTimelineProps = TimelineBaseProps & {
  backData: IssueTimelineBackPaginated$data
  hideTopSeparator: boolean
}

export function IssueTimeline({issue, ...rest}: IssueTimelineProps) {
  const data = useFragment(
    graphql`
      fragment IssueTimelinePaginated on Issue @argumentDefinitions(numberOfTimelineItems: {type: "Int"}) {
        author {
          login
        }
        ...IssueTimelineFrontPaginated @arguments(numberOfTimelineItems: $numberOfTimelineItems)
        ...IssueTimelineBackPaginated @arguments(last: 0)
      }
    `,
    issue,
  )

  return <IssueTimelineInternalMultiple issue={data} commentSubjectAuthorLogin={data.author?.login} {...rest} />
}

function IssueTimelineInternalMultiple({issue, ...rest}: IssueTimelineInternalMultipleProps) {
  const {data, loadNext} = usePaginationFragment<TimelinePaginationQuery, IssueTimelineFrontPaginated$key>(
    graphql`
      fragment IssueTimelineFrontPaginated on Issue
      @argumentDefinitions(cursor: {type: "String"}, numberOfTimelineItems: {type: "Int"})
      @refetchable(queryName: "TimelinePaginationQuery") {
        frontTimeline: timelineItems(first: $numberOfTimelineItems, after: $cursor, visibleEventsOnly: true)
          @defer(label: "Issue_frontTimeline")
          @connection(key: "Issue_frontTimeline") {
          __id
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              ... on TimelineEvent {
                databaseId
              }
              __id
              __typename
            }
          }
          ...TimelineItemsPaginated
        }
        id
        url
      }
    `,
    issue,
  )

  const {data: backData, loadPrevious} = usePaginationFragment<
    TimelinePaginationBackQuery,
    IssueTimelineBackPaginated$key
  >(
    graphql`
      fragment IssueTimelineBackPaginated on Issue
      @argumentDefinitions(cursor: {type: "String"}, last: {type: "Int"})
      @refetchable(queryName: "TimelinePaginationBackQuery") {
        timelineItems(last: $last, before: $cursor, visibleEventsOnly: true)
          @defer(label: "Issue_backTimeline")
          @connection(key: "IssueBacksideTimeline_timelineItems") {
          __id
          totalCount
          pageInfo {
            hasPreviousPage
            startCursor
          }
          edges {
            node {
              ... on TimelineEvent {
                databaseId
              }
              __id
              __typename
            }
          }
          ...TimelineItemsPaginated
        }
        id
        url
      }
    `,
    issue,
  )

  // only raise on the browser since on the server it is expected to be null
  if (IS_BROWSER && data && !data.frontTimeline) {
    throw new Error('IssueTimelineFrontPaginated: data.frontTimeline is null')
  }

  if (!data || !data.frontTimeline || !backData || !backData.timelineItems) {
    return <IssueTimelineLoading delayedShow={true} />
  }

  const connections = [data.frontTimeline.__id, backData.timelineItems.__id]

  return (
    <IssueTimelineInternalFragment
      data={data}
      backData={backData}
      loadNext={loadNext}
      loadPrevious={loadPrevious}
      relayConnectionIds={connections}
      {...rest}
    />
  )
}

function IssueTimelineInternalFragment({
  data,
  backData,
  issueSecondary,
  viewer,
  loadNext,
  loadPrevious,
  onLinkClick,
  onCommentChange,
  onCommentEditCancel,
  onCommentReply,
  commentBoxConfig: commentBoxConfig,
  highlightedEventText,
  timelineEventBaseUrl,
  withLiveUpdates,
  navigate,
  relayConnectionIds,
  commentSubjectAuthorLogin,
}: IssueTimelineInternalFragmentProps) {
  const secondaryData = useFragment(
    graphql`
      fragment IssueTimelineSecondary on Issue {
        isTransferInProgress
      }
    `,
    issueSecondary,
  )

  const validTimelineItems = (data.frontTimeline?.edges || []).flatMap(a => (a && a.node ? [a.node] : []))
  const validBackTimelineItems = (backData.timelineItems?.edges || []).flatMap(a => (a && a.node ? [a.node] : []))
  // If the secondary data is not available, we default to false
  const isTransferInProgress = secondaryData?.isTransferInProgress ?? false
  const highlightedEvent = getHighlightedEvent(highlightedEventText)
  const highlightedEventId = highlightedEvent?.id
  const highlightedEventType = highlightedEvent?.prefix
  const backTimelineRef = useRef<HTMLDivElement>(null)
  const frontTimelineRef = useRef<HTMLDivElement>(null)
  const frontTimelineLastItemRef = useRef<HTMLDivElement | null>(null)
  const highlightedTimelineRef = useRef<HTMLDivElement | null>(null)

  const highlightedEventLoaded = [...validTimelineItems, ...validBackTimelineItems].some(item => {
    if (`${item.databaseId}` !== highlightedEventId) {
      return false
    }
    if (highlightedEventType === 'issuecomment') {
      return item.__typename === 'IssueComment'
    }
    return item.__typename !== 'IssueComment'
  })

  const highlightRef = useRef<null | HTMLDivElement>(null)
  const numberValidBackTimelineItems = validBackTimelineItems.length
  const numberValidTimelineItems = validTimelineItems.length

  const frontTimelineHasNext = data.frontTimeline.pageInfo.hasNextPage && data.frontTimeline.pageInfo.endCursor != null
  const backTimelineHasPrev =
    backData.timelineItems.pageInfo.hasPreviousPage && backData.timelineItems.pageInfo.startCursor != null
  const undisplayedItems = data.frontTimeline?.totalCount > numberValidTimelineItems + numberValidBackTimelineItems

  const hasMoreItems = (frontTimelineHasNext || backTimelineHasPrev) && undisplayedItems
  const [withoutCommentDivider, setWithoutCommentDivider] = useState<boolean>(hasMoreItems)
  const [initialBackFetchLoading, setInitialBackFetchLoading] = useState(false)
  const [foundHighlightedEvent, setFoundHighlightedEvent] = useState(true)

  const commentArgs = useMemo(
    () => ({
      viewer,
      onCommentReply,
      onLinkClick,
      commentBoxConfig,
      refAttribute: highlightRef,
      navigate,
      relayConnectionIds,
      commentSubjectAuthorLogin,
    }),
    [commentBoxConfig, commentSubjectAuthorLogin, navigate, onCommentReply, onLinkClick, relayConnectionIds, viewer],
  )

  const loadMoreTopFn = useCallback(
    (count: number, options?: {onComplete?: () => void}) => {
      const itemsLeft = data.frontTimeline?.totalCount - numberValidTimelineItems - numberValidBackTimelineItems
      const loadCount = Math.min(count, itemsLeft || 0)
      frontTimelineLastItemRef.current = frontTimelineRef?.current?.lastElementChild as HTMLDivElement
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
    [data.frontTimeline?.totalCount, loadNext, numberValidBackTimelineItems, numberValidTimelineItems],
  )

  const loadMoreBottomFn = useCallback(
    (count: number, options?: {onComplete?: () => void}) => {
      const itemsLeft = data.frontTimeline?.totalCount - numberValidTimelineItems - numberValidBackTimelineItems
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
    [data.frontTimeline?.totalCount, loadPrevious, numberValidBackTimelineItems, numberValidTimelineItems],
  )
  const showHighlightedTimeline =
    highlightedEventText && highlightedEventId && !highlightedEventLoaded && foundHighlightedEvent
  // If the highlighted event is in the front timeline, we need to load more items as usual
  const loadMoreInHighlightedTimeline = highlightedEventId && showHighlightedTimeline

  useScrollToHighlighted({data, highlightRef, highlightedEventId, showHighlightedTimeline, highlightedTimelineRef})

  useEffect(() => {
    if (!loadMoreInHighlightedTimeline && numberValidBackTimelineItems === 0) {
      setInitialBackFetchLoading(true)
    }
  }, [loadMoreInHighlightedTimeline, numberValidBackTimelineItems])

  useEffect(() => {
    // This is to prevent fetching data while the component is unmounting
    // causing backloading to fail on local development server
    if (initialBackFetchLoading) {
      loadMoreBottomFn(VALUES.timelineBackPageSize, {
        onComplete: () => {
          setInitialBackFetchLoading(false)
        },
      })
    }
  }, [initialBackFetchLoading, loadMoreBottomFn])

  useEffect(() => {
    setWithoutCommentDivider(hasMoreItems)
  }, [hasMoreItems])

  useEffect(() => {
    if (showHighlightedTimeline && validBackTimelineItems.length > 0) {
      setWithoutCommentDivider(false)
    }
  }, [showHighlightedTimeline, validBackTimelineItems.length])

  const timelineItemsProps: TimelineItemsProps = {
    issue: data.frontTimeline,
    onCommentChange,
    onCommentEditCancel,
    highlightedEvent,
    timelineEventBaseUrl,
    currentIssueId: data.id,
    issueUrl: data.url,
    type: 'front',
    ...commentArgs,
  }

  const showTimelineLoadMore = hasMoreItems && !showHighlightedTimeline
  const firstItemInBackTimelineIsComment = validBackTimelineItems[0]?.__typename === 'IssueComment'
  const lastItemInFrontTimelineIsComment =
    validTimelineItems[validTimelineItems.length - 1]?.__typename === 'IssueComment'

  const hideTopSeparatorInBackTimeline =
    showTimelineLoadMore || (!firstItemInBackTimelineIsComment && !lastItemInFrontTimelineIsComment)
  return (
    <>
      {/* 32 (VALUES.timelineAvatarSize) + 8 (ml:3) */}
      {isTransferInProgress && (
        <Flash
          aria-live="polite"
          variant="warning"
          sx={{
            mt: 3,
          }}
        >
          {MESSAGES.issueTimelineInTransfer}
        </Flash>
      )}
      <h2 className="sr-only">{LABELS.timeline.header}</h2>
      <TimelineItems {...timelineItemsProps} ref={frontTimelineRef} />
      {showTimelineLoadMore ? (
        <TimelineLoadMore
          loadMoreTopFn={loadMoreTopFn}
          loadMoreBottomFn={loadMoreBottomFn}
          numberOfTimelineItems={
            data.frontTimeline.totalCount - numberValidTimelineItems - numberValidBackTimelineItems
          }
          numberOfBackTimelineItems={numberValidBackTimelineItems}
          firstItemInBackTimelineIsComment={firstItemInBackTimelineIsComment}
          lastItemInFrontTimelineIsComment={lastItemInFrontTimelineIsComment}
          onLoadAllComplete={(isLoadMoreFromTop: boolean = false) => {
            // A timeout is needed to trigger the focusing asynchronously
            // so it doesn't happen before relay loads the timeline items
            setTimeout(() => {
              if (isLoadMoreFromTop && frontTimelineLastItemRef?.current) {
                const frontTimelineNewestItem = frontTimelineLastItemRef?.current.nextElementSibling as HTMLDivElement
                const focusableElement = getFocusableChild(frontTimelineNewestItem)
                focusableElement?.focus()
              } else {
                if (!backTimelineRef?.current) return
                const focusableElement = getFocusableChild(backTimelineRef.current)
                focusableElement?.focus()
              }
            }, 1)
          }}
          type={'front'}
        />
      ) : null}
      {showHighlightedTimeline && (
        <div data-testid={TEST_IDS.highlightedTimeline} ref={highlightedTimelineRef}>
          <Suspense fallback={<HighlightedTimelineLoading />}>
            <HighlightedTimeline
              beforeElementsLoadedCount={numberValidTimelineItems}
              afterElementsLoadedCount={numberValidBackTimelineItems}
              loadFromTopFn={loadNext}
              loadMoreBottomFn={loadPrevious}
              issueId={data.id}
              onCommentChange={onCommentChange}
              onCommentEditCancel={onCommentEditCancel}
              setWithoutCommentDivider={setWithoutCommentDivider}
              highlightedEventText={highlightedEventText}
              setFoundHighlightedEvent={setFoundHighlightedEvent}
              onLoadAllNewerItemsFocusRef={backTimelineRef}
              {...commentArgs}
            />
          </Suspense>
        </div>
      )}
      {initialBackFetchLoading && <CommentLoading />}
      <BackTimeline
        {...{
          ref: backTimelineRef,
          withLiveUpdates,
          withoutCommentDivider,
          backData,
          onCommentChange,
          onCommentEditCancel,
          highlightedEvent,
          timelineEventBaseUrl,
          issueUrl: data.url,
          hideTopSeparator: hideTopSeparatorInBackTimeline,
          ...commentArgs,
        }}
      />
    </>
  )
}

const BackTimeline = forwardRef<HTMLDivElement, BackTimelineProps>(
  (
    {
      backData,
      viewer,
      onLinkClick,
      onCommentReply,
      commentBoxConfig,
      onCommentChange,
      onCommentEditCancel,
      highlightedEvent,
      timelineEventBaseUrl,
      withLiveUpdates,
      navigate,
      relayConnectionIds,
      hideTopSeparator,
    },
    ref,
  ) => {
    // this is a feature flag value so it can be changed at runtime
    if (withLiveUpdates) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useIssueViewerSubscription(backData.id, backData.timelineItems.totalCount)
    }

    const commentArgs = {
      viewer,
      onLinkClick,
      onCommentReply,
      commentBoxConfig,
      navigate,
    }

    const timelineItemsProps: TimelineItemsProps = {
      issue: backData.timelineItems,
      onCommentChange,
      onCommentEditCancel,
      timelineEventBaseUrl,
      currentIssueId: backData.id,
      issueUrl: backData.url,
      type: 'back',
      relayConnectionIds,
      highlightedEvent,
      ...commentArgs,
    }

    return <TimelineItems ref={ref} {...timelineItemsProps} hideTopSeparator={hideTopSeparator} />
  },
)
BackTimeline.displayName = 'BackTimeline'
