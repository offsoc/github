import {testIdProps} from '@github-ui/test-id-props'
import {PulseIcon} from '@primer/octicons-react'
import {Box, Button, Link, Octicon, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useCallback} from 'react'

import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {StatusUpdateActionTypes} from '../../state-providers/status-updates/hooks/use-status-updates-editor-reducer'
import {useStatusUpdates} from '../../state-providers/status-updates/status-updates-context'
import {
  NEW_STATUS_UPDATE_ID,
  useStatusUpdatesEditorState,
} from '../../state-providers/status-updates/status-updates-editor-state-context'
import {StatusUpdatesResources} from '../../strings'
import {NotificationSubscriptionsToggle} from '../notification-subscriptions-toggle'

const statusUpdatesHeadingStyle: BetterSystemStyleObject = {
  width: '100%',
  display: 'flex',
  minHeight: 32,
  justifyContent: 'space-between',
}

const statusUpdatesEmptyStateHeadingStyle: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  alignItems: 'center',
  border: theme => `1px solid ${theme.colors.border.default}`,
  padding: '32px 16px',
  borderRadius: 2,
}

export function StatusUpdatesHeader() {
  const {memexStatusItems, isLoading} = useStatusUpdates()
  const {statusUpdateDraftsDispatch} = useStatusUpdatesEditorState()
  const {hasWritePermissions, isLoggedIn} = ViewerPrivileges()
  const {memex_status_updates_notifications} = useEnabledFeatures()

  const hasUpdates = memexStatusItems.length !== 0

  const handleOnClick = useCallback(() => {
    const [latestStatus] = memexStatusItems

    if (!latestStatus) {
      return statusUpdateDraftsDispatch({
        type: StatusUpdateActionTypes.SET_STATUS_UPDATE,
        payload: {
          id: NEW_STATUS_UPDATE_ID,
          body: '',
          startDate: null,
          targetDate: null,
          status: null,
        },
      })
    }

    const lastStartDate = latestStatus.statusValue.startDate ? new Date(latestStatus.statusValue.startDate) : null
    const lastTargetDate = latestStatus.statusValue.targetDate ? new Date(latestStatus.statusValue.targetDate) : null

    statusUpdateDraftsDispatch({
      type: StatusUpdateActionTypes.SET_STATUS_UPDATE,
      payload: {
        id: NEW_STATUS_UPDATE_ID,
        body: '',
        startDate: lastStartDate,
        targetDate: lastTargetDate,
        status: latestStatus.statusValue?.status ?? null,
      },
    })
  }, [memexStatusItems, statusUpdateDraftsDispatch])

  if (hasUpdates || isLoading) {
    return (
      <Box {...testIdProps('status-updates-default-state-header')} sx={statusUpdatesHeadingStyle}>
        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
          <Octicon icon={PulseIcon} sx={{color: 'fg.subtle'}} />
          <Text as="h3" sx={{fontSize: 14, fontWeight: 'bold', color: 'fg.default'}}>
            {StatusUpdatesResources.title}
          </Text>
        </Box>
        <Box sx={{display: 'flex', gap: 2}}>
          {memex_status_updates_notifications && isLoggedIn && <NotificationSubscriptionsToggle />}
          {hasWritePermissions && (
            <Button variant="primary" onClick={handleOnClick} {...testIdProps('status-updates-create-button')}>
              {StatusUpdatesResources.addUpdateButtonText}
            </Button>
          )}
        </Box>
      </Box>
    )
  }

  if (!hasWritePermissions) return null

  return (
    <Box {...testIdProps('status-updates-empty-state-header')} sx={statusUpdatesEmptyStateHeadingStyle}>
      <Octicon icon={PulseIcon} size="medium" />
      <Text as="h3" sx={{fontSize: 20, fontWeight: 'bold', color: 'fg.default'}}>
        {StatusUpdatesResources.nullStateTitle}
      </Text>
      <Text sx={{fontSize: 14, color: 'fg.muted', textAlign: 'center'}}>{StatusUpdatesResources.description}</Text>
      <Box sx={{display: 'flex', alignItems: 'center', marginTop: 3, gap: 3}}>
        <Button variant="primary" onClick={handleOnClick} {...testIdProps('status-updates-create-button')}>
          {StatusUpdatesResources.addUpdateButtonText}
        </Button>
        <Link
          href={'https://gh.io/status-updates-learn-more'}
          style={{cursor: 'pointer', marginLeft: '8px'}}
          tabIndex={0}
          target="_blank"
          {...testIdProps('status-updates-learn-more-link')}
        >
          {StatusUpdatesResources.learnMoreLinkText}
        </Link>
      </Box>
    </Box>
  )
}
