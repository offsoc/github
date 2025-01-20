/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {HOTKEYS as ISSUES_HOTKEYS} from '@github-ui/issue-viewer/Hotkeys'

import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useKeyPress} from '@github-ui/use-key-press'
import {ActionList, Box, Text} from '@primer/react'
import React, {type FC, useEffect, useMemo, useState} from 'react'
import useInfiniteScroll from 'react-infinite-scroll-hook'
import {graphql, type LoadMoreFn, usePaginationFragment} from 'react-relay'

import PaginationLoading from '../../../utils/PaginationLoading'
import NoResults from '../../../utils/NoResults'
import {HOTKEYS} from '../../../notifications/constants/hotkeys'
import {LABELS} from '../../../notifications/constants/labels'
import {notificationUrl} from '../../../notifications/utils/urls'
import {VALUES} from '../../../constants'
import {useNotificationContext} from '../../contexts-v1/NotificationContext'
import {
  useAppNavigate,
  useMarkNotificationAsDone,
  useMarkNotificationAsRead,
  useMarkNotificationAsUnread,
  useNotificationsPrefetch,
  useNotificationUnsubscribe,
  useRouteInfo,
} from '../../hooks-v1'
import type {NotificationPosition, NotificationProps} from '../../../types/notification'
import {urlSuffix} from '../../../utils/urls'
import type {InboxList_v1_fragment$data, InboxList_v1_fragment$key} from './__generated__/InboxList_v1_fragment.graphql'
import type {
  InboxList_v1_threadFragment$data,
  InboxList_v1_threadFragment$key,
} from './__generated__/InboxList_v1_threadFragment.graphql'
import type {InboxListV1Query} from './__generated__/InboxListV1Query.graphql'
import type {InboxThreadListV1Query} from './__generated__/InboxThreadListV1Query.graphql'
import InboxZero from './InboxZero'
import type {InboxListRow_v1_fragment$key} from './row/__generated__/InboxListRow_v1_fragment.graphql'
import InboxListRow, {InboxListCompactRow} from './row/InboxListRow'

// Object containing notification navigation data
type NotificationUrls = {
  id: string
  item: ItemIdentifier
  url: string | null
  prevUrl?: string | null
  nextUrl?: string | null
}

// Tuple containing a Relay edge ID and node fragment
// used to map a paginated fragment list to components
type NotificationTuple = [string, InboxListRow_v1_fragment$key]

type NotificationSoftKeyboardHookProps = {
  notificationUrls: NotificationUrls[]
}

/// Hook to set up keyboard soft navigation listeners, i.e. selecting a row in a list
const useNotificationKeyboardSoftNavigation = ({notificationUrls}: NotificationSoftKeyboardHookProps) => {
  const {navigateToNotification} = useAppNavigate()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Soft-select the first element after any navigation
  const suffix = urlSuffix()
  useEffect(() => {
    setSelectedIndex(0)
  }, [suffix])

  const shouldNavigate = (target: EventTarget | null): boolean => !focusedOnInput(target)

  // Soft navigation callback
  const navigateTo = (e: KeyboardEvent, index: number) => {
    if (!shouldNavigate(e.target)) {
      return
    }
    if (index < 0 || index >= notificationUrls.length) {
      return
    }
    e.preventDefault()
    setSelectedIndex(index)
  }

  // Directed soft navigation listeners
  const softNavigateNext = (e: KeyboardEvent) => navigateTo(e, selectedIndex + 1)
  const softNavigatePrev = (e: KeyboardEvent) => navigateTo(e, selectedIndex - 1)

  // Commit navigation listener
  const navigateToSelected = (e: KeyboardEvent) => {
    if (!shouldNavigate(e.target)) {
      return
    }
    e.preventDefault()
    const {id} = notificationUrls[selectedIndex]!
    id && navigateToNotification(id)
  }

  // Keyboard bindings
  useKeyPress([ISSUES_HOTKEYS.navigateToPrevIssue, ISSUES_HOTKEYS.down], softNavigateNext)
  useKeyPress([ISSUES_HOTKEYS.navigateToNextIssue, ISSUES_HOTKEYS.up], softNavigatePrev)
  useKeyPress([ISSUES_HOTKEYS.navigateToSelectedIssue], navigateToSelected)

  // Return selected index to callsite
  return {
    selectedIndex,
  }
}

const focusedOnInput = (target: EventTarget | null) => {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLAnchorElement ||
    target instanceof HTMLLinkElement ||
    target instanceof HTMLButtonElement
  )
}

// @deprecated
// This fragement will eventually be removed in favor of notificationListFragment.
// This exists to support a controlled rollout of the new notifications field on the user object.
// Once we have confidence that the new field is working as expected, we can remove this fragment.
const notificationThreadListFragment = graphql`
  fragment InboxList_v1_threadFragment on User
  # The @refetchable decorator manages pagination and 'cursor' argument for us
  @refetchable(queryName: "InboxThreadListV1Query")
  @argumentDefinitions(cursor: {type: "String", defaultValue: null}, query: {type: "String!"}, first: {type: "Int"}) {
    notificationThreads(query: $query, first: $first, after: $cursor)
      @connection(key: "InboxSearch_notificationThreads") {
      totalCount
      edges {
        cursor
        node {
          isDone
          ...InboxListRow_v1_fragment

          # Pull out some fields to enable next/prev navigation
          id
          isUnread
          url
          subject {
            __typename
            ... on Issue {
              id
              number
            }
            ... on Discussion {
              id
              number
            }
            ... on PullRequest {
              id
              number
            }
            ... on Commit {
              id
            }
            ... on TeamDiscussion {
              id
            }
          }
          list {
            __typename
            ... on Repository {
              name
              owner {
                login
              }
            }
            ... on Team {
              name
              slug
              organization {
                login
              }
            }
            ... on User {
              login
            }
            ... on Organization {
              login
            }
            ... on Enterprise {
              slug
            }
          }
        }
      }
    }
  }
`

/// Fragment to list notification threads
const notificationListFragment = graphql`
  fragment InboxList_v1_fragment on User
  # The @refetchable decorator manages pagination and 'cursor' argument for us
  @refetchable(queryName: "InboxListV1Query")
  @argumentDefinitions(cursor: {type: "String", defaultValue: null}, query: {type: "String!"}, first: {type: "Int"}) {
    notifications(query: $query, first: $first, after: $cursor) @connection(key: "InboxSearch_notifications") {
      totalCount
      edges {
        cursor
        node {
          isDone
          ...InboxListRow_v1_fragment

          # Pull out some fields to enable next/prev navigation
          id
          isUnread
          url
          subject {
            __typename
            ... on Issue {
              id
              number
            }
            ... on Discussion {
              id
              number
            }
            ... on PullRequest {
              id
              number
            }
            ... on Commit {
              id
            }
            ... on TeamDiscussion {
              id
            }
          }
          list {
            __typename
            ... on Repository {
              name
              owner {
                login
              }
            }
            ... on Team {
              name
              slug
              organization {
                login
              }
            }
            ... on User {
              login
            }
            ... on Organization {
              login
            }
            ... on Enterprise {
              slug
            }
          }
        }
      }
    }
  }
`

type NotificationHookProps = [
  NotificationTuple[],
  NotificationUrls[],
  {[key: string]: NotificationPosition},
  number,
  LoadMoreFn<InboxListV1Query>,
  boolean,
  boolean,
  Array<string | null>,
]

const useNotifications = (
  fragment: InboxList_v1_fragment$key | InboxList_v1_threadFragment$key,
): NotificationHookProps => {
  const newGraphqlField = useFeatureFlag('issues_react_notification_new_graghql_field')

  const {data, loadNext, hasNext, isLoadingNext} = usePaginationFragment<
    InboxListV1Query | InboxThreadListV1Query,
    InboxList_v1_fragment$key | InboxList_v1_threadFragment$key
  >(newGraphqlField ? notificationListFragment : notificationThreadListFragment, fragment)

  const {edges, totalCount} = newGraphqlField
    ? (data as InboxList_v1_fragment$data).notifications
    : (data as InboxList_v1_threadFragment$data).notificationThreads

  // Filter out null nodes and make sure we have a cursor for each node
  // We store the cursor together with the node for easier iteration later
  const notificationThreads = useMemo(
    function filterNullNodes() {
      return edges
        ? edges
            // We are unsure how we will handle done notifications.
            // For now we manually POST filter done notifications until we have a better solution in place.
            // This will result in the list being shorter than the expected page count until the user refreshed the page.
            // This is an accepted tradeoff for now.
            .filter(edge => edge?.node?.isDone === false)
            .map(edge => (edge ? [edge.cursor, edge.node] : null))
            .filter(node => (node ? true : false))
        : []
    },
    [edges],
  )

  const notificationSubjectIds = useMemo(
    function mapNotificationSubjectIds() {
      return edges
        ? edges
            .filter(edge => edge?.node?.isDone === false)
            .map(edge => {
              if (!edge || !edge.node) return null
              const {__typename} = edge.node.subject
              let subjectId = null
              switch (__typename) {
                case 'Issue':
                case 'Discussion':
                case 'PullRequest':
                case 'Commit':
                case 'TeamDiscussion':
                  subjectId = (edge.node.subject as {id: string}).id ?? null
                  break
                default:
                  subjectId = null
              }
              return subjectId
            })
        : []
    },
    [edges],
  )

  // Map thread tuples to simple objects for easier iteration
  const notifications = useMemo<NotificationProps[]>(
    function mapNotificationList() {
      return notificationThreads
        .map(element => {
          if (!element) return null
          const [, node] = element
          if (!node) return null
          if (typeof node !== 'object') return null
          return node
        })
        .filter(node => (node ? true : false)) as unknown as NotificationProps[]
    },
    [notificationThreads],
  )

  const notificationNeighbours = useMemo(
    function getNeighbours() {
      return notifications.reduce(
        (acc, thread, index) => {
          const {id} = thread

          const nextIndex = index + 1
          const prevIndex = index - 1

          const isFirst = index <= 0
          const isLast = nextIndex >= notifications.length

          const nextThread = !isLast ? notifications[nextIndex]! : null
          const prevThread = !isFirst ? notifications[prevIndex]! : null

          const res = {
            isFirst,
            isLast,
            next: nextThread,
            previous: prevThread,
          } satisfies NotificationPosition
          const result = {...acc, [id]: res}
          return result
        },
        {} as Record<string, NotificationPosition>,
      )
    },
    [notifications],
  )

  // Pull out fragment data for easier access
  const notificationUrls = useMemo(
    () =>
      notifications.map(notification => {
        const {id, subject, list} = notification
        const {previous, next} = notificationNeighbours[id]!
        const url = notificationUrl(notification.id)
        const {__typename} = list
        let owner
        if (__typename === 'Repository') {
          owner = list.owner.login
        } else if (__typename === 'Team') {
          owner = list.organization.login
        } else if (__typename === 'Business') {
          owner = list.slug
        } else {
          owner = list.login
        }
        const item = {
          owner,
          repo: list.name,
          number: subject.number,
          type: subject.__typename,
        } as ItemIdentifier
        return {id, item, url, prevUrl: previous?.url, nextUrl: next?.url}
      }),
    [notifications, notificationNeighbours],
  )

  const {setNeighbours} = useNotificationContext()
  useEffect(() => {
    setNeighbours && setNeighbours(notificationNeighbours)
  }, [notificationNeighbours, setNeighbours])

  return [
    (notificationThreads ?? []) as NotificationTuple[],
    notificationUrls ?? [],
    notificationNeighbours,
    totalCount,
    loadNext,
    hasNext,
    isLoadingNext,
    notificationSubjectIds,
  ]
}

type NotificationListProps = {
  queryReference: InboxList_v1_fragment$key | InboxList_v1_threadFragment$key
  query?: string
}

const InboxList: FC<NotificationListProps> = ({queryReference, query}) => {
  const [
    notificationThreads,
    notificationUrls,

    _notificationNeighbours,
    totalCount,
    loadNext,
    hasNext,
    isLoadingNext,
    subjectIds,
  ] = useNotifications(queryReference)

  const [sentryRef] = useInfiniteScroll({
    loading: isLoadingNext,
    hasNextPage: hasNext,
    onLoadMore: () => loadNext(VALUES.issuesPageSize),
    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: '0px 0px 400px 0px',
  })

  // Keyboard navigation
  const {selectedIndex} = useNotificationKeyboardSoftNavigation({notificationUrls})

  // Get selected IDs
  const notificationId = useMemo(
    () => (notificationUrls.length > 0 ? notificationUrls[selectedIndex]!.id : null),
    [notificationUrls, selectedIndex],
  )
  const subscribableId = useMemo(() => subjectIds[selectedIndex], [subjectIds, selectedIndex])

  const markAsReadCallback = useMarkNotificationAsRead(notificationId)
  const markAsUnreadCallback = useMarkNotificationAsUnread(notificationId)
  const markAsDoneCallback = useMarkNotificationAsDone(notificationId)
  const unsubscribeCallback = useNotificationUnsubscribe(subscribableId, markAsDoneCallback)

  // Keyboard action bindings
  useKeyPress([HOTKEYS.markAsRead], markAsReadCallback)
  useKeyPress([HOTKEYS.markAsUnread], markAsUnreadCallback)
  useKeyPress([HOTKEYS.markAsDone], markAsDoneCallback)
  useKeyPress([HOTKEYS.unsubscribe], unsubscribeCallback)

  return (
    <>
      <Box sx={{border: '1px solid', borderColor: 'border.muted', borderRadius: 2}} data-testid="notification-list">
        <Box
          sx={{
            pl: 3,
            pr: 1,
            py: 1,
            backgroundColor: 'canvas.subtle',
            borderTopRightRadius: 2,
            borderTopLeftRadius: 2,
            borderBottom: '1px solid',
            borderBottomColor: 'border.muted',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text sx={{py: 1}}>
            {LABELS.numberOfNotifications(notificationThreads.length)}
            {notificationThreads.length > 0 && <>&nbsp;out of {totalCount.toLocaleString()}</>}
          </Text>
        </Box>
        {notificationThreads.length > 0 ? (
          // Data is available
          <ActionList showDividers>
            {notificationThreads.map(([cursor, thread], index) => (
              <React.Fragment key={`thread-${cursor}`}>
                <InboxListRow {...thread} isSelected={index === selectedIndex} />
              </React.Fragment>
            ))}
            {hasNext && (
              <>
                <div aria-hidden="true" ref={sentryRef} />
                <PaginationLoading />
              </>
            )}
          </ActionList>
        ) : query ? (
          // Search result is empty
          <NoResults showSsoDropdown={false} />
        ) : (
          // User has no notifications
          <InboxZero />
        )}
      </Box>
    </>
  )
}

const InboxCompactList: FC<NotificationListProps> = ({queryReference, query}) => {
  const [
    notificationThreads,
    _notificationUrls,
    notificationNeighbours,
    _totalCount,
    loadNext,
    hasNext,
    isLoadingNext,
  ] = useNotifications(queryReference)

  const [sentryRef] = useInfiniteScroll({
    loading: isLoadingNext,
    hasNextPage: hasNext,
    onLoadMore: () => loadNext(VALUES.issuesPageSize),
    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: '0px 0px 400px 0px',
  })

  // Prefetch sibling notifications using the notification ID
  const {notificationId} = useRouteInfo()
  const prevItem = notificationId ? notificationNeighbours[notificationId]?.previous : null
  const nextItem = notificationId ? notificationNeighbours[notificationId]?.next : null
  useNotificationsPrefetch(notificationId, prevItem!, nextItem!)

  return notificationThreads.length > 0 ? (
    <>
      <ActionList showDividers>
        {notificationThreads.map(([cursor, thread]) => (
          <React.Fragment key={`thread-${cursor}`}>
            <InboxListCompactRow {...thread} />
          </React.Fragment>
        ))}
        {hasNext && (
          <>
            <div aria-hidden="true" ref={sentryRef} />
            <PaginationLoading />
          </>
        )}
      </ActionList>
    </>
  ) : query ? (
    // Search result is empty
    <NoResults />
  ) : (
    // User has no notifications
    <InboxZero />
  )
}

export default InboxList
export {InboxCompactList}
