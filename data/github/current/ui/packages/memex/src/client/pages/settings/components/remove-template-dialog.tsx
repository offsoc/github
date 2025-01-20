import {Dialog} from '@primer/react/lib-esm/Dialog/Dialog'
import {useCallback, useEffect, useRef} from 'react'

type RemoveTemplateDialogProps = {
  onClose: (gesture: 'confirm' | 'cancel' | 'close-button' | 'escape') => void
  isOpen: boolean
}

export function RemoveTemplateDialog({onClose}: RemoveTemplateDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onCloseClick = useCallback(() => {
    onClose('cancel')
  }, [onClose])

  const onConfirmClick = useCallback(() => {
    onClose('confirm')
  }, [onClose])

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="header-id"
      title="Are you sure?"
      width="small"
      footerButtons={[
        {
          content: <span>Cancel</span>,
          onClick: onCloseClick,
          buttonType: 'normal',
        },
        {
          content: <span>Remove</span>,
          onClick: onConfirmClick,
          buttonType: 'danger',
        },
      ]}
    >
      <span>
        Remove this project as a template? It will no longer be available as a template when creating new projects.
      </span>
    </Dialog>
  )
}
