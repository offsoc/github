import {createContext, type FC, type ReactNode, useCallback, useContext, useMemo, useState} from 'react'

import {NotificationViewPreferenceEnum} from '../notifications/constants/settings'
import type {NotificationViewPreference} from '../types/notification'
import useUpdateNotificationViewPreference from '../hooks/use-update-notification-view-preference'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {AppPayload} from '../types/app-payload'

type ViewPreferenceContextType = {
  viewPreference: NotificationViewPreference
  updateViewPreference: (view: NotificationViewPreference) => void
}

const ViewPreferenceContext = createContext<ViewPreferenceContextType | null>(null)

type ViewPreferenceContextProviderProps = {
  children: ReactNode
  value?: NotificationViewPreference
}

export const ViewPreferenceContextProvider: FC<ViewPreferenceContextProviderProps> = ({children, value}) => {
  const {user_prefers_notifications_grouped_by_list} = useAppPayload<AppPayload>()
  const payloadValue = useMemo(
    () =>
      user_prefers_notifications_grouped_by_list
        ? NotificationViewPreferenceEnum.GROUP_BY_REPO
        : NotificationViewPreferenceEnum.DATE,
    [user_prefers_notifications_grouped_by_list],
  )
  const [viewPreference, setViewPreference] = useState<NotificationViewPreference>(value ?? payloadValue)

  const commitViewPreference = useUpdateNotificationViewPreference()
  const updateViewPreference = useCallback(
    (view: NotificationViewPreference) => {
      // Prevent unnecessary API calls
      const isSameView = view === viewPreference
      if (isSameView) {
        return
      }

      // Update the view preference in the context only after the API call succeeds
      const onSuccess = () => {
        setViewPreference(view)
      }
      commitViewPreference(view, onSuccess)
    },
    [viewPreference, commitViewPreference, setViewPreference],
  )

  const providerData = useMemo(
    () => ({
      viewPreference,
      updateViewPreference,
    }),
    [viewPreference, updateViewPreference],
  )
  return <ViewPreferenceContext.Provider value={providerData}>{children}</ViewPreferenceContext.Provider>
}

export function useViewPreferenceContext(): ViewPreferenceContextType {
  const context = useContext(ViewPreferenceContext)
  if (!context) {
    throw new Error('useViewPreference must be used within a ViewPreferenceContextProvider.')
  }

  return context
}
