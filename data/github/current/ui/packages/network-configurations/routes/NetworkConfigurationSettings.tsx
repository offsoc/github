import {
  ActionMenu,
  ActionList,
  Box,
  Button,
  Flash,
  Heading,
  IconButton,
  Link,
  Octicon,
  PageLayout,
  RelativeTime,
} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import type {NetworkConfiguration, RunnerGroup} from '../classes/network-configuration'
import type {PrivateNetwork} from '../classes/private-network'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {KebabHorizontalIcon, AlertIcon} from '@primer/octicons-react'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import {DisableDialog} from '../components/DisableDialog'
import {DeleteDialog} from '../components/DeleteDialog'
import {useState} from 'react'
import {useNavigate} from '@github-ui/use-navigate'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {RunnerGroupListItem} from '../components/RunnerGroupListItem'
import {PrivateNetworkList} from '../components/PrivateNetworkList'
import {NetworkConfigurationHeading} from '../components/NetworkConfigurationHeading'
import {ComputeService} from '../classes/network-configuration'
import {createOrUpdateNetworkConfiguration, type IUpdatePayload} from '../helpers/network-configuration-helpers'

export interface NetworkConfigurationSettingsPayload {
  networkConfiguration: NetworkConfiguration
  privateNetworks: PrivateNetwork[]
  networkConfigurationsPath: string
  updateNetworkConfigurationPath: string
  removeNetworkConfigurationPath: string
  runnerGroupPath: string
  enabledForCodespaces: boolean
  isBusiness: boolean
  canEditNetworkConfiguration: boolean
}

export function NetworkConfigurationSettings() {
  const payload = useRoutePayload<NetworkConfigurationSettingsPayload>()
  const navigate = useNavigate()
  const {addToast} = useToastContext()
  const [configurationDisabled, setConfigurationDisabled] = useState(
    payload.networkConfiguration.computeService === ComputeService.None,
  )
  const runnerGroups: RunnerGroup[] = payload.networkConfiguration.runnerGroups
  const enableConfigurationForActions = async () => {
    try {
      const request_body: IUpdatePayload = {
        configurationId: payload.networkConfiguration.id,
        computeService: ComputeService.Actions,
      }

      const result = await createOrUpdateNetworkConfiguration(
        payload.updateNetworkConfigurationPath,
        payload.networkConfigurationsPath,
        request_body,
      )

      if (result.success) {
        setConfigurationDisabled(false)
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

  const navigateToEdit = () => {
    navigate(
      NetworkConfigurationConsts.editNetworkConfigurationPath(
        payload.networkConfigurationsPath,
        payload.networkConfiguration.id,
      ),
    )
  }

  return (
    <PageLayout containerWidth="full" sx={{padding: 0}}>
      <PageLayout.Header>
        <NetworkConfigurationHeading
          link={payload.networkConfigurationsPath}
          previousPageText={NetworkConfigurationConsts.hostedComputeNetworkingTitle}
          currentPageText={payload.networkConfiguration.name}
          isBusiness={payload.isBusiness}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
          }}
        >
          <div>
            <Heading as="h2" className="h2 text-normal">
              {payload.networkConfiguration.name}
            </Heading>
            <p className="color-fg-muted">
              {payload.networkConfiguration.service} created{' '}
              <RelativeTime date={new Date(payload.networkConfiguration.createdOn)} tense="past" />
            </p>
          </div>
          {payload.canEditNetworkConfiguration && (
            <Box sx={{display: 'flex', flexDirection: 'row', gap: 2}}>
              <Button onClick={navigateToEdit}>Edit configuration</Button>
              {!configurationDisabled && !payload.enabledForCodespaces ? (
                <DisableDeleteActionMenu
                  name={payload.networkConfiguration.name}
                  id={payload.networkConfiguration.id}
                  removeNetworkConfigurationPath={payload.removeNetworkConfigurationPath}
                  updateNetworkConfigurationPath={payload.updateNetworkConfigurationPath}
                  networkConfigurationsPath={payload.networkConfigurationsPath}
                  setConfigurationDisabled={setConfigurationDisabled}
                  enabledForCodespaces={payload.enabledForCodespaces}
                />
              ) : (
                <DeleteActionMenu
                  name={payload.networkConfiguration.name}
                  id={payload.networkConfiguration.id}
                  removeNetworkConfigurationPath={payload.removeNetworkConfigurationPath}
                  networkConfigurationsPath={payload.networkConfigurationsPath}
                  enabledForCodespaces={payload.enabledForCodespaces}
                />
              )}
            </Box>
          )}
        </Box>
      </PageLayout.Header>
      <PageLayout.Content as="div">
        <ConfigDisabledFlash
          enabledForCodespaces={payload.enabledForCodespaces}
          configurationDisabled={configurationDisabled}
          enableConfigurationForActions={enableConfigurationForActions}
          canEditNetworkConfiguration={payload.canEditNetworkConfiguration}
        />
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 5}}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <strong>Azure Virtual Network</strong>
            <PrivateNetworkList privateNetworks={payload.privateNetworks} />
          </Box>
          {(!payload.enabledForCodespaces ||
            payload.networkConfiguration.computeService === ComputeService.Actions) && (
            <div>
              <Box sx={{pb: 3}}>
                <Heading as="h3" sx={{fontSize: 3, fontWeight: 'normal'}}>
                  Runner groups using this configuration
                </Heading>
                <p className="color-fg-muted mb-0">
                  Assign this configuration to a runner group to apply the network settings to GitHub-hosted runners.{' '}
                  <Link inline href={NetworkConfigurationConsts.runnerGroupNetworkingLink}>
                    Learn about assigning a network configuration to a runner group
                  </Link>
                </p>
              </Box>
              {runnerGroups.length > 0 ? (
                <Box sx={{border: '1px solid', borderColor: 'border.muted', borderRadius: 2}}>
                  <ListView
                    metadata={
                      <ListViewMetadata
                        title={`${runnerGroups.length} ${runnerGroups.length === 1 ? 'runner group' : 'runner groups'}`}
                      />
                    }
                    title={`${runnerGroups.length} ${runnerGroups.length === 1 ? 'runner group' : 'runner groups'}`}
                  >
                    {runnerGroups.map(item => (
                      <RunnerGroupListItem
                        runnerGroupPath={payload.runnerGroupPath}
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        allowPublic={item.allowPublic}
                        visibility={item.visibility}
                        selectedTargetsCount={item.selectedTargetsCount}
                      />
                    ))}
                  </ListView>
                </Box>
              ) : (
                <RunnerGroupEmptyState runnerGroupPath={payload.runnerGroupPath} />
              )}
            </div>
          )}
          {payload.enabledForCodespaces &&
            payload.networkConfiguration.computeService === ComputeService.Codespaces && (
              <div>
                <Box sx={{pb: 3}}>
                  <Heading as="h3" sx={{fontSize: 3, fontWeight: 'normal'}}>
                    This configuration allows Codespaces to use this network
                  </Heading>
                  <p className="color-fg-muted mb-0">
                    To configure this network to be used for codespaces, create an org-policy that assigns this network
                    to an org or set of repositories.
                  </p>
                </Box>
              </div>
            )}
        </Box>
      </PageLayout.Content>
    </PageLayout>
  )
}

function DisableDeleteActionMenu({
  name,
  id,
  removeNetworkConfigurationPath,
  updateNetworkConfigurationPath,
  networkConfigurationsPath,
  setConfigurationDisabled,
  enabledForCodespaces,
}: {
  name: string
  id: string
  removeNetworkConfigurationPath: string
  updateNetworkConfigurationPath: string
  networkConfigurationsPath: string
  setConfigurationDisabled: (disabled: boolean) => void
  enabledForCodespaces: boolean
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  return (
    <>
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton unsafeDisableTooltip={true} icon={KebabHorizontalIcon} aria-label="Open Menu" />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay width="small">
          <ActionList>
            <ActionList.Item onSelect={() => setShowDisableDialog(true)}>Disable</ActionList.Item>
            <ActionList.Item variant="danger" onSelect={() => setShowDeleteDialog(true)}>
              Delete configuration
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {showDisableDialog && (
        <DisableDialog
          setShowDisableDialog={setShowDisableDialog}
          name={name}
          id={id}
          networkConfigurationsPath={networkConfigurationsPath}
          updateNetworkConfigurationPath={updateNetworkConfigurationPath}
          setConfigurationDisabled={setConfigurationDisabled}
        />
      )}
      {showDeleteDialog && (
        <DeleteDialog
          setShowDeleteDialog={setShowDeleteDialog}
          name={name}
          id={id}
          removeNetworkConfigurationPath={removeNetworkConfigurationPath}
          networkConfigurationsPath={networkConfigurationsPath}
          enabledForCodespaces={enabledForCodespaces}
        />
      )}
    </>
  )
}

function DeleteActionMenu({
  name,
  id,
  removeNetworkConfigurationPath,
  networkConfigurationsPath,
  enabledForCodespaces,
}: {
  name: string
  id: string
  removeNetworkConfigurationPath: string
  networkConfigurationsPath: string
  enabledForCodespaces: boolean
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  return (
    <>
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton unsafeDisableTooltip={true} icon={KebabHorizontalIcon} aria-label="Open Menu" />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay width="small">
          <ActionList>
            <ActionList.Item variant="danger" onSelect={() => setShowDeleteDialog(true)}>
              Delete configuration
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {showDeleteDialog && (
        <DeleteDialog
          setShowDeleteDialog={setShowDeleteDialog}
          name={name}
          id={id}
          removeNetworkConfigurationPath={removeNetworkConfigurationPath}
          networkConfigurationsPath={networkConfigurationsPath}
          enabledForCodespaces={enabledForCodespaces}
        />
      )}
    </>
  )
}

function RunnerGroupEmptyState({runnerGroupPath}: {runnerGroupPath: string}) {
  return (
    <Blankslate border spacious>
      <Blankslate.Heading as="h3">No runner groups are using this configuration yet.</Blankslate.Heading>
      <Blankslate.PrimaryAction href={runnerGroupPath}>Go to runner groups</Blankslate.PrimaryAction>
    </Blankslate>
  )
}

function ConfigDisabledFlash({
  enabledForCodespaces,
  configurationDisabled,
  enableConfigurationForActions,
  canEditNetworkConfiguration,
}: {
  enabledForCodespaces: boolean
  configurationDisabled: boolean
  enableConfigurationForActions: () => void
  canEditNetworkConfiguration: boolean
}) {
  if (!configurationDisabled) {
    return <></>
  } else if (!enabledForCodespaces) {
    return (
      <Flash variant="warning" sx={{mb: '16px'}}>
        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Octicon icon={AlertIcon} size={16} sx={{color: 'fg.attention'}} />
            </Box>
            <p>
              This network configuration is currently disabled. Runner groups using this configuration will not work.
            </p>
          </Box>
          {canEditNetworkConfiguration && <Button onClick={enableConfigurationForActions}>Enable configuration</Button>}
        </Box>
      </Flash>
    )
  } else {
    return (
      <Flash variant="warning" sx={{mb: '16px'}}>
        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Octicon icon={AlertIcon} size={16} sx={{color: 'fg.attention'}} />
            </Box>
            <p>
              No services are enabled for this network configuration. Runner groups and codespaces using this
              configuration will not work. Edit the configuration to enable a service.
            </p>
          </Box>
        </Box>
      </Flash>
    )
  }
}
