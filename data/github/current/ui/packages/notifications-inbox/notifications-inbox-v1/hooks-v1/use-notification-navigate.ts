import type React from 'react'
import {useCallback} from 'react'

import type {NotificationProps} from '../../types/notification'
import {useAppNavigate} from '.'

type NotificationNavigateCallback = (event: React.MouseEvent | React.KeyboardEvent) => void

const useNotificationNavigate = (fragment: NotificationProps): NotificationNavigateCallback => {
  const {navigateToNotification} = useAppNavigate()
  return useCallback(
    event => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.ctrlKey || event.metaKey) return

      event.preventDefault()
      navigateToNotification(fragment.id)
    },
    [fragment, navigateToNotification],
  )
}

export default useNotificationNavigate
