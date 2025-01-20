import {App} from './App'
import {NetworkConfigurations} from './routes/NetworkConfigurations'
import {CreatePrivateNetwork} from './routes/CreatePrivateNetwork'
import {NetworkConfigurationSettings} from './routes/NetworkConfigurationSettings'
import {EditNetworkConfigurationSettings} from './routes/EditNetworkConfigurationSettings'
import {EditHostedComputeNetworkingPolicySettings} from './routes/EditHostedComputeNetworkingPolicySettings'
import {StaffToolsHostedComputeNetworking} from './routes/stafftools/StaffToolsHostedComputeNetworking'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('network-configurations', () => ({
  App,
  routes: [
    jsonRoute({path: '/enterprises/:business/settings/network_configurations', Component: NetworkConfigurations}),
    jsonRoute({
      path: '/enterprises/:business/settings/network_configurations/azure_private_network/new',
      Component: CreatePrivateNetwork,
    }),
    jsonRoute({
      path: '/enterprises/:business/settings/network_configurations/:network_configuration_id',
      Component: NetworkConfigurationSettings,
    }),
    jsonRoute({
      path: '/enterprises/:business/settings/network_configurations/:network_configuration_id/edit',
      Component: EditNetworkConfigurationSettings,
    }),
    jsonRoute({path: '/organizations/:organization/settings/network_configurations', Component: NetworkConfigurations}),
    jsonRoute({
      path: '/organizations/:organization/settings/network_configurations/azure_private_network/new',
      Component: CreatePrivateNetwork,
    }),
    jsonRoute({
      path: '/organizations/:organization/settings/network_configurations/:network_configuration_id',
      Component: NetworkConfigurationSettings,
    }),
    jsonRoute({
      path: '/organizations/:organization/settings/network_configurations/:network_configuration_id/edit',
      Component: EditNetworkConfigurationSettings,
    }),
    jsonRoute({
      path: '/enterprises/:business/settings/hosted_compute_networking',
      Component: EditHostedComputeNetworkingPolicySettings,
    }),
    // Stafftools
    jsonRoute({
      path: '/stafftools/enterprises/:business/hosted_compute_networking',
      Component: StaffToolsHostedComputeNetworking,
    }),
    jsonRoute({
      path: '/stafftools/users/:user/hosted_compute_networking',
      Component: StaffToolsHostedComputeNetworking,
    }),
  ],
}))
