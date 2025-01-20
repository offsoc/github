import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo} from 'react'

import {useStatusUpdates} from '../../state-providers/status-updates/status-updates-context'
import {
  NEW_STATUS_UPDATE_ID,
  useStatusUpdatesEditorState,
} from '../../state-providers/status-updates/status-updates-editor-state-context'
import {StatusUpdatesResources} from '../../strings'
import {StatusUpdateEditor} from './status-update-editor'
import {StatusUpdateItem} from './status-update-item'
import {StatusUpdatesHeader} from './status-updates-header'

const statusUpdatesContainerStyle: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'column',
  flex: 'auto',
  borderTop: '1px solid',
  borderColor: 'border.muted',
  pt: 4,
  mt: 3,
  width: '100%',
}

export const StatusUpdates = memo(function SidePanelMemexStatusUpdates() {
  const {memexStatusItems, isLoading} = useStatusUpdates()
  const {statusUpdateDrafts} = useStatusUpdatesEditorState()

  const newStatusUpdateDraft = statusUpdateDrafts[NEW_STATUS_UPDATE_ID]

  // The existence of a draft implies that the item is currently being added.
  const isAdding = !!newStatusUpdateDraft

  return (
    <Box {...testIdProps('status-updates-container')} sx={statusUpdatesContainerStyle}>
      {isAdding && newStatusUpdateDraft ? (
        <Box
          {...testIdProps('status-updates-create-container')}
          sx={{display: 'flex', flexDirection: 'column', width: '100%', gap: 3}}
        >
          <Text as="h3" sx={{fontSize: 14, fontWeight: 'bold', color: 'fg.default'}}>
            {StatusUpdatesResources.addUpdateTitle}
          </Text>

          <StatusUpdateEditor statusUpdate={newStatusUpdateDraft} />
        </Box>
      ) : (
        <StatusUpdatesHeader />
      )}
      {isLoading ? (
        <LoadingSkeleton sx={{width: '100%', height: '32px', mb: 3, mt: 3}} variant="rounded" height="md" />
      ) : (
        <Box aria-label="Status updates" role="list" sx={{mb: 3}}>
          {memexStatusItems.map(statusUpdate => (
            <StatusUpdateItem key={statusUpdate.id} status={statusUpdate} />
          ))}
        </Box>
      )}
    </Box>
  )
})
