import {Dialog} from '@primer/react/experimental'
import {useCallback} from 'react'

export interface DeleteCampaignConfirmationDialogProps {
  setIsOpen: (isOpen: boolean) => void
  deleteCampaign: () => void
  disabled: boolean
}

export const DeleteCampaignConfirmationDialog = ({
  setIsOpen,
  deleteCampaign,
  disabled,
}: DeleteCampaignConfirmationDialogProps) => {
  const onDialogClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <Dialog
      title="Delete campaign?"
      onClose={onDialogClose}
      width="large"
      footerButtons={[
        {
          buttonType: 'default',
          content: 'Cancel',
          onClick: () => setIsOpen(false),
          disabled,
        },
        {
          buttonType: 'danger',
          content: 'Delete',
          onClick: () => deleteCampaign(),
          disabled,
        },
      ]}
    >
      <span>Deleting a campaign is a permanent action. Are you sure you want to delete this campaign?</span>
    </Dialog>
  )
}
