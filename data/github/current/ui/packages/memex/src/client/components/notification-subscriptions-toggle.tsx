import {testIdProps} from '@github-ui/test-id-props'
import {BellIcon, BellSlashIcon} from '@primer/octicons-react'
import {Button, Tooltip} from '@primer/react'
import {useCallback} from 'react'

import {useNotificationSubscriptions} from '../state-providers/notification-subscriptions/notification-subscriptions-context'
import {StatusUpdatesResources} from '../strings'

export const NotificationSubscriptionsToggle = () => {
  const {viewerIsSubscribed, subscribe, unsubscribe, isLoading} = useNotificationSubscriptions()
  const description = viewerIsSubscribed
    ? StatusUpdatesResources.unsubscribeFromUpdates
    : StatusUpdatesResources.subscribeToUpdates

  const handleOnClick = useCallback(async () => {
    if (viewerIsSubscribed) {
      unsubscribe()
    } else {
      subscribe()
    }
  }, [subscribe, unsubscribe, viewerIsSubscribed])

  const icon = viewerIsSubscribed ? BellSlashIcon : BellIcon

  return (
    <Tooltip {...testIdProps('notification-subscriptions-toggle-tooltip')} aria-label={description} direction="s">
      <Button
        {...testIdProps('notification-subscriptions-toggle')}
        disabled={isLoading}
        onClick={handleOnClick}
        leadingVisual={icon}
      >
        {viewerIsSubscribed ? 'Unsubscribe' : 'Subscribe'}
      </Button>
    </Tooltip>
  )
}
