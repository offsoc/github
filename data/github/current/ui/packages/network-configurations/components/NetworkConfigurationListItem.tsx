import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTrailingBadge} from '@github-ui/list-view/ListItemTrailingBadge'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ActionList, IconButton, Box, ActionMenu, RelativeTime} from '@primer/react'
import {AzureIcon} from './AzureIcon'
import {KebabHorizontalIcon, PencilIcon} from '@primer/octicons-react'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import {useNavigate} from '@github-ui/use-navigate'
import {DeleteDialog} from './DeleteDialog'
import {DisableDialog} from './DisableDialog'
import type {NetworkConfiguration} from '../classes/network-configuration'
import {useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ComputeService} from '../classes/network-configuration'
import {createOrUpdateNetworkConfiguration, type IUpdatePayload} from '../helpers/network-configuration-helpers'

interface INetworkConfigurationListItemProps {
  networkConfigurationsPath: string
  networkConfig: NetworkConfiguration
  updateNetworkConfigurationPath: string
  removeNetworkConfigurationPath: string
  removeNetworkConfigurationFunction: (networkId: string) => void
  enabledForCodespaces: boolean
  canEditNetworkConfiguration: boolean
}

export function NetworkConfigurationListItem(props: INetworkConfigurationListItemProps) {
  const {addToast} = useToastContext()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const navigate = useNavigate()
  const [configurationDisabled, setConfigurationDisabled] = useState(
    props.networkConfig.computeService === ComputeService.None,
  )
  const networkSettingsUrl = NetworkConfigurationConsts.networkSettingsUrl(
    props.networkConfigurationsPath,
    props.networkConfig.id,
  )
  const editNetworkConfigurationPath = NetworkConfigurationConsts.editNetworkConfigurationPath(
    props.networkConfigurationsPath,
    props.networkConfig.id,
  )
  const enableDisableActionsForConfiguration = async () => {
    if (!configurationDisabled) {
      setShowDisableDialog(true)
    } else {
      try {
        const requestBody: IUpdatePayload = {
          configurationId: props.networkConfig.id,
          computeService: ComputeService.Actions,
        }

        const result = await createOrUpdateNetworkConfiguration(
          props.updateNetworkConfigurationPath,
          props.networkConfigurationsPath,
          requestBody,
        )
        if (result.success) {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'success',
            message: 'Service updated successfully',
          })
          setConfigurationDisabled(false)
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
  return (
    <>
      {showDisableDialog && (
        <DisableDialog
          setShowDisableDialog={setShowDisableDialog}
          name={props.networkConfig.name}
          id={props.networkConfig.id}
          networkConfigurationsPath={props.networkConfigurationsPath}
          updateNetworkConfigurationPath={props.updateNetworkConfigurationPath}
          setConfigurationDisabled={setConfigurationDisabled}
        />
      )}
      {showDeleteDialog && (
        <DeleteDialog
          setShowDeleteDialog={setShowDeleteDialog}
          name={props.networkConfig.name}
          id={props.networkConfig.id}
          removeNetworkConfigurationPath={props.removeNetworkConfigurationPath}
          removeNetworkConfigurationFunction={props.removeNetworkConfigurationFunction}
          enabledForCodespaces={props.enabledForCodespaces}
        />
      )}
      <ListItem
        title={
          <ListItemTitle
            value={props.networkConfig.name}
            onClick={() => navigate(networkSettingsUrl)}
            trailingBadges={
              !props.enabledForCodespaces && configurationDisabled
                ? [<ListItemTrailingBadge key="disabled" title="Disabled" variant="attention" />]
                : undefined
            }
          />
        }
        metadata={
          props.canEditNetworkConfiguration && (
            <ListItemMetadata alignment="right">
              <Box sx={{pl: 1}}>
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  icon={PencilIcon}
                  aria-label="Edit icon"
                  size="medium"
                  variant="invisible"
                  sx={{color: 'fg.muted'}}
                  onClick={() => navigate(editNetworkConfigurationPath)}
                />
              </Box>
              <div>
                <ActionMenu>
                  <ActionMenu.Anchor>
                    {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                    <IconButton
                      unsafeDisableTooltip={true}
                      icon={KebabHorizontalIcon}
                      variant="invisible"
                      aria-label="Disable Delete menu"
                      sx={{color: 'fg.muted'}}
                    />
                  </ActionMenu.Anchor>
                  <ActionMenu.Overlay width="auto">
                    <ActionList>
                      {!props.enabledForCodespaces && (
                        <ActionList.Item onSelect={enableDisableActionsForConfiguration}>
                          {configurationDisabled ? 'Enable' : 'Disable'}
                        </ActionList.Item>
                      )}
                      <ActionList.Item variant="danger" onSelect={() => setShowDeleteDialog(true)}>
                        {NetworkConfigurationConsts.deleteNetworkConfiguration}
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </div>
            </ListItemMetadata>
          )
        }
      >
        <ListItemLeadingContent>
          <ListItemLeadingVisual icon={AzureIcon} description="Azure Icon" />
        </ListItemLeadingContent>
        <ListItemMainContent>
          <ListItemDescription>
            {props.networkConfig.service} · Created{' '}
            <RelativeTime date={new Date(props.networkConfig.createdOn)} tense="past" />
          </ListItemDescription>
        </ListItemMainContent>
      </ListItem>
    </>
  )
}
