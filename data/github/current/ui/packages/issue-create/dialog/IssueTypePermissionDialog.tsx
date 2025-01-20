import {Dialog, Box} from '@primer/react'
import {LABELS} from '../constants/labels'

type IssueTypePermissionDialogProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  permissionDialogRef: React.RefObject<HTMLButtonElement> | undefined
}

export const IssueTypePermissionDialog = ({isOpen, setIsOpen, permissionDialogRef}: IssueTypePermissionDialogProps) => (
  <Dialog
    returnFocusRef={permissionDialogRef}
    isOpen={isOpen}
    onDismiss={() => setIsOpen(false)}
    aria-labelledby="issue-types-permission-dialogg-header"
  >
    <div data-testid="issue-types-permission-dialog">
      <Dialog.Header id="issue-types-permission-dialog-header">{LABELS.issueTypeReadOnly}</Dialog.Header>
      <Box sx={{p: 3}}>
        <span>{LABELS.issueTypeReadOnlyReason}</span>
      </Box>
    </div>
  </Dialog>
)
