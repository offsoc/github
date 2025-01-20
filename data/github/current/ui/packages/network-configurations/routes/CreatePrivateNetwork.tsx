import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Button, Flash, FormControl, Heading, PageLayout, TextInput, Tooltip} from '@primer/react'
import {AlertIcon} from '@primer/octicons-react'
import {PrivateNetworkConsts} from '../constants/private-network-consts'
import {useEffect, useRef, useState} from 'react'
import {useNavigate} from '@github-ui/use-navigate'
import {PrivateNetworkList} from '../components/PrivateNetworkList'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import type {PrivateNetwork} from '../classes/private-network'
import {AllowedServicesOptions} from '../components/AllowedServicesOptions'
import {AddPrivateNetworkDialog} from '../components/AddPrivateNetworkDialog'
import {NetworkConfigurationHeading} from '../components/NetworkConfigurationHeading'
import {ComputeService} from '../classes/network-configuration'
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

export interface CreatePrivateNetworkPayload {
  networkConfigurationsPath: string
  newPrivateNetworkPath: string
  updateNetworkConfigurationPath: string
  findNetworkConfigurationPath: string
  enabledForCodespaces: boolean
  computeService: ComputeService
  isBusiness: boolean
}

export function CreatePrivateNetwork() {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const payload = useRoutePayload<CreatePrivateNetworkPayload>()
  const [nameValidationResult, setNameValidationResult] = useState(NameValidationResult.None)
  const [nameValidationIsBusy, setNameValidationIsBusy] = useState(false)
  const [creationErrorMessage, setCreationErrorMessage] = useState('')
  const [networkConfigurationName, setNetworkConfigurationName] = useState('')
  const [showNewDialog, setShowNewDialog] = useState<boolean>(false)
  const [privateNetworks, setPrivateNetworks] = useState<PrivateNetwork[]>([])
  const [privateNetworkValidationResult, setPrivateNetworkValidationResult] = useState(
    PrivateNetworkValidationResult.None,
  )
  const serviceAgnostic = payload.enabledForCodespaces
  const [selectedService, setSelectedService] = useState<ComputeService>(
    payload.enabledForCodespaces ? ComputeService.None : ComputeService.Actions,
  )
  const [canAddNewNetwork, setCanAddNewNetwork] = useState<boolean>(
    selectedService === ComputeService.Codespaces || privateNetworks.length === 0,
  )

  useEffect(() => {
    setCanAddNewNetwork(selectedService === ComputeService.Codespaces || privateNetworks.length === 0)
  }, [selectedService, privateNetworks])

  const newNetworkButtonClick = () => {
    if (canAddNewNetwork) {
      setShowNewDialog(true)
    }
  }

  const registerNetworkConfiguration = async () => {
    // Validation
    if (privateNetworks.length === 0) {
      // This is the only place we can do this, but don't return so we can focus the name field if it's invalid
      setPrivateNetworkValidationResult(PrivateNetworkValidationResult.MissingNetwork)
      return
    }

    if (nameValidationResult === NameValidationResult.None) {
      // Skip server-side checks
      await validateName(networkConfigurationName, true)
      return
    }

    // Handle invalid values
    if (hasNameValidationError(nameValidationResult)) {
      nameInputRef.current?.focus()
      return
    }

    const result = await createOrUpdateNetworkConfiguration(
      payload.updateNetworkConfigurationPath,
      payload.networkConfigurationsPath,
      {
        privateNetworkIds: privateNetworks.map(n => n.id),
        computeService: selectedService,
        name: networkConfigurationName.trim(),
      },
    )

    if (result.success) {
      setCreationErrorMessage('')
      navigate(result.link)
    } else {
      switch (result.code) {
        case 'NetworkResourceInUse':
          setPrivateNetworkValidationResult(PrivateNetworkValidationResult.NetworkResourceInUse)
          break
        case 'UnsupportedResourceLocation':
          setPrivateNetworkValidationResult(PrivateNetworkValidationResult.UnsupportedResourceLocation)
          break
        case 'DisplayNameInUse':
          setNameValidationResult(NameValidationResult.DisplayNameInUse)
          nameInputRef.current?.focus()
          break
        default:
          setCreationErrorMessage(`There was an error creating the network configuration: ${result.message}`)
          break
      }
    }
  }

  const onNewDialogClose = () => {
    setShowNewDialog(false)
  }

  const onNewDialogAccept = (newPrivateNetwork: PrivateNetwork) => {
    setPrivateNetworks(networks => [...networks, newPrivateNetwork])
    setPrivateNetworkValidationResult(PrivateNetworkValidationResult.None)
    setShowNewDialog(false)
  }

  const removePrivateNetwork = (removedPrivateNetwork: PrivateNetwork) => {
    setPrivateNetworks(privateNetworks.filter(n => n.id !== removedPrivateNetwork.id))
    setPrivateNetworkValidationResult(PrivateNetworkValidationResult.None)
  }

  async function validateName(name: string, formatOnly?: boolean): Promise<void> {
    setNameValidationIsBusy(true)
    try {
      const validationResult = formatOnly
        ? await validateNetworkConfigurationName(name)
        : await validateNetworkConfigurationName(name, payload.findNetworkConfigurationPath)
      setNameValidationResult(validationResult)
      if (validationResult === NameValidationResult.Success) {
        setNetworkConfigurationName(name)
      } else {
        setNetworkConfigurationName('')
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
    <PageLayout containerWidth="full" padding="none">
      <PageLayout.Header>
        <div className="border-bottom">
          <NetworkConfigurationHeading
            link={payload.networkConfigurationsPath}
            previousPageText={NetworkConfigurationConsts.hostedComputeNetworkingTitle}
            currentPageText={NetworkConfigurationConsts.newNetworkConfiguration}
            isBusiness={payload.isBusiness}
          />
          <Heading as="h2" className="h2 text-normal">
            {NetworkConfigurationConsts.newNetworkConfiguration}
          </Heading>
          <p className="color-fg-muted mb-2">
            {serviceAgnostic
              ? PrivateNetworkConsts.setUpPrivateNetworkDescriptionServiceAgnostic
              : PrivateNetworkConsts.setUpPrivateNetworkDescription}
          </p>
        </div>
      </PageLayout.Header>
      <PageLayout.Content as="div">
        {creationErrorMessage.trim().length > 0 && (
          <div className="pb-4">
            <Flash variant="danger">
              <AlertIcon size={16} />
              {creationErrorMessage}
            </Flash>
          </div>
        )}
        <Box sx={{mb: '16px'}} aria-live="polite">
          <FormControl required>
            <FormControl.Label>{NetworkConfigurationConsts.nameLabel}</FormControl.Label>
            <TextInput
              type="text"
              sx={{width: '30%'}}
              onBlur={e => validateName(e.target.value)}
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
              <p className="color-fg-muted text-small" id="private-network-caption">
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
              currentResourceId={null}
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
                <FormControl.Validation id="private-network-validation" variant="error">
                  {getPrivateNetworkValidationError(
                    privateNetworkValidationResult,
                    privateNetworks[privateNetworks.length - 1]?.location,
                  )}
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
        <Button variant="primary" onClick={registerNetworkConfiguration}>
          {PrivateNetworkConsts.createConfiguration}
        </Button>
      </PageLayout.Footer>
    </PageLayout>
  )
}
