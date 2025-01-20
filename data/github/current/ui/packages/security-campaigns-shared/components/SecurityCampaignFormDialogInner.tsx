import {useCallback, useMemo, type ReactNode} from 'react'
import {Dialog, type DialogButtonProps} from '@primer/react/experimental'
import {SyncIcon} from '@primer/octicons-react'
import {useSecurityCampaignFormContext} from './SecurityCampaignFormContext'

export interface SecurityCampaignFormDialogInnerProps {
  setIsOpen: (isOpen: boolean) => void

  children: ReactNode
}

export function SecurityCampaignFormDialogInner({setIsOpen, children}: SecurityCampaignFormDialogInnerProps) {
  const {
    campaign,
    validationError,
    handleSubmit: handleFormSubmit,
    resetForm,
    isPending,
  } = useSecurityCampaignFormContext()

  const onDialogClose = useCallback(() => {
    setIsOpen(false)

    resetForm()
  }, [setIsOpen, resetForm])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault()

      handleFormSubmit()
    },
    [handleFormSubmit],
  )

  const dialogTitle = campaign ? 'Edit campaign' : 'New campaign'
  const submitButtonText = campaign ? 'Save changes' : 'Create campaign'

  const footerButtons = useMemo<DialogButtonProps[]>(
    () => [
      {
        buttonType: 'default',
        content: 'Cancel',
        onClick: () => setIsOpen(false),
      },
      {
        buttonType: 'primary',
        content: submitButtonText,
        disabled: !!validationError || isPending,
        onClick: handleSubmit,
        leadingVisual: isPending ? SyncIcon : null,
      },
    ],
    [handleSubmit, isPending, setIsOpen, submitButtonText, validationError],
  )

  return (
    <Dialog title={dialogTitle} onClose={onDialogClose} footerButtons={footerButtons}>
      {children}
    </Dialog>
  )
}
