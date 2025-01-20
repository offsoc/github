import {Box, Spinner} from '@primer/react'
import {Dialog} from '@primer/react/experimental'

import ChecksStatusBadgeFooter from './components/ChecksStatusBadgeFooter'
import HeaderState from './components/ChecksStatusBadgeHeader'
import type {CombinedStatusResult} from './index'

interface CheckStatusDialogProps {
  combinedStatus?: CombinedStatusResult
  isOpen: boolean
  onDismiss: () => void
}

export function CheckStatusDialog(props: CheckStatusDialogProps) {
  const {combinedStatus, isOpen, onDismiss} = props

  const title = combinedStatus ? <HeaderState checksHeaderState={combinedStatus.checksHeaderState} /> : 'Loading...'

  return isOpen ? (
    <Dialog
      onClose={onDismiss}
      sx={{
        overflowY: 'auto',
        backgroundColor: 'canvas.default',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'border.default',
        borderBottom: 0,
      }}
      title={title}
      subtitle={combinedStatus ? combinedStatus.checksStatusSummary : undefined}
      width="xlarge"
      renderBody={() => (
        <Dialog.Body sx={{padding: 0}}>
          {combinedStatus ? (
            <ChecksStatusBadgeFooter checkRuns={combinedStatus.checkRuns} />
          ) : (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
              <Spinner size="medium" />
            </Box>
          )}
        </Dialog.Body>
      )}
    />
  ) : null
}
