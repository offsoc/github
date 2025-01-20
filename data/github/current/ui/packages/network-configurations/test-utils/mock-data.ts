import type {NetworkConfigurationsPayload} from '../routes/NetworkConfigurations'
import type {NetworkConfigurationSettingsPayload} from '../routes/NetworkConfigurationSettings'
import type {IHostedComputeNetworkingPolicySettingsPayload} from '../routes/EditHostedComputeNetworkingPolicySettings'
import {ComputeService} from '../classes/network-configuration'

export function getNetworkConfigurationsRoutePayload(): NetworkConfigurationsPayload {
  return {
    networks: [
      {
        id: 'test-id',
        name: 'test-name',
        createdOn: '2023-07-04T00:38:37.2942238Z',
        computeService: ComputeService.Actions,
        service: 'actions',
        runnerGroups: [],
      },
    ],
    removeNetworkConfigurationPath: '',
    newPrivateNetworkPath: '',
    networkConfigurationsPath: '',
    updateNetworkConfigurationPath: '',
    enabledForCodespaces: false,
    displayConfigStatusBanner: false,
    displayAllVNetStatusBanner: false,
    canEditNetworkConfiguration: false,
    isBusiness: false,
  }
}

export function getNetworkConfigurationSettingsRoutePayload(): NetworkConfigurationSettingsPayload {
  return {
    networkConfiguration: {
      id: 'test-id',
      name: 'test-name',
      createdOn: '2023-07-04T00:38:37.2942238Z',
      computeService: ComputeService.Actions,
      service: 'actions',
      runnerGroups: [],
    },
    privateNetworks: [
      {
        id: 'test-id',
        subscription: 'test-subscription',
        virtualNetwork: 'test-virtualNetwork',
        location: 'test-location',
        subnet: 'test-subnet',
        resourceGroup: 'test-resourceGroup',
        resourceName: 'test-resourceName',
        networkConfigurationId: 'test-networkConfigurationId',
      },
    ],
    networkConfigurationsPath: '',
    updateNetworkConfigurationPath: '',
    removeNetworkConfigurationPath: '',
    runnerGroupPath: '',
    enabledForCodespaces: false,
    isBusiness: false,
    canEditNetworkConfiguration: false,
  }
}

export function getEditHostedComputeNetworkingPolicySettingsRoutePayload(): IHostedComputeNetworkingPolicySettingsPayload {
  return {
    orgsCanCreateNetworkConfigurations: false,
    updatePath: '',
    updateMethod: '',
  }
}
