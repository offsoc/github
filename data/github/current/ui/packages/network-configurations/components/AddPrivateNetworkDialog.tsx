import {Box, Flash, FormControl, Link, TextInput} from '@primer/react'
import {useState, useCallback} from 'react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {PrivateNetwork} from '../classes/private-network'
import {PrivateNetworkConsts} from '../constants/private-network-consts'
import {PrivateNetworkSummary} from '../components/PrivateNetworkSummary'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import {Dialog} from '@primer/react/experimental'

const formBoxStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  borderColor: 'border.default',
  rowGap: 3,
}

enum ValidationResult {
  None,
  Success,
  EmptyId,
  NotFound,
  NetworkAlreadyRegistered, // Network is registered to a different configuration
  NetworkAlreadyInConfiguration, // Network is already in the configuration
  NetworkInDifferentOrg,
  ApiError,
}

export interface IAddPrivateNetworkDialogProps {
  newPrivateNetworkPath: string
  onAdd: (privateNetwork: PrivateNetwork) => void
  onDismiss: () => void
  currentResourceId?: string | null
  existingPrivateNetwork: PrivateNetwork[]
}

export function AddPrivateNetworkDialog(props: IAddPrivateNetworkDialogProps) {
  const [resourceIdValidationResult, setResourceIdValidationResult] = useState(ValidationResult.None)
  const [validationDetails, setValidationDetails] = useState<string>('')
  const [resourceIdLoading, setResourceIdLoading] = useState<boolean>(false)
  const [privateNetwork, setPrivateNetwork] = useState<PrivateNetwork | null>(null)

  const validateResourceId = async (settingsIdString: string) => {
    clearForm()
    if (settingsIdString.trim() === '') {
      setResourceIdValidationResult(ValidationResult.EmptyId)
      return
    }
    setResourceIdLoading(true)
    try {
      if (props.existingPrivateNetwork.find(network => network.id === settingsIdString)) {
        setResourceIdValidationResult(ValidationResult.NetworkAlreadyInConfiguration)
        return
      }

      const result = await verifiedFetchJSON(props.newPrivateNetworkPath, {
        method: 'PUT',
        body: {
          networkSettingsId: settingsIdString,
        },
      })

      const data = await result.json()
      if (result.ok) {
        if (props.currentResourceId === data.privateNetwork.id) {
          setResourceIdValidationResult(ValidationResult.Success)
          setPrivateNetwork(data.privateNetwork)
        } else if (data.privateNetwork.networkConfigurationId) {
          setResourceIdValidationResult(ValidationResult.NetworkAlreadyRegistered)
        } else {
          setResourceIdValidationResult(ValidationResult.Success)
          setPrivateNetwork(data.privateNetwork)
        }
      } else {
        switch (data.error.code) {
          case 'NotFound':
            setResourceIdValidationResult(ValidationResult.NotFound)
            break
          case 'InvalidOrganizationId':
          case 'InvalidBusinessId':
            setResourceIdValidationResult(ValidationResult.NetworkInDifferentOrg)
            break
          default:
            setValidationDetails(data.error.message)
            setResourceIdValidationResult(ValidationResult.ApiError)
            break
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : JSON.stringify(e)
      setValidationDetails(message)
      setResourceIdValidationResult(ValidationResult.ApiError)
    } finally {
      setResourceIdLoading(false)
    }
  }

  function clearForm() {
    setResourceIdLoading(false)
    setValidationDetails('')
    setResourceIdValidationResult(ValidationResult.None)
    setPrivateNetwork(null)
  }

  const onDismiss = props.onDismiss
  const onNewDialogClose = useCallback(() => {
    clearForm()
    onDismiss()
  }, [onDismiss])

  const getFormValidationComponent = () => {
    switch (resourceIdValidationResult) {
      case ValidationResult.Success:
        return (
          <FormControl.Validation id="settings-id-input-validation" variant="success">
            {PrivateNetworkConsts.validSettingsId}
          </FormControl.Validation>
        )
      case ValidationResult.NotFound:
        return (
          <FormControl.Validation id="settings-id-input-validation" variant="error">
            {PrivateNetworkConsts.settingsIdNotFound}
          </FormControl.Validation>
        )
      case ValidationResult.NetworkAlreadyRegistered:
        return (
          <FormControl.Validation id="settings-id-input-validation" variant="error">
            {PrivateNetworkConsts.settingsIdAlreadyInUse}
          </FormControl.Validation>
        )
      case ValidationResult.NetworkAlreadyInConfiguration:
        return (
          <FormControl.Validation id="settings-id-input-validation" variant="error">
            {PrivateNetworkConsts.settingsIdAlreadyInCurrentConfiguration}
          </FormControl.Validation>
        )
      case ValidationResult.NetworkInDifferentOrg:
        return (
          <FormControl.Validation id="settings-id-input-validation" variant="error">
            {PrivateNetworkConsts.settingsBelongsToAnotherOrg}
          </FormControl.Validation>
        )
      case ValidationResult.ApiError:
        return (
          <FormControl.Validation id="settings-id-input-validation" variant="error">
            <p>
              {PrivateNetworkConsts.unexpectedErrorOccurred}
              {validationDetails}
            </p>
            <Link href={PrivateNetworkConsts.resourceIdLearnMoreLink}>
              {PrivateNetworkConsts.resourceIdLearnMoreText}
            </Link>
          </FormControl.Validation>
        )
      case ValidationResult.None:
      case ValidationResult.EmptyId:
      default:
        return <></>
    }
  }

  return (
    <Dialog
      title={PrivateNetworkConsts.addAzureVirtualNetwork}
      onClose={onNewDialogClose}
      width="large"
      footerButtons={[
        {
          buttonType: 'normal',
          content: 'Cancel',
          onClick: onNewDialogClose,
        },
        {
          buttonType: 'primary',
          content: 'Add Azure Virtual Network',
          onClick: () => props.onAdd(privateNetwork!),
          disabled: resourceIdValidationResult !== ValidationResult.Success,
        },
      ]}
    >
      <div>
        <Box sx={{pb: 2}}>
          <Flash>
            Limited Azure regions are supported during public beta, to request an additional region{' '}
            <Link inline href={NetworkConfigurationConsts.formLink}>
              please fill out this form
            </Link>
            . You can view{' '}
            <Link inline href={NetworkConfigurationConsts.docLink}>
              supported regions in our docs
            </Link>
            .
          </Flash>
        </Box>
        <Box sx={formBoxStyle}>
          <FormControl required>
            <FormControl.Label>{PrivateNetworkConsts.azureNetworkResourceIdLabel}</FormControl.Label>
            <TextInput
              sx={{width: '100%'}}
              onBlur={e => validateResourceId(e.target.value.trim())}
              aria-invalid={
                resourceIdValidationResult !== ValidationResult.None &&
                resourceIdValidationResult !== ValidationResult.Success
              }
              loading={resourceIdLoading}
            />
            {getFormValidationComponent()}
            {(resourceIdValidationResult === ValidationResult.None ||
              resourceIdValidationResult === ValidationResult.EmptyId) && (
              <FormControl.Caption id="settings-id-input-caption">
                <Link href={PrivateNetworkConsts.resourceIdLearnMoreLink}>
                  {PrivateNetworkConsts.settingsIdCaption}
                </Link>
              </FormControl.Caption>
            )}
          </FormControl>
          <PrivateNetworkSummary privateNetwork={privateNetwork} />
        </Box>
      </div>
    </Dialog>
  )
}
