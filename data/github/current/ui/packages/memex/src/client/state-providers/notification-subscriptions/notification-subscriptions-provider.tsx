import {memo, useCallback, useMemo, useState} from 'react'

import {apiSubscribe, apiUnsubscribe} from '../../api/memex/api-notification-subscriptions'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {NotificationSubscriptionsContext} from './notification-subscriptions-context'

export const NotificationSubscriptionsProvider = memo(function NotificationSubscriptionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [viewerIsSubscribed, setViewerIsSubscribed] = useState(fetchJSONIslandData('memex-viewer-subscribed') ?? false)
  const [isLoading, setIsLoading] = useState(false)

  const subscribe = useCallback(async () => {
    setIsLoading(true)
    const originalSubscribed = viewerIsSubscribed

    setViewerIsSubscribed(true)

    try {
      await apiSubscribe()
    } catch (e) {
      setViewerIsSubscribed(originalSubscribed)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [viewerIsSubscribed])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    const originalSubscribed = viewerIsSubscribed

    setViewerIsSubscribed(false)

    try {
      await apiUnsubscribe()
    } catch (e) {
      setViewerIsSubscribed(originalSubscribed)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [viewerIsSubscribed])

  return (
    <NotificationSubscriptionsContext.Provider
      value={useMemo(() => {
        return {subscribe, unsubscribe, viewerIsSubscribed, isLoading, setViewerIsSubscribed}
      }, [isLoading, subscribe, unsubscribe, viewerIsSubscribed, setViewerIsSubscribed])}
    >
      {children}
    </NotificationSubscriptionsContext.Provider>
  )
})
