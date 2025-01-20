import {
  createContext,
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

import {default as NotificationTabs} from '../notifications/constants/tabs'
import type {NotificationPositionMap} from '../types/notification'

type NotificationContextType = {
  neighbours: NotificationPositionMap
  setNeighbours?: Dispatch<SetStateAction<NotificationPositionMap>>
  activeSearchQuery: string
  setActiveSearchQuery: (str: string) => void
  activeNotificationId: string
  setActiveNotificationId: (str: string) => void
  activeTab: string
  setActiveTab: (str: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const NotificationContextProvider: FC<{children: ReactNode}> = ({children}) => {
  const [neighbours, setNeighbours] = useState<NotificationPositionMap>({})
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>(NotificationTabs.keys.focus)
  const [activeNotificationId, setActiveNotificationId] = useState('')
  const providerData = useMemo(
    () => ({
      activeSearchQuery,
      activeTab,
      setActiveSearchQuery,
      activeNotificationId,
      setActiveNotificationId,
      setActiveTab,
      setNeighbours,
      neighbours,
    }),
    [activeSearchQuery, activeTab, activeNotificationId, neighbours],
  )

  return <NotificationContext.Provider value={providerData}>{children}</NotificationContext.Provider>
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationContextProvider.')
  }

  return context
}
