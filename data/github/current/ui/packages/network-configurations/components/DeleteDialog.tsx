import {Octicon, Box, Button, Text, FormControl, TextInput, Flash} from '@primer/react'
import {XIcon} from '@primer/octicons-react'
import {useCallback, useState} from 'react'
import {Dialog} from '@primer/react/experimental'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useNavigate} from '@github-ui/use-navigate'

interface IDeleteDialogProps {
  setShowDeleteDialog: (showDialog: boolean) => void
  name: string
  id: string
  removeNetworkConfigurationPath: string
  networkConfigurationsPath?: string | null
  removeNetworkConfigurationFunction?: (networkId: string) => void | null
  enabledForCodespaces: boolean
}

export function DeleteDialog(props: IDeleteDialogProps) {
  const {addToast} = useToastContext()
  const navigate = useNavigate()
  const [isCorrectConfirmationDelete, setIsCorrectConfirmationDelete] = useState(false)
  const [submitClickedDelete, setSubmitClickedDelete] = useState(false)
  const onDeleteDialogClose = useCallback(() => {
    setIsCorrectConfirmationDelete(false)
    setSubmitClickedDelete(false)
    props.setShowDeleteDialog(false)
  }, [props])
  const removeNetworkConfiguration = async () => {
    setSubmitClickedDelete(true)
    if (isCorrectConfirmationDelete) {
      props.setShowDeleteDialog(false)
      try {
        const result = await verifiedFetchJSON(props.removeNetworkConfigurationPath, {
          method: 'DELETE',
          body: {
            configurationId: props.id,
          },
        })
        if (result.ok) {
          if (props.removeNetworkConfigurationFunction) {
            props.removeNetworkConfigurationFunction(props.id)
          } else if (props.networkConfigurationsPath) {
            navigate(props.networkConfigurationsPath)
          }
        } else {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: 'There was an error deleting the network configuration',
          })
        }
      } catch (e) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'There was an error deleting the network configuration',
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
            onChange={e => setIsCorrectConfirmationDelete(e.target.value.trim() === props.name)}
          />
          {submitClickedDelete && !isCorrectConfirmationDelete && (
            <FormControl.Validation variant="error">Must match {props.name}</FormControl.Validation>
          )}
        </FormControl>
        <Button block variant="danger" onClick={removeNetworkConfiguration} className="ml-0">
          I understand, delete this network configuration
        </Button>
      </Dialog.Footer>
    )
  }
  return (
    <Dialog
      title="Delete network configuration"
      onClose={onDeleteDialogClose}
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
          <Flash variant="warning">
            Deleting a network configuration will remove it from your enterprise account and from all organizations that
            have access to this configuration.
          </Flash>
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Octicon icon={XIcon} size={16} sx={{color: 'danger.fg', mt: 1, mb: 1}} />
            <Text sx={{pl: 2}}>
              All associated <strong>workflows</strong> using this configuration will stop running.
            </Text>
          </Box>
          {props.enabledForCodespaces && (
            <Box sx={{display: 'flex', flexDirection: 'row'}}>
              <Octicon icon={XIcon} size={16} sx={{color: 'danger.fg', mt: 1, mb: 1}} />
              <Text sx={{pl: 2}}>
                <strong>Codespaces</strong> configured to use this configuration will no longer have access to internal
                resources granted to the given configuration.
              </Text>
            </Box>
          )}
          {props.enabledForCodespaces ? (
            <div>
              Before deleting, please consider updating the network settings for runner groups using this configuration
              as well as updating or removing any codespaces org policies that reference this configuration.
            </div>
          ) : (
            <div>
              Before disabling, please consider updating the network settings for runner groups using this
              configuration.
            </div>
          )}
        </Box>
      </div>
    </Dialog>
  )
}
