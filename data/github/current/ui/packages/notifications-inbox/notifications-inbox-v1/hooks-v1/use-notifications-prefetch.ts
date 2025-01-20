import {useEffect, useState} from 'react'
import {fetchQuery, useRelayEnvironment} from 'react-relay/hooks'
import type {Environment} from 'relay-runtime'

import InboxDefaultViewRequest from '../components-v1/__generated__/InboxDefaultViewV1Query.graphql'
import {VALUES} from '../../constants'
import type {NotificationProps} from '../../types/notification'
import {prefetchIssue} from '@github-ui/issue-viewer/IssueViewerLoader'

const prefetchDefaultViewNotification = (environment: Environment, notificationId: string) => {
  return fetchQuery(
    environment,
    InboxDefaultViewRequest,
    // Notifications Detail query requires query and first parameters that are not applicable when searching by ID
    {
      id: notificationId ?? '',
      query: '',
      first: VALUES.issuesPageSize,
    },
    {fetchPolicy: 'store-or-network'},
  ).toPromise()
}

/**
 * This hook fetches the sibling notifications of the currently selected notification
 * so that items are readily available in the Relay store when navigating to them.
 *
 * @param currentItemId The currently selected notification ID
 * @param previousItemId The previous notification ID in the list
 * @param nextItemId The next notification ID in the list
 */
export default function useNotificationsPrefetch(
  currentItemId: string | undefined,
  previousItem: NotificationProps | null,
  nextItem: NotificationProps | null,
): void {
  const environment = useRelayEnvironment()
  const [isLoading, setIsLoading] = useState(false)

  const prefetchItem = (notification: NotificationProps | null) => {
    if (!notification) return Promise.resolve()

    if (notification.subject.__typename === 'Issue' && notification.list.__typename === 'Repository') {
      return prefetchIssue(
        environment,
        notification.list.owner.login,
        notification.list.name,
        notification.subject.number,
      )
    } else {
      return prefetchDefaultViewNotification(environment, notification.id)
    }
  }

  useEffect(() => {
    if (!currentItemId || isLoading) return

    setIsLoading(true)

    Promise.allSettled([prefetchItem(previousItem), prefetchItem(nextItem)]).finally(() => {
      setIsLoading(false)
    })
    // Force prefetch to run only on current notification changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItemId])
}
