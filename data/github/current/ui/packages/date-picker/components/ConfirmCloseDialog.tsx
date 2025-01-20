import {CheckIcon, TrashIcon} from '@primer/octicons-react'
import {ConfirmationDialog} from '@primer/react'
import {useCallback} from 'react'

import styles from './ConfirmCloseDialog.module.css'
import {useDatePickerContext} from './Provider'

/**
 * Shown to the user to confirm that they want to discard their changes.
 */
export const DatePickerConfirmCloseDialog = () => {
  const {onConfirmClose, confirmingClose} = useDatePickerContext()

  const onClose = useCallback(
    (gesture: 'confirm' | 'cancel' | 'close-button' | 'escape') => {
      const action = gesture === 'confirm' ? 'confirm' : 'discard'
      onConfirmClose(action)
    },
    [onConfirmClose],
  )

  return confirmingClose ? (
    <ConfirmationDialog
      title="Save Changes?"
      confirmButtonContent={
        <>
          <CheckIcon />
          <span className={styles.labelText}>Save</span>
        </>
      }
      cancelButtonContent={
        <>
          <TrashIcon />
          <span className={styles.labelText}>Discard</span>
        </>
      }
      onClose={onClose}
    >
      You have unsaved changes, would you like to save them?
    </ConfirmationDialog>
  ) : null
}
