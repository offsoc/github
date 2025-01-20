import {Button, Box, Octicon, Text} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useCallback} from 'react'
import {XIcon} from '@primer/octicons-react'
import {HostedComputeNetworkingConsts} from '../constants/hosted-compute-networking-consts'

interface IDisableHostedComputeNetworkingDialogProps {
  setShowDisableDialog: (showDialog: boolean) => void
  updatePath: string
  updateMethod: string
  updatePermission: (canCreate: boolean) => void
}

export function DisableHostedComputeNetworkingDialog(props: IDisableHostedComputeNetworkingDialogProps) {
  const onDisableDialogClose = useCallback(() => {
    props.setShowDisableDialog(false)
  }, [props])

  const renderFooter = () => {
    return (
      <Dialog.Footer>
        <Button type="submit" block variant="danger" onClick={handleDialogSubmit}>
          Disable creation of network configurations
        </Button>
      </Dialog.Footer>
    )
  }

  const handleDialogSubmit = () => {
    props.setShowDisableDialog(false)
    props.updatePermission(false)
  }

  return (
    <Dialog
      title={HostedComputeNetworkingConsts.HostedComputeNetworkingDialogTitle}
      onClose={onDisableDialogClose}
      width="large"
      renderFooter={renderFooter}
    >
      <div>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Octicon icon={XIcon} size={16} sx={{color: 'danger.fg', mt: 1, mb: 1}} />
            <Text sx={{pl: 2}}>{HostedComputeNetworkingConsts.HostedComputeNetworkingDialogDisabledAbility}</Text>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Octicon icon={XIcon} size={16} sx={{color: 'danger.fg', mt: 1, mb: 1}} />
            <Text sx={{pl: 2}}>{HostedComputeNetworkingConsts.HostedComputeNetworkingDialogDisabledOwned}</Text>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
            <span>{HostedComputeNetworkingConsts.HostedComputeNetworkingDialogDisabledWorkflow}</span>
            <span>{HostedComputeNetworkingConsts.HostedComputeNetworkingDialogDisabledRecommendation}</span>
          </Box>
        </Box>
      </div>
    </Dialog>
  )
}
