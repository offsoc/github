import {Dialog} from '@primer/react/experimental'
import {useCallback} from 'react'

export interface SecurityCampaignsLimitDialogProps {
  maxCampaigns: number
  setIsOpen: (isOpen: boolean) => void
}

export function SecurityCampaignsLimitDialog({maxCampaigns, setIsOpen}: SecurityCampaignsLimitDialogProps) {
  const onDialogClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <>
      <Dialog
        title="Campaign limit reached"
        onClose={onDialogClose}
        width="small"
        footerButtons={[
          {
            buttonType: 'default',
            content: 'I understand',
            onClick: () => setIsOpen(false),
          },
        ]}
      >
        <span>
          This organization has reached the limit of <b>{maxCampaigns} active campaigns</b>. To create a new campaign,
          first delete an existing one.
        </span>
      </Dialog>
    </>
  )
}
