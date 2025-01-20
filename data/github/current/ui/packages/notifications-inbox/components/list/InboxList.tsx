/* eslint eslint-comments/no-use: off */

import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {HOTKEYS as ISSUES_HOTKEYS} from '@github-ui/issue-viewer/Hotkeys'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useKeyPress} from '@github-ui/use-key-press'
import {ActionMenu, ActionList, Box, Button, IconButton, Pagination} from '@primer/react'
import {
  type Icon,
  BellIcon,
  BellSlashIcon,
  CheckCircleIcon,
  CheckIcon,
  KebabHorizontalIcon,
  ReadIcon,
} from '@primer/octicons-react'
import {type FC, Fragment, useEffect, useMemo, useState, useCallback, useRef} from 'react'
import {graphql, type LoadMoreFn, usePaginationFragment} from 'react-relay'
import type {RecordSourceSelectorProxy} from 'relay-runtime'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'

import NoResults from '../../utils/NoResults'
import {HOTKEYS} from '../../notifications/constants/hotkeys'
import {notificationUrl} from '../../notifications/utils/urls'
import {VALUES} from '../../constants'
import {useNotificationContext} from '../../contexts/NotificationContext'
import {usePaginationContext} from '../../contexts/PaginationContext'
import {
  useAppNavigate,
  useMarkNotificationAsDone,
  useMarkNotificationAsRead,
  useMarkNotificationsAsRead,
  useMarkNotificationsAsUnread,
  useMarkNotificationAsUnread,
  useMarkNotificationsAsDone,
  useMarkAllNotifications,
  useNotificationsPrefetch,
  useNotificationUnsubscribe,
  useNotificationsUnsubscribe,
  useRouteInfo,
} from '../../hooks'
import type {NotificationPosition, NotificationProps} from '../../types/notification'
import {urlSuffix} from '../../utils/urls'
import type {InboxList_fragment$data, InboxList_fragment$key} from './__generated__/InboxList_fragment.graphql'
import type {
  InboxList_threadFragment$data,
  InboxList_threadFragment$key,
} from './__generated__/InboxList_threadFragment.graphql'
import type {InboxListQuery} from './__generated__/InboxListQuery.graphql'
import type {InboxThreadListQuery} from './__generated__/InboxThreadListQuery.graphql'
import InboxZero from './InboxZero'
import type {InboxListRow_fragment$key} from './row/__generated__/InboxListRow_fragment.graphql'
import InboxListRow, {InboxListCompactRow} from './row/InboxListRow'
import MarkAsReadIcon from '../../notifications/components/MarkAsReadIcon'
import MarkAsUnreadIcon from '../../notifications/components/MarkAsUnreadIcon'
import {useRepositoryGroupContext} from '../../contexts'

// Object containing notification navigation data
type NotificationUrls = {
  id: string
  item: ItemIdentifier
  url: string | null
  prevUrl?: string | null
  nextUrl?: string | null
}

// Tuple containing a Relay edge ID, node fragment
// and  the notification ID
// used to map a paginated fragment list to components
type NotificationLocationAndData = {cursor: string; thread: InboxListRow_fragment$key; subjectId: string; id: string}

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
  fragment InboxList_threadFragment on User
  # The @refetchable decorator manages pagination and 'cursor' argument for us
  @refetchable(queryName: "InboxThreadListQuery")
  @argumentDefinitions(cursor: {type: "String", defaultValue: null}, query: {type: "String!"}, first: {type: "Int"}) {
    notificationThreads(query: $query, first: $first, after: $cursor)
      @connection(key: "InboxSearch_notificationThreads") {
      totalCount
      edges {
        cursor
        node {
          isDone
          ...InboxListRow_fragment

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
  fragment InboxList_fragment on User
  # The @refetchable decorator manages pagination and 'cursor' argument for us
  @refetchable(queryName: "InboxListQuery")
  @argumentDefinitions(cursor: {type: "String", defaultValue: null}, query: {type: "String!"}, first: {type: "Int"}) {
    notifications(query: $query, first: $first, after: $cursor) @connection(key: "InboxSearch_notifications") {
      totalCount
      edges {
        cursor
        node {
          isDone
          ...InboxListRow_fragment

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

type NotificationHookProps = {
  notificationThreads: NotificationLocationAndData[]
  notificationUrls: NotificationUrls[]
  notificationNeighbours: {[key: string]: NotificationPosition}
  totalCount: number
  loadNext: LoadMoreFn<InboxListQuery>
  hasNext: boolean
  isLoadingNext: boolean
  subjectIds: Array<string | null>
}

const useNotifications = (fragment: InboxList_fragment$key | InboxList_threadFragment$key): NotificationHookProps => {
  const newGraphqlField = useFeatureFlag('issues_react_notification_new_graghql_field')

  const {data, loadNext, hasNext, isLoadingNext} = usePaginationFragment<
    InboxListQuery | InboxThreadListQuery,
    InboxList_fragment$key | InboxList_threadFragment$key
  >(newGraphqlField ? notificationListFragment : notificationThreadListFragment, fragment)

  const {edges, totalCount} = newGraphqlField
    ? (data as InboxList_fragment$data).notifications
    : (data as InboxList_threadFragment$data).notificationThreads

  const subjectIdByType = useCallback(function getSubjectId(subject: {__typename: string; id?: string}) {
    let subjectId = null
    switch (subject.__typename) {
      case 'Issue':
      case 'Discussion':
      case 'PullRequest':
      case 'Commit':
      case 'TeamDiscussion':
        subjectId = (subject as {id: string}).id ?? null
        break
      default:
        subjectId = null
    }
    return subjectId || ''
  }, [])

  // Filter out null nodes and make sure we have a cursor for each node
  // We store the cursor together with the node for easier iteration later
  // We are also (hopefully temporarily) storing the ID of each notification.
  const notificationThreads = useMemo(
    function filterNullNodes() {
      if (!edges) return []
      return edges.reduce((accumulator, currentEdge) => {
        if (!currentEdge?.node || currentEdge.node.isDone === true) {
          return accumulator
        }

        accumulator.push({
          cursor: currentEdge.cursor,
          thread: currentEdge.node,
          subjectId: subjectIdByType(currentEdge.node.subject),
          id: currentEdge.node.id,
        })
        return accumulator
      }, [] as NotificationLocationAndData[])
    },
    [edges, subjectIdByType],
  )

  const subjectIds = useMemo(
    function mapNotificationSubjectIds() {
      if (!edges) return []
      return edges
        .filter(edge => edge?.node?.isDone === false)
        .map(edge => {
          if (!edge || !edge.node) return null
          return subjectIdByType(edge.node.subject)
        })
    },
    [edges, subjectIdByType],
  )

  // Map thread tuples to simple objects for easier iteration
  const notifications = useMemo<NotificationProps[]>(
    function mapNotificationList() {
      return notificationThreads.map(element => element.thread) as unknown as NotificationProps[]
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

  return {
    notificationThreads,
    notificationUrls,
    notificationNeighbours,
    totalCount,
    loadNext,
    hasNext,
    isLoadingNext,
    subjectIds,
  }
}

/**
 * @argument queryReference - The Relay query reference to use
 * @argument hasSearchQuery - Whether or not the list is using a search query,
 * this controls which empty state is shown -- Inbox Zero or no results found
 */
type NotificationListProps = {
  queryReference: InboxList_fragment$key | InboxList_threadFragment$key
  hasSearchQuery?: boolean
}

const InboxList: FC<NotificationListProps> = ({queryReference, hasSearchQuery = false}) => {
  const grouping = useRepositoryGroupContext()
  const groupingFlagEnabled = useFeatureFlag('inbox_grouping_feature')
  const {notificationThreads, notificationUrls, totalCount, loadNext, isLoadingNext, subjectIds} =
    useNotifications(queryReference)

  // Define page size based on whether grouping is enabled or not
  const expectedNotificationLength = useMemo(
    () => (grouping.isGrouped ? VALUES.issuesGroupByPageSize : VALUES.issuesPageSize),
    [grouping.isGrouped],
  )

  // Rows selection list per page
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set<string>())
  const [totalNotifications, setTotalNotifications] = useState<number>(totalCount)

  // Pagination
  const {currentPage, setCurrentPage, selectedNotificationIds, setSelectedNotificationIds} = usePaginationContext()
  const paginationLoadingRef = useRef<HTMLDivElement>(null)
  const totalPages = useMemo(
    () => Math.floor((notificationThreads.length - 1) / expectedNotificationLength) + 1,
    [expectedNotificationLength, notificationThreads],
  )

  // Keyboard navigation
  const {selectedIndex} = useNotificationKeyboardSoftNavigation({notificationUrls})

  // Get selected IDs
  const notificationId = useMemo(
    () => (notificationUrls.length > 0 ? notificationUrls[selectedIndex]!.id : null),
    [notificationUrls, selectedIndex],
  )
  const subscribableId = useMemo(() => subjectIds[selectedIndex], [subjectIds, selectedIndex])

  const selectedSubjectIds = useMemo(() => {
    const subjectRowsIds = notificationThreads
      .map(({id, subjectId}) => {
        if (selectedRows.has(id)) {
          return subjectId
        }
      })
      .filter(item => item) as unknown as Set<string>

    return new Set<string>(subjectRowsIds)
  }, [notificationThreads, selectedRows])

  const notificationsPerPage = useMemo(
    () =>
      notificationThreads?.slice(
        (currentPage - 1) * expectedNotificationLength,
        currentPage * expectedNotificationLength,
      ),
    [currentPage, expectedNotificationLength, notificationThreads],
  )

  const anyNotificationsPerPageSelected = useMemo(
    () => notificationsPerPage?.some(({id}) => selectedRows.has(id)),
    [notificationsPerPage, selectedRows],
  )

  const reloadDataPage = useCallback(
    (itemsUpdated: Set<string>) => {
      setTotalNotifications(totalNotifications - itemsUpdated.size)
      // If we are on the last page and we have removed all items, go back one page
      if (currentPage === totalPages && notificationsPerPage.length === itemsUpdated.size) {
        setCurrentPage(currentPage - 1)
      }
    },
    [currentPage, notificationsPerPage.length, setCurrentPage, totalNotifications, totalPages],
  )

  const unreadNotifications = useMemo(() => {
    return notificationThreads.some(({thread}) => {
      const {isUnread} = thread as unknown as {isUnread: boolean}
      return isUnread === true
    })
  }, [notificationThreads])

  const updateNotificationsUnread = useCallback(
    (store: RecordSourceSelectorProxy, isUnread: boolean) => {
      for (const notificationThread of notificationThreads) {
        const notification = store.get(notificationThread.id)
        if (!notification) return
        notification.setValue(isUnread, 'isUnread')
      }
    },
    [notificationThreads],
  )

  const updateNotificationsIsDone = useCallback(
    (store: RecordSourceSelectorProxy, isDone: boolean) => {
      for (const notificationThread of notificationThreads) {
        const notification = store.get(notificationThread.id)
        if (!notification) return
        notification.setValue(isDone, 'isDone')
      }
    },
    [notificationThreads],
  )

  const markAsReadCallback = useMarkNotificationAsRead(notificationId)
  const markNotificationsAsReadCallback = useMarkNotificationsAsRead(selectedRows)
  const markNotificationsAsUnreadCallback = useMarkNotificationsAsUnread(selectedRows)
  const markNotificationsAsDoneCallback = useMarkNotificationsAsDone(selectedRows, reloadDataPage)
  const markAsUnreadCallback = useMarkNotificationAsUnread(notificationId)
  const markAsDoneCallback = useMarkNotificationAsDone(notificationId)
  const markAllNotificationsAsReadCallback = useMarkAllNotifications(
    unreadNotifications ? 'READ' : 'UNREAD',
    updateNotificationsUnread,
  )
  const markAllNotificationsAsDoneCallback = useMarkAllNotifications('DONE', updateNotificationsIsDone)
  const unsubscribeCallback = useNotificationUnsubscribe(subscribableId, markAsDoneCallback)
  const unsubscribeFromNotificationsCallback = useNotificationsUnsubscribe(
    selectedSubjectIds,
    markNotificationsAsDoneCallback,
  )

  // Keyboard action bindings
  useKeyPress([HOTKEYS.markAsRead], markAsReadCallback)
  useKeyPress([HOTKEYS.markAsUnread], markAsUnreadCallback)
  useKeyPress([HOTKEYS.markAsDone], markAsDoneCallback)
  useKeyPress([HOTKEYS.unsubscribe], unsubscribeCallback)

  const onRowSelect = useCallback(
    (id: string, selected: boolean) => {
      if (selected) {
        setSelectedRows(new Set<string>(selectedRows.add(id)))
        setSelectedNotificationIds(new Set<string>(selectedNotificationIds.add(id)))
      } else {
        selectedRows.delete(id)
        setSelectedRows(new Set<string>(selectedRows))
        selectedNotificationIds.delete(id)
        setSelectedNotificationIds(new Set<string>(selectedNotificationIds))
      }
    },
    [selectedNotificationIds, selectedRows, setSelectedNotificationIds],
  )

  const renderAction = useCallback(
    (text: string, icon: Icon, display: boolean, callback: (event: KeyboardEvent | React.MouseEvent) => void) => {
      return (
        <>
          {display ? (
            <Button leadingVisual={icon} onClick={callback}>
              {text}
            </Button>
          ) : null}
        </>
      )
    },
    [],
  )

  const renderActionMenu = useMemo(() => {
    return (
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton unsafeDisableTooltip={true} icon={KebabHorizontalIcon} aria-label="Open menu" />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay width="medium" align="end">
          <ActionList>
            <ActionList.Item onSelect={markAllNotificationsAsDoneCallback} disabled={totalNotifications <= 0}>
              <ActionList.LeadingVisual>
                <CheckCircleIcon size={16} />
              </ActionList.LeadingVisual>
              Mark all {totalNotifications} as done
            </ActionList.Item>
            <ActionList.Item onSelect={markAllNotificationsAsReadCallback} disabled={totalNotifications <= 0}>
              <ActionList.LeadingVisual>
                <ReadIcon size={16} />
              </ActionList.LeadingVisual>
              Mark all {totalNotifications} as {unreadNotifications ? 'read' : 'unread'}
            </ActionList.Item>
            <ActionList.Divider />
            <ActionList.Group>
              <ActionList.GroupHeading>Currently subscribed to all activity</ActionList.GroupHeading>
              <ActionList.Item onSelect={() => alert('Copy link clicked')}>
                <ActionList.LeadingVisual>
                  <BellIcon size={16} />
                </ActionList.LeadingVisual>
                Stop watching
              </ActionList.Item>
            </ActionList.Group>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    )
  }, [markAllNotificationsAsDoneCallback, markAllNotificationsAsReadCallback, totalNotifications, unreadNotifications])

  const anyUnread = useMemo(() => {
    return notificationsPerPage
      .map(({id, thread}) => {
        const {isUnread} = thread as unknown as {isUnread: boolean}
        return isUnread && selectedRows.has(id)
      })
      .some(item => item)
  }, [notificationsPerPage, selectedRows])

  const actions = useMemo(
    () => [
      {
        key: 'mark-as-read',
        render: () => renderAction('Mark as read', MarkAsReadIcon, anyUnread, markNotificationsAsReadCallback),
      },
      {
        key: 'mark-as-unread',
        render: () => renderAction('Mark as unread', MarkAsUnreadIcon, !anyUnread, markNotificationsAsUnreadCallback),
      },
      {
        key: 'mark-as-done',
        render: () => renderAction('Mark as done', CheckIcon, true, markNotificationsAsDoneCallback),
      },
      {
        key: 'unsubscribe',
        render: () => {
          return renderAction(
            'Unsubscribe',
            BellSlashIcon,
            selectedSubjectIds.size > 0,
            unsubscribeFromNotificationsCallback,
          )
        },
      },
    ],
    [
      renderAction,
      anyUnread,
      markNotificationsAsReadCallback,
      markNotificationsAsUnreadCallback,
      markNotificationsAsDoneCallback,
      selectedSubjectIds.size,
      unsubscribeFromNotificationsCallback,
    ],
  )

  const markAllActions = useMemo(
    () => [
      {
        key: 'mark-all',
        render: () => {
          return renderActionMenu
        },
      },
    ],
    [renderActionMenu],
  )

  const notificationsInPage = useCallback(
    (pageNumber: number) => {
      return notificationThreads?.slice(
        (pageNumber - 1) * expectedNotificationLength,
        pageNumber * expectedNotificationLength,
      )
    },
    [expectedNotificationLength, notificationThreads],
  )

  const selectNotifications = useCallback(() => {
    const selectedIds = notificationsPerPage
      .filter(({id}) => selectedNotificationIds.has(id))
      .map(({id}) => {
        return id
      })
    setSelectedRows(new Set<string>(selectedIds))
  }, [notificationsPerPage, selectedNotificationIds])

  // PreLoading the next page if not loaded and selecting the notifications if coming from the show or other page
  useEffect(() => {
    if (notificationsInPage(currentPage + 1).length === 0) {
      loadNext(expectedNotificationLength)
    }
    if (notificationsPerPage?.some(({id}) => selectedNotificationIds.has(id))) {
      selectNotifications()
    }
  }, [
    expectedNotificationLength,
    loadNext,
    currentPage,
    notificationsInPage,
    selectNotifications,
    notificationsPerPage,
    selectedNotificationIds,
  ])

  const handlePageChange = useCallback(
    (event: React.MouseEvent, page_number: number) => {
      if (isLoadingNext) {
        return
      }

      event.preventDefault()
      setCurrentPage(page_number)
      window.scrollTo(0, 0)
    },
    [isLoadingNext, setCurrentPage],
  )

  const onToggleSelectAll = useCallback(
    (isSelectAllChecked: boolean) => {
      if (isSelectAllChecked) {
        notificationsPerPage.map(({id}) => {
          onRowSelect(id, true)
        })
      } else {
        notificationsPerPage.map(({id}) => {
          onRowSelect(id, false)
        })
      }
    },
    [notificationsPerPage, onRowSelect],
  )

  return (
    <>
      <Box sx={{border: '1px solid', borderColor: 'border.default', borderRadius: 2}} data-testid="notification-list">
        <div ref={paginationLoadingRef}>
          <ListView
            isSelectable={totalNotifications > 0}
            title={'Notifications inbox'}
            // Providing the totalCount to the ListView component will show the items selected "x of y selected"
            totalCount={expectedNotificationLength}
            metadata={
              <ListViewMetadata
                title={`${
                  grouping.isGrouped ? [grouping.repository?.nameWithOwner, ' ('].join('') : ''
                }${totalNotifications} notifications${grouping.isGrouped ? ')' : ''}`}
                actionsLabel="Actions"
                actions={anyNotificationsPerPageSelected ? actions : groupingFlagEnabled ? markAllActions : []}
                onToggleSelectAll={onToggleSelectAll}
              />
            }
          >
            {totalNotifications > 0 ? (
              notificationsPerPage.map(({cursor, thread, id}) => (
                <Fragment key={`thread-${cursor}`}>
                  <InboxListRow {...thread} isSelected={selectedRows.has(id)} onSelect={onRowSelect} />
                </Fragment>
              ))
            ) : hasSearchQuery ? (
              // If the list is a grouped repository, do not show no results
              !grouping.isGrouped && (
                // Search result is empty
                <NoResults showSsoDropdown={false} />
              )
            ) : (
              // User has no notifications
              <InboxZero />
            )}
          </ListView>
          {totalNotifications > 0 &&
            (grouping.isGrouped ? (
              <Box sx={{display: 'flex', justifyContent: 'center', my: 3}}>
                <Button
                  variant="invisible"
                  onClick={() => {
                    alert('Not implemented!')
                  }}
                >
                  View all
                </Button>
              </Box>
            ) : (
              <Pagination
                pageCount={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                showPages={false}
              />
            ))}
        </div>
      </Box>
    </>
  )
}

const InboxCompactList: FC<NotificationListProps> = ({queryReference, hasSearchQuery = false}) => {
  const {notificationThreads, notificationNeighbours, loadNext, isLoadingNext} = useNotifications(queryReference)
  const {notificationId} = useRouteInfo()
  const {activeNotificationId} = useNotificationContext()

  // Pagination
  const {currentPage, setCurrentPage} = usePaginationContext()
  const totalPages = useMemo(
    () => Math.floor((notificationThreads.length - 1) / VALUES.issuesPageSize) + 1,
    [notificationThreads],
  )
  const notificationsPerPage = useMemo(
    () => notificationThreads?.slice((currentPage - 1) * VALUES.issuesPageSize, currentPage * VALUES.issuesPageSize),
    [currentPage, notificationThreads],
  )

  const notificationsInPage = useCallback(
    (pageNumber: number) => {
      return notificationThreads?.slice((pageNumber - 1) * VALUES.issuesPageSize, pageNumber * VALUES.issuesPageSize)
    },
    [notificationThreads],
  )

  // Loading the next page if not loadded
  useEffect(() => {
    if (notificationsInPage(currentPage + 1).length === 0) {
      loadNext(VALUES.issuesPageSize)
    }
  }, [loadNext, currentPage, notificationsInPage])

  // When active item changes, check if the next/prev page needs to be loaded
  useEffect(() => {
    if (notificationsInPage(currentPage + 1)?.some(({id}) => id === activeNotificationId)) {
      setCurrentPage(currentPage + 1)
    }
    if (notificationsInPage(currentPage - 1)?.some(({id}) => id === activeNotificationId)) {
      setCurrentPage(currentPage - 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNotificationId])

  const handlePageChange = useCallback(
    (event: React.MouseEvent, page_number: number) => {
      if (isLoadingNext) {
        return
      }

      event.preventDefault()
      setCurrentPage(page_number)
    },
    [isLoadingNext, setCurrentPage],
  )

  // Prefetch sibling notifications using the notification ID
  const prevItem = notificationId ? notificationNeighbours[notificationId]?.previous : null
  const nextItem = notificationId ? notificationNeighbours[notificationId]?.next : null
  useNotificationsPrefetch(notificationId, prevItem!, nextItem!)

  return notificationThreads.length > 0 ? (
    <ListView title={'Notifications inbox'}>
      {notificationsPerPage.map(({cursor, thread}) => (
        <Fragment key={`thread-${cursor}`}>
          <InboxListCompactRow {...thread} />
        </Fragment>
      ))}
      <Pagination pageCount={totalPages} currentPage={currentPage} onPageChange={handlePageChange} showPages={false} />
    </ListView>
  ) : hasSearchQuery ? (
    // Search result is empty
    <NoResults />
  ) : (
    // User has no notifications
    <InboxZero />
  )
}

export default InboxList
export {InboxCompactList}
