import {Octicon, Box, Button, Text, FormControl, TextInput} from '@primer/react'
import {CheckIcon, XIcon} from '@primer/octicons-react'
import {useCallback, useState} from 'react'
import {Dialog} from '@primer/react/experimental'
import {ComputeService} from '../classes/network-configuration'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import type {IUpdatePayload} from '../helpers/network-configuration-helpers'
import {createOrUpdateNetworkConfiguration} from '../helpers/network-configuration-helpers'

interface IDisableDialogProps {
  setShowDisableDialog: (showDialog: boolean) => void
  name: string
  id: string
  networkConfigurationsPath: string
  updateNetworkConfigurationPath: string
  setConfigurationDisabled: (disabled: boolean) => void
}

export function DisableDialog(props: IDisableDialogProps) {
  const {addToast} = useToastContext()
  const [isCorrectConfirmation, setIsCorrectConfirmation] = useState(false)
  const [submitClicked, setSubmitClicked] = useState(false)
  const onDisableDialogClose = useCallback(() => {
    setIsCorrectConfirmation(false)
    setSubmitClicked(false)
    props.setShowDisableDialog(false)
  }, [props])

  const updateNetworkConfiguration = async () => {
    setSubmitClicked(true)
    if (isCorrectConfirmation) {
      props.setShowDisableDialog(false)
      try {
        const requestBody: IUpdatePayload = {
          configurationId: props.id,
          computeService: ComputeService.None,
        }

        const result = await createOrUpdateNetworkConfiguration(
          props.updateNetworkConfigurationPath,
          props.networkConfigurationsPath,
          requestBody,
        )

        if (result.success) {
          if (props.setConfigurationDisabled) {
            props.setConfigurationDisabled(true)
          }
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'success',
            message: 'Service updated successfully',
          })
        } else {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: 'There was an error updating the service',
          })
        }
      } catch (e) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'There was an error updating the service',
        })
      }
    }
  }
  const renderFooter = () => {
    return (
      <Dialog.Footer sx={{display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'flex-start'}}>
        <FormControl required>
          <FormControl.Label sx={{fontWeight: 'normal'}}>
            Please type <b>{props.name}</b> to confirm.
          </FormControl.Label>
          <TextInput
            block
            aria-label={`Please type ${props.name} to confirm`}
            name={`Please type ${props.name} to confirm`}
            onChange={e => setIsCorrectConfirmation(e.target.value.trim() === props.name)}
          />
          {submitClicked && !isCorrectConfirmation && (
            <FormControl.Validation variant="error">Must match {props.name}</FormControl.Validation>
          )}
        </FormControl>
        <Button block variant="danger" onClick={updateNetworkConfiguration} className="ml-0">
          I understand, disable this network configuration
        </Button>
      </Dialog.Footer>
    )
  }
  return (
    <Dialog
      title="Disable network configurations"
      onClose={onDisableDialogClose}
      renderFooter={renderFooter}
      width="large"
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
            <Text sx={{pl: 2}}>
              All associated <strong>workflows</strong> using this configuration will stop running.
            </Text>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Octicon icon={CheckIcon} size={16} sx={{color: 'success.fg', mt: 1, mb: 1}} />
            <Text sx={{pl: 2}}>
              This network configuration will still be available and can be accessed inside the enterprise account.
            </Text>
          </Box>
          <div>
            Before disabling, please consider updating the network settings for runner groups using this configuration.
          </div>
        </Box>
      </div>
    </Dialog>
  )
}
