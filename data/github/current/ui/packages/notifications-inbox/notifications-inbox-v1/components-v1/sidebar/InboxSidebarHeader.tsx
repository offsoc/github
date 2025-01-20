/* eslint eslint-comments/no-use: off */
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {ArrowLeftIcon} from '@primer/octicons-react'
import {Box, Button, Label, Truncate} from '@primer/react'
import type React from 'react'
import type {FC} from 'react'
import {useCallback} from 'react'

import {LABELS as NOTIFICATION_LABELS} from '../../../notifications/constants/labels'
import {default as NotificationTabs} from '../../../notifications/constants/tabs'
import {useNotificationContext} from '../../contexts-v1/NotificationContext'
import {useAppNavigate} from '../../hooks-v1/use-app-navigate'

const InboxSidebarHeader: FC = () => {
  const {activeSearchQuery, activeTab} = useNotificationContext()
  const {navigateToNotificationSearch} = useAppNavigate()
  const notificationTabSupport = useFeatureFlag('issues_react_inbox_tabs')
  const navigateTitle = NOTIFICATION_LABELS.sidebarTitle

  const navigateBack = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      event.preventDefault()
      navigateToNotificationSearch(activeSearchQuery, notificationTabSupport ? activeTab : undefined)
    },
    [navigateToNotificationSearch, activeSearchQuery, activeTab, notificationTabSupport],
  )

  return (
    <Box
      sx={{
        display: ['none', 'none', 'none', 'flex'],
        justifyContent: 'space-between',
        gap: 1,
        alignItems: 'center',
        pr: 2,
      }}
    >
      <Box
        sx={{
          overflow: 'hidden',
          flexShrink: 1,
          textOverflow: 'ellipsis',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Button
          variant="invisible"
          onClick={navigateBack}
          leadingVisual={ArrowLeftIcon}
          size="small"
          sx={{
            color: 'fg.default',
            px: 2,
            '> [data-component="text"]': {
              overflow: 'hidden',
            }, // needed to truncate button text
          }}
        >
          <Truncate sx={{fontSize: 2, maxWidth: 250}} title={navigateTitle}>
            {navigateTitle}
          </Truncate>
        </Button>
        {notificationTabSupport && <Label>{NotificationTabs.getViewName(activeTab)}</Label>}
      </Box>
    </Box>
  )
}

export default InboxSidebarHeader
