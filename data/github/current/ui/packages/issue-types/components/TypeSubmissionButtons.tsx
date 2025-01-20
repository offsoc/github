import {forwardRef} from 'react'
import {Box, Button, Octicon, Text} from '@primer/react'
import {Resources} from '../constants/strings'
import {CheckIcon} from '@primer/octicons-react'

type TypeSubmissionButtonsProps = {
  disabled?: boolean
  confirmLabel: string
  cancelLabel?: string
  onCancel: () => void
  onConfirm: () => void
  changesSaved?: boolean
}

export const TypeSubmissionButtons = forwardRef<HTMLDivElement, TypeSubmissionButtonsProps>(
  function TypeSubmissionButtons(
    {disabled = false, onCancel, onConfirm, cancelLabel = Resources.cancelButton, confirmLabel, changesSaved = false},
    forwardedRef,
  ) {
    return (
      <Box sx={{display: 'flex', gap: 2}}>
        <Button variant="primary" onClick={onConfirm} data-testid="issue-type-confirm-button" disabled={disabled}>
          {confirmLabel}
        </Button>
        <Button onClick={onCancel} data-testid="issue-type-cancel-button" disabled={disabled}>
          {cancelLabel}
        </Button>
        {changesSaved && (
          <Box sx={{display: 'flex', alignItems: 'center', ml: 2}} tabIndex={-1} ref={forwardedRef}>
            <Octicon icon={CheckIcon} size="small" sx={{color: 'success.fg'}} />
            <Text sx={{color: 'fg.muted', ml: 1, fontSize: 0}}>{Resources.changesSavedText}</Text>
          </Box>
        )}
      </Box>
    )
  },
)
