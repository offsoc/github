import {Box, Button, Dialog} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'

export interface CopilotIsLoadingWarningDialogProps {
  isOpen: boolean
  onCancel: () => void
  onDiscard: () => void
  returnFocusRef: React.RefObject<HTMLElement>
}

export const CopilotIsLoadingWarningDialog = (props: CopilotIsLoadingWarningDialogProps) => {
  return (
    <Dialog
      className="copilot-is-loading-warning-dialog"
      isOpen={props.isOpen}
      onDismiss={props.onCancel}
      returnFocusRef={props.returnFocusRef}
      aria-label="Summary not complete"
      {...testIdProps('copilot-is-loading-warning-dialog')}
    >
      <Dialog.Header>Summary not complete</Dialog.Header>

      <Box sx={{p: 3}}>
        Copilot is not done generating a summary. Are you sure you want to discard?
        <Box sx={{display: 'flex', mt: 3, justifyContent: 'flex-end'}}>
          <Button sx={{mr: 1}} onClick={props.onCancel} {...testIdProps('dialog-cancel-btn')}>
            Cancel
          </Button>
          <Button variant="danger" onClick={props.onDiscard} {...testIdProps('dialog-discard-btn')}>
            Save and discard
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
