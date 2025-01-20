import {createContext, useContext} from 'react'

type NotificationSubscriptionsContext = {
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
  viewerIsSubscribed: boolean | undefined
  isLoading: boolean
  setViewerIsSubscribed: (isSubscribed: boolean) => void
}

export const NotificationSubscriptionsContext = createContext<NotificationSubscriptionsContext | null>(null)

export function useNotificationSubscriptions() {
  const context = useContext(NotificationSubscriptionsContext)

  if (!context) {
    throw new Error('useNotificationSubscriptions must be used within a StatusUpdatesContext.Provider.')
  }

  return context
}
