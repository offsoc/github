import {useIssueViewerCommentsContext} from '@github-ui/issue-viewer/IssueViewerCommentsContext'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {Suspense, useCallback, useEffect, useMemo} from 'react'
import {graphql, type PreloadedQuery, usePreloadedQuery, useQueryLoader, useRelayEnvironment} from 'react-relay'

import {default as NotificationTabs} from '../notifications/constants/tabs'
import {markNotificationAsRead} from '../notifications/mutations'
import {ThreePanesLayout} from '@github-ui/three-panes-layout'
import InboxSidebar from '../components/sidebar/InboxSidebar'
import {LABELS, VALUES} from '../constants'
import {useNotificationContext} from '../contexts/NotificationContext'
import {useRouteInfo} from '../hooks'
import type {InboxDetailPageQuery} from './__generated__/InboxDetailPageQuery.graphql'
import InboxDetail from './InboxDetail'

const notificationDetailPageQuery = graphql`
  query InboxDetailPageQuery($query: String!, $first: Int!, $id: ID!, $useNewQueryField: Boolean!) {
    ...InboxSidebar_notifications @arguments(query: $query, first: $first, useNewQueryField: $useNewQueryField)
    node(id: $id) {
      ... on NotificationThread {
        ...InboxDetail_details
        id
        url
        isUnread
        # eslint-disable-next-line relay/unused-fields
        subscriptionStatus
        # eslint-disable-next-line relay/unused-fields
        subject {
          __typename
          ... on Issue {
            id
          }
        }
      }
    }
  }
`

type InboxDetailPageRenderProps = {
  queryReference: PreloadedQuery<InboxDetailPageQuery>
  searchQuery: string
}

function InboxDetailPageRender({queryReference, searchQuery}: InboxDetailPageRenderProps) {
  const environment = useRelayEnvironment()
  const data = usePreloadedQuery<InboxDetailPageQuery>(notificationDetailPageQuery, queryReference)

  useEffect(() => {
    const isUnread = data?.node?.isUnread
    const id = data?.node?.id

    if (isUnread && id) {
      markNotificationAsRead({
        environment,
        notificationId: id,
      })
    }
    // Note:
    //
    // We don't want to add `data` to the dependency array here.
    // Doing this would cause an automatic mark as read when the user manually
    // marks a notification as unread.
    //
    // We only care if the node id changes. If the node id changes
    // we can be certain that we have changed notifications and so we should try
    // and mark as read if it's not already unread.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.node?.id])

  const {setIssueCommentHighlightId} = useIssueViewerCommentsContext()

  // Now that we have the URL of the notification, we can set the issue comment highlight id.
  useEffect(() => {
    const hash = new URL(data.node?.url ?? '', window.location.origin).hash
    if (!hash) return

    const issueCommentMatch = hash.match(/^#issuecomment-(\d+)$/)
    if (!issueCommentMatch) return
    setIssueCommentHighlightId(issueCommentMatch[1]!)
  }, [data?.node, setIssueCommentHighlightId])

  return data.node ? (
    <ThreePanesLayout
      middlePane={<InboxSidebar initialSearchQuery={searchQuery} queryReference={data} />}
      rightPane={{
        element: <InboxDetail queryReference={data.node} />,
        ariaLabel: LABELS.notificationDetailsPaneAriaLabel,
      }}
      rightPanePadding={false}
    />
  ) : null
}

export function InboxDetailPage() {
  const {notificationId} = useRouteInfo()
  const {activeSearchQuery, activeTab} = useNotificationContext()
  const prefixQuery = NotificationTabs.getViewQuery(activeTab)
  const notificationTabSupport = useFeatureFlag('issues_react_inbox_tabs')
  const newGraphqlField = useFeatureFlag('issues_react_notification_new_graghql_field')

  const queryProps = useMemo(() => {
    const query = notificationTabSupport ? [prefixQuery, activeSearchQuery].join(' ').trim() : activeSearchQuery
    return {
      id: notificationId ?? '',
      query: query ?? '',
      first: VALUES.issuesPageSize,
      useNewQueryField: newGraphqlField,
    }

    // Note:
    //
    // We don't want to add `activeSearchQuery` to the dependency array here.
    // This will cause a re-render when the user types in the search box.
    // The request need to refetch when the user searches will
    // be made via a refetchable fragment down the call stack.
    // This means we only need to worry about the `activeSearchQuery` on first render.
    //
    // Put another way, this component only cares about the initial query and render.
    // After this, we mount all child components and hand over search query/re-query responsibility downstream.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationId])

  const [queryReference, load, dispose] = useQueryLoader<InboxDetailPageQuery>(notificationDetailPageQuery)

  const loadQuery = useCallback(() => {
    load(queryProps, {fetchPolicy: 'store-or-network'})
  }, [load, queryProps])

  useEffect(() => {
    loadQuery()
    return () => {
      dispose()
    }
  }, [dispose, loadQuery, notificationId])

  return (
    <Suspense fallback={<p>loading...</p>}>
      {queryReference && <InboxDetailPageRender searchQuery={activeSearchQuery} queryReference={queryReference} />}
    </Suspense>
  )
}
