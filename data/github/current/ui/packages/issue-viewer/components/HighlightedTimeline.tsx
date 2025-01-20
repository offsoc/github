import {useState, useRef, useEffect, useCallback, useMemo, type MutableRefObject} from 'react'
import {graphql, useLazyLoadQuery, usePaginationFragment} from 'react-relay'
import {CommentLoading} from '@github-ui/commenting/CommentLoading'
import type {HighlightedTimelineQuery} from './__generated__/HighlightedTimelineQuery.graphql'
import type {TimelinePaginationBackwardQuery} from './__generated__/TimelinePaginationBackwardQuery.graphql'
import type {HighlightedTimelineBackwardPaginated$key} from './__generated__/HighlightedTimelineBackwardPaginated.graphql'
import type {TimelineBaseProps, TimelineItemsProps} from './TimelineItems'
import {TimelineItems} from './TimelineItems'
import {TimelineLoadMore} from '@github-ui/timeline-items/TimelineLoadMore'
import type {HighlightedEvent} from '@github-ui/timeline-items/HighlightedEvent'
import {VALUES} from '../constants/values'
import {HighlightedTimelineLoading} from './HighlightedTimelineLoading'
// Using getFocusableChild for a callback after client side loading, won't affect SSR
// eslint-disable-next-line no-restricted-imports
import {getFocusableChild} from '@primer/behaviors/utils'
import {useScrollToHighlighted} from '../hooks/use-scroll-to-highlighted'

type HighlightedTimelineBaseProps = {
  loadFromTopFn: (
    count: number,
    options?: {
      onComplete?: () => void
    },
  ) => void
  loadMoreBottomFn: (
    count: number,
    options?: {
      onComplete?: () => void
    },
  ) => void
  timelineEventBaseUrl?: string
  setWithoutCommentDivider: (value: boolean) => void
  setFoundHighlightedEvent: (value: boolean) => void
  /**
   * Container ref for what to focus when loading all newer items
   */
  onLoadAllNewerItemsFocusRef: MutableRefObject<HTMLElement | null>
} & TimelineBaseProps

type HighlightedTimelineProps = {
  highlightedEventText: string
  beforeElementsLoadedCount: number
  afterElementsLoadedCount: number
  issueId: string
} & HighlightedTimelineBaseProps

type HighlightedTimelineInternalProps = {
  highlightedEvent: HighlightedEvent
  initialBeforeCount: number
  initialAfterCount: number
  issue: HighlightedTimelineBackwardPaginated$key
} & HighlightedTimelineBaseProps

export function HighlightedTimeline({
  issueId,
  highlightedEventText,
  beforeElementsLoadedCount,
  afterElementsLoadedCount,
  ...rest
}: HighlightedTimelineProps) {
  const data = useLazyLoadQuery<HighlightedTimelineQuery>(
    graphql`
      query HighlightedTimelineQuery(
        $id: ID!
        $focusText: String!
        $after: String
        $before: String
        $first: Int!
        $last: Int
      ) {
        node(id: $id) {
          ... on Issue {
            ...HighlightedTimelineBackwardPaginated
              @arguments(after: $after, first: $first, focusText: $focusText, last: $last, before: $before)
            timelineCounts: timelineItems(first: 1, focusText: $focusText, visibleEventsOnly: true) {
              afterFocusCount
              beforeFocusCount
            }
          }
        }
      }
    `,
    {id: issueId, focusText: highlightedEventText, first: 1},
    {fetchPolicy: 'store-or-network'},
  )
  if (!data.node || !data.node.timelineCounts) return null
  const highlightedEventPrefix = highlightedEventText.split('-')[0]!
  const highlightedEventId = highlightedEventText.split('-')[1]!
  const highlightedEvent = {id: highlightedEventId, prefix: highlightedEventPrefix}
  const initialBeforeCount = Math.max(data.node.timelineCounts.beforeFocusCount - beforeElementsLoadedCount, 0)
  const initialAfterCount = Math.max(data.node.timelineCounts.afterFocusCount - afterElementsLoadedCount, 0)
  return (
    <HighlightedTimelineInternal
      issue={data.node}
      highlightedEvent={highlightedEvent}
      {...rest}
      initialBeforeCount={initialBeforeCount}
      initialAfterCount={initialAfterCount}
    />
  )
}

function HighlightedTimelineInternal({
  issue,
  viewer,
  onLinkClick,
  commentBoxConfig: commentBoxConfig,
  onCommentChange,
  onCommentEditCancel,
  onCommentReply,
  highlightedEvent,
  timelineEventBaseUrl,
  loadFromTopFn,
  loadMoreBottomFn,
  initialBeforeCount,
  initialAfterCount,
  setWithoutCommentDivider,
  navigate,
  setFoundHighlightedEvent,
  onLoadAllNewerItemsFocusRef,
}: HighlightedTimelineInternalProps) {
  const [beforeCount, setBeforeCount] = useState(initialBeforeCount)
  const [afterCount, setAfterCount] = useState(initialAfterCount)
  const [beforeHighlightedItemLoaded, setBeforeHighlightedItemLoaded] = useState(false)
  const [afterHighlightedItemLoaded, setAfterHighlightedItemLoaded] = useState(false)
  const [initialBackFetchTriggered, setInitialBackFetchTriggered] = useState(false)
  const [initialBackFetchLoading, setInitialBackFetchLoading] = useState(false)
  const highlightedTimelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => setWithoutCommentDivider(afterCount > 0), [afterCount, setWithoutCommentDivider])

  const {data, loadNext, loadPrevious} = usePaginationFragment<
    TimelinePaginationBackwardQuery,
    HighlightedTimelineBackwardPaginated$key
  >(
    graphql`
      fragment HighlightedTimelineBackwardPaginated on Issue
      @argumentDefinitions(
        after: {type: "String"}
        first: {type: "Int"}
        before: {type: "String"}
        last: {type: "Int"}
        focusText: {type: "String"}
      )
      @refetchable(queryName: "TimelinePaginationBackwardQuery") {
        timelineItems(
          first: $first
          after: $after
          before: $before
          last: $last
          focusText: $focusText
          visibleEventsOnly: true
        ) @connection(key: "timelineBackwards_timelineItems", filters: []) {
          __id
          edges {
            node {
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
  useEffect(() => {
    // This means that the highlighted event is not in the timeline
    // In this case we signal back to the parent component that it shouldn't show the higlighted timeline
    if (data?.timelineItems?.edges?.length === 0) {
      setFoundHighlightedEvent(false)
    }
  }, [data?.timelineItems?.edges?.length, setFoundHighlightedEvent])

  const loadBeforeHighlighted = useCallback(
    (count: number, options?: {onComplete?: () => void}) => {
      const loadCnt = Math.min(beforeCount, count)
      if (loadCnt === 0) {
        options?.onComplete?.()
        return
      }
      loadPrevious(loadCnt, {
        onComplete: () => {
          setBeforeCount(beforeCount - loadCnt)
          options?.onComplete?.()
        },
      })
    },
    [beforeCount, loadPrevious],
  )

  const loadAfterTimeline = useCallback(
    (count: number, options?: {onComplete?: () => void}) => {
      const loadCnt = Math.min(beforeCount, count)
      if (loadCnt === 0) {
        options?.onComplete?.()
        return
      }
      loadFromTopFn(loadCnt, {
        onComplete: () => {
          setBeforeCount(beforeCount - loadCnt)
          options?.onComplete?.()
        },
      })
    },
    [beforeCount, loadFromTopFn],
  )

  const loadAfterHighlighted = useCallback(
    (count: number, options?: {onComplete?: () => void}) => {
      const loadCnt = Math.min(afterCount, count)
      if (loadCnt === 0) {
        options?.onComplete?.()
        return
      }
      loadNext(loadCnt, {
        onComplete: () => {
          setAfterCount(afterCount - loadCnt)
          options?.onComplete?.()
        },
      })
    },
    [afterCount, loadNext],
  )

  const loadFromEndOfTimeline = useCallback(
    (count: number, options?: {onComplete?: () => void}) => {
      const loadCnt = Math.min(afterCount, count)
      if (loadCnt === 0) {
        options?.onComplete?.()
        return
      }
      loadMoreBottomFn(loadCnt, {
        onComplete: () => {
          setAfterCount(afterCount - loadCnt)
          setWithoutCommentDivider(afterCount > 0)

          options?.onComplete?.()
        },
      })
    },
    [afterCount, loadMoreBottomFn, setWithoutCommentDivider],
  )

  const highlightRef = useRef<null | HTMLDivElement>(null)
  const beforeAndAfterHighlightedItemLoaded = beforeHighlightedItemLoaded && afterHighlightedItemLoaded

  useScrollToHighlighted({
    data,
    highlightRef,
    highlightedEventId: highlightedEvent.id,
    showHighlightedTimeline: true,
    beforeAndAfterHighlightedItemLoaded,
  })

  const commentArgs = useMemo(
    () => ({
      viewer,
      onLinkClick,
      navigate,
      commentBoxConfig,
      refAttribute: highlightRef,
      relayConnectionIds: [data.timelineItems.__id],
    }),
    [data.timelineItems.__id, commentBoxConfig, navigate, onLinkClick, viewer],
  )

  useEffect(() => {
    if (!initialBackFetchTriggered && afterHighlightedItemLoaded && afterHighlightedItemLoaded) {
      setInitialBackFetchTriggered(true)
      setInitialBackFetchLoading(true)
      loadFromEndOfTimeline(VALUES.timelineBackPageSize, {
        onComplete: () => {
          setInitialBackFetchLoading(false)
        },
      })
    }
  }, [afterHighlightedItemLoaded, initialBackFetchTriggered, loadFromEndOfTimeline])

  // Initial load of surrounding nodes of the highlighted event
  useEffect(() => {
    setBeforeHighlightedItemLoaded(false)
    setAfterHighlightedItemLoaded(false)

    const toLoadBeforeCount = Math.min(initialBeforeCount, VALUES.loadAroundHighlightedPageSize)
    if (toLoadBeforeCount > 0) {
      loadPrevious(toLoadBeforeCount, {
        onComplete: () => {
          setBeforeCount(initialBeforeCount - toLoadBeforeCount)
          setBeforeHighlightedItemLoaded(true)
        },
      })
    } else {
      setBeforeHighlightedItemLoaded(true)
    }

    const toLoadAfterCount = Math.min(initialAfterCount, VALUES.loadAroundHighlightedPageSize)
    if (toLoadAfterCount > 0) {
      loadNext(toLoadAfterCount, {
        onComplete: () => {
          setAfterCount(initialAfterCount - toLoadAfterCount)
          setAfterHighlightedItemLoaded(true)
        },
      })
    } else {
      setAfterHighlightedItemLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedEvent.id])

  if (!afterHighlightedItemLoaded && !beforeHighlightedItemLoaded) {
    return <HighlightedTimelineLoading />
  }

  const timelineItemsProps: TimelineItemsProps = {
    issue: data.timelineItems,
    onCommentChange,
    onCommentEditCancel,
    onCommentReply,
    highlightedEvent,
    timelineEventBaseUrl,
    currentIssueId: data.id,
    issueUrl: data.url,
    type: 'highlighted',
    ...commentArgs,
  }

  const focusInnerElement = (containerRef: MutableRefObject<HTMLElement | null>) => {
    // A timeout is needed to trigger the focusing asynchronously
    // so it doesn't happen before relay loads the timeline items
    setTimeout(() => {
      if (!containerRef?.current) return

      const focusableElement = getFocusableChild(containerRef.current)
      focusableElement?.focus()
    }, 1)
  }

  return (
    <>
      {beforeCount > 0 && (
        <TimelineLoadMore
          loadMoreTopFn={loadAfterTimeline}
          loadMoreBottomFn={loadBeforeHighlighted}
          numberOfTimelineItems={beforeCount}
          onLoadAllComplete={() => focusInnerElement(highlightedTimelineRef)}
          type={'highlighted-before'}
        />
      )}
      <TimelineItems ref={highlightedTimelineRef} {...timelineItemsProps} />
      {afterCount > 0 && (
        <TimelineLoadMore
          loadMoreTopFn={loadAfterHighlighted}
          loadMoreBottomFn={loadFromEndOfTimeline}
          numberOfTimelineItems={afterCount}
          onLoadAllComplete={() => focusInnerElement(onLoadAllNewerItemsFocusRef)}
          type={'highlighted-after'}
        />
      )}
      {initialBackFetchLoading && <CommentLoading />}
    </>
  )
}
