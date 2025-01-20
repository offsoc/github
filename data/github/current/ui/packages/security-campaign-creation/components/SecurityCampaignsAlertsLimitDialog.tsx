import {Text} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useCallback} from 'react'

export interface SecurityCampaignsAlertsLimitDialogProps {
  maxAlerts: number
  setIsOpen: (isOpen: boolean) => void
  continueToCreationDialog: () => void
}

export function SecurityCampaignsAlertsLimitDialog({
  maxAlerts,
  setIsOpen,
  continueToCreationDialog,
}: SecurityCampaignsAlertsLimitDialogProps) {
  const onDialogClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <>
      <Dialog
        title="This looks like a big campaign"
        onClose={onDialogClose}
        width="large"
        footerButtons={[
          {
            buttonType: 'default',
            content: 'Keep filtering',
            onClick: () => setIsOpen(false),
          },
          {
            buttonType: 'danger',
            content: 'I understand, proceed anyway',
            onClick: () => continueToCreationDialog(),
          },
        ]}
      >
        <p>
          Security campaigns aim to identify specific threats and set clear, achievable goals for developers. However,{' '}
          campaigns with a high number of alerts per repository can place significant strain on developers.
        </p>
        <Text sx={{fontWeight: 'bold'}} as="p">
          Consider narrowing down the list of alerts before proceeding. If you continue, only the first {maxAlerts}{' '}
          alerts will be added to the campaign.
        </Text>
      </Dialog>
    </>
  )
}
