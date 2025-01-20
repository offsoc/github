import {AlertIcon} from '@primer/octicons-react'
import {Box, Button, Flash, FormControl, Heading, PageLayout, TextInput, Tooltip} from '@primer/react'
import {useEffect, useRef, useState} from 'react'
import {useNavigate} from '@github-ui/use-navigate'
import {PrivateNetworkConsts} from '../constants/private-network-consts'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import {ComputeService} from '../classes/network-configuration'
import type {NetworkConfiguration} from '../classes/network-configuration'
import type {PrivateNetwork} from '../classes/private-network'
import {PrivateNetworkList} from '../components/PrivateNetworkList'
import {AllowedServicesOptions} from '../components/AllowedServicesOptions'
import {AddPrivateNetworkDialog} from '../components/AddPrivateNetworkDialog'
import {useDebounce} from '@github-ui/use-debounce'

import {
  PrivateNetworkValidationResult,
  NameValidationResult,
  hasNameValidationError,
  getNameValidationError,
  hasPrivateNetworkValidationError,
  getPrivateNetworkValidationError,
  validateNetworkConfigurationName,
  createOrUpdateNetworkConfiguration,
} from '../helpers/network-configuration-helpers'
import type {IUpdatePayload} from '../helpers/network-configuration-helpers'
import {NetworkConfigurationHeading} from '../components/NetworkConfigurationHeading'

export interface EditNetworkConfigurationSettingsPayload {
  networkConfiguration: NetworkConfiguration
  privateNetworks: PrivateNetwork[]
  networkConfigurationsPath: string
  updateNetworkConfigurationPath: string
  newPrivateNetworkPath: string
  findNetworkConfigurationPath: string
  enabledForCodespaces: boolean
  isBusiness: boolean
}
export function EditNetworkConfigurationSettings() {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const payload = useRoutePayload<EditNetworkConfigurationSettingsPayload>()
  const [nameValidationResult, setNameValidationResult] = useState(NameValidationResult.None)
  const [nameValidationIsBusy, setNameValidationIsBusy] = useState(false)
  const [editErrorMessage, setEditErrorMessage] = useState('')
  const [networkConfigurationName, setNetworkConfigurationName] = useState(payload.networkConfiguration.name)
  const [showNewDialog, setShowNewDialog] = useState<boolean>(false)
  const [privateNetworks, setPrivateNetworks] = useState<PrivateNetwork[]>(payload.privateNetworks)
  const [privateNetworkValidationResult, setPrivateNetworkValidationResult] = useState(
    PrivateNetworkValidationResult.None,
  )
  const [selectedService, setSelectedService] = useState<ComputeService>(payload.networkConfiguration.computeService)
  const [canAddNewNetwork, setCanAddNewNetwork] = useState<boolean>(
    selectedService === ComputeService.Codespaces || privateNetworks.length === 0,
  )
  const serviceAgnostic = payload.enabledForCodespaces

  useEffect(() => {
    setCanAddNewNetwork(selectedService === ComputeService.Codespaces || privateNetworks.length === 0)
  }, [selectedService, privateNetworks])

  const newNetworkButtonClick = () => {
    if (canAddNewNetwork) {
      setShowNewDialog(true)
    }
  }

  const saveChanges = async () => {
    // Validation
    if (privateNetworks.length === 0) {
      // This is the only place we can do this, but don't return so we can focus the name field if it's invalid
      setPrivateNetworkValidationResult(PrivateNetworkValidationResult.MissingNetwork)
      return
    }

    if (nameValidationResult === NameValidationResult.None) {
      // Skip server-side checks
      await validateName(networkConfigurationName, true)
    }

    // Handle invalid values
    if (hasNameValidationError(nameValidationResult)) {
      nameInputRef.current?.focus()
      return
    }

    const request_body: IUpdatePayload = {
      configurationId: payload.networkConfiguration.id,
      computeService: selectedService,
      privateNetworkIds: privateNetworks.map(n => n.id),
    }

    if (networkConfigurationName !== '' && nameValidationResult === NameValidationResult.Success) {
      request_body.name = networkConfigurationName.trim()
    }

    const result = await createOrUpdateNetworkConfiguration(
      payload.updateNetworkConfigurationPath,
      payload.networkConfigurationsPath,
      request_body,
    )

    if (result.success) {
      setEditErrorMessage('')
      navigate(result.link)
    } else {
      switch (result.code) {
        case 'NetworkResourceInUse':
          setPrivateNetworkValidationResult(PrivateNetworkValidationResult.NetworkResourceInUse)
          break
        case 'UnsupportedResourceLocation':
          setPrivateNetworkValidationResult(PrivateNetworkValidationResult.UnsupportedResourceLocation)
          break
        case 'DuplicateLocation':
          setPrivateNetworkValidationResult(PrivateNetworkValidationResult.DuplicateLocation)
          break
        case 'DisplayNameInUse':
          setNameValidationResult(NameValidationResult.DisplayNameInUse)
          nameInputRef.current?.focus()
          break
        default:
          setEditErrorMessage(`There was an error updating the network configuration: ${result.message}`)
          break
      }
    }
  }

  const onNewDialogClose = () => {
    setShowNewDialog(false)
  }

  const onNewDialogAccept = (newPrivateNetwork: PrivateNetwork) => {
    setPrivateNetworks([...privateNetworks, newPrivateNetwork])
    setPrivateNetworkValidationResult(PrivateNetworkValidationResult.None)
    setShowNewDialog(false)
  }

  const removePrivateNetwork = (removedPrivateNetwork: PrivateNetwork) => {
    setPrivateNetworks(privateNetworks.filter(n => n.id !== removedPrivateNetwork.id))
    setPrivateNetworkValidationResult(PrivateNetworkValidationResult.None)
  }

  const debouncedValidate = useDebounce((name: string) => {
    validateName(name)
  }, 300)

  useEffect(() => {
    debouncedValidate(networkConfigurationName)
  }, [debouncedValidate, networkConfigurationName, payload.networkConfiguration.name])

  async function validateName(name: string, formatOnly?: boolean): Promise<void> {
    setNameValidationIsBusy(true)

    try {
      if (name === payload.networkConfiguration.name) {
        setNameValidationResult(NameValidationResult.Success)
        setNetworkConfigurationName(name)
      } else {
        const validationResult = formatOnly
          ? await validateNetworkConfigurationName(name)
          : await validateNetworkConfigurationName(name, payload.findNetworkConfigurationPath)
        setNameValidationResult(validationResult)
        if (validationResult === NameValidationResult.Success) {
          setNetworkConfigurationName(name)
        }
      }
    } finally {
      setNameValidationIsBusy(false)
    }
  }

  const addNewNetworkButton = (
    <Button
      onClick={newNetworkButtonClick}
      aria-labelledby="private-network-title"
      aria-describedby="private-network-caption private-network-validation"
      variant="primary"
      inactive={!canAddNewNetwork}
    >
      {PrivateNetworkConsts.addAzureVirtualNetwork}
    </Button>
  )

  return (
    <PageLayout containerWidth="full" sx={{padding: 0}}>
      <PageLayout.Header>
        <div className="border-bottom">
          <NetworkConfigurationHeading
            link={NetworkConfigurationConsts.networkSettingsUrl(
              payload.networkConfigurationsPath,
              payload.networkConfiguration.id,
            )}
            previousPageText={payload.networkConfiguration.name}
            currentPageText={`Edit ${payload.networkConfiguration.name} configuration`}
            isBusiness={payload.isBusiness}
          />
          <Heading as="h2" className="h2 text-normal mb-2">
            Edit {payload.networkConfiguration.name} configuration
          </Heading>
        </div>
      </PageLayout.Header>
      <PageLayout.Content as="div">
        {editErrorMessage.trim().length > 0 && (
          <div className="pb-4">
            <Flash variant="danger">
              <AlertIcon size={16} />
              {editErrorMessage}
            </Flash>
          </div>
        )}
        <Box sx={{mb: '16px'}} aria-live="polite">
          <FormControl required>
            <FormControl.Label>{NetworkConfigurationConsts.nameLabel}</FormControl.Label>
            <TextInput
              type="text"
              value={networkConfigurationName}
              sx={{width: '30%'}}
              onChange={e => setNetworkConfigurationName(e.target.value.trim())}
              aria-describedby="name-input-caption name-input-validation"
              loading={nameValidationIsBusy}
              ref={nameInputRef}
            />
            {hasNameValidationError(nameValidationResult) && (
              <FormControl.Validation id="name-input-validation" variant="error">
                {getNameValidationError(nameValidationResult)}
              </FormControl.Validation>
            )}
            {!hasNameValidationError(nameValidationResult) && (
              <FormControl.Caption id="name-input-caption">{PrivateNetworkConsts.invalidNameError}</FormControl.Caption>
            )}
          </FormControl>
        </Box>
        <div>
          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <div>
              <strong id="private-network-title">{PrivateNetworkConsts.azurePrivateNetworking}</strong>
              <p className="color-fg-muted text-small mb-2" id="private-network-caption">
                {serviceAgnostic
                  ? PrivateNetworkConsts.azurePrivateNetworkingDescriptionServiceAgnostic
                  : PrivateNetworkConsts.azurePrivateNetworkingDescription}
              </p>
            </div>
            {payload.enabledForCodespaces && (
              <Box sx={{justifyContent: 'flex-end'}}>
                {canAddNewNetwork ? (
                  addNewNetworkButton
                ) : (
                  <Tooltip aria-label="Support for multiple networks is currently only available with Codespaces" wrap>
                    {addNewNetworkButton}
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
          {showNewDialog && (
            <AddPrivateNetworkDialog
              newPrivateNetworkPath={payload.newPrivateNetworkPath}
              onDismiss={onNewDialogClose}
              onAdd={onNewDialogAccept}
              existingPrivateNetwork={privateNetworks}
            />
          )}
          <div aria-live="polite">
            <FormControl required>
              <FormControl.Label visuallyHidden={true}>{PrivateNetworkConsts.azurePrivateNetworking}</FormControl.Label>
              <PrivateNetworkList
                privateNetworks={privateNetworks}
                validationStatus={
                  hasPrivateNetworkValidationError(privateNetworkValidationResult) ? 'error' : 'success'
                }
                onRemove={removePrivateNetwork}
                onShowNewDialog={() => setShowNewDialog(true)}
                enabledForCodespaces={payload.enabledForCodespaces}
                ariaLabelledBy="private-network-title"
                ariaDescribedBy="private-network-caption private-network-validation"
              />
              {hasPrivateNetworkValidationError(privateNetworkValidationResult) && (
                <FormControl.Validation
                  id="private-network-validation"
                  variant="error"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <span>
                    {getPrivateNetworkValidationError(privateNetworkValidationResult, privateNetworks[0]?.location)}
                  </span>
                </FormControl.Validation>
              )}
            </FormControl>
          </div>
          {payload.enabledForCodespaces && (
            <AllowedServicesOptions
              enabledForCodespaces={payload.enabledForCodespaces}
              actionsSelectable={privateNetworks.length <= 1}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
            />
          )}
        </div>
      </PageLayout.Content>
      <PageLayout.Footer>
        <Box sx={{display: 'flex', flexDirection: 'row'}}>
          <Button variant="primary" onClick={saveChanges}>
            Save changes
          </Button>
          <Box sx={{ml: 2}}>
            <Button variant="default" onClick={() => navigate(payload.networkConfigurationsPath)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </PageLayout.Footer>
    </PageLayout>
  )
}
