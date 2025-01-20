import {Dialog} from '@primer/react/experimental'
import {useCallback} from 'react'

export interface SecurityCampaignsNoAlertsDialogProps {
  setIsOpen: (isOpen: boolean) => void
}

export function SecurityCampaignsNoAlertsDialog({setIsOpen}: SecurityCampaignsNoAlertsDialogProps) {
  const onDialogClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <Dialog title="That looks like an empty campaign" onClose={onDialogClose} width="large">
      <p>There are no alerts that match the current filter. A campaign must include at least 1 alert.</p>
    </Dialog>
  )
}
