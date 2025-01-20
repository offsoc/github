/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getNetworkConfigurationsRoutePayload} from '../test-utils/mock-data'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders NetworkConfigurations with SSR', async () => {
  const routePayload = getNetworkConfigurationsRoutePayload()
  const view = await serverRenderReact({
    name: 'network-configurations',
    path: '/enterprises/:business/settings/network_configurations',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(NetworkConfigurationConsts.hostedComputeNetworkingTitle)
})

test('Renders Config Only Impact Status Flash Component', async () => {
  const routePayload = getNetworkConfigurationsRoutePayload()
  routePayload.displayConfigStatusBanner = true
  const view = await serverRenderReact({
    name: 'network-configurations',
    path: '/enterprises/:business/settings/network_configurations',
    data: {payload: routePayload},
  })

  // verify that we registered the Config oriented status message
  expect(view).toMatch(NetworkConfigurationConsts.statusConfigBannerMessage)
})

test('Renders All VNet Impact Status Flash Component', async () => {
  const routePayload = getNetworkConfigurationsRoutePayload()
  routePayload.displayAllVNetStatusBanner = true
  const view = await serverRenderReact({
    name: 'network-configurations',
    path: '/enterprises/:business/settings/network_configurations',
    data: {payload: routePayload},
  })

  // verify that we registered the full vnet injection impact status message
  expect(view).toMatch(NetworkConfigurationConsts.statusAllVNetBannerMessage)
})

test('Renders All VNet over Config Status Flash Component when both are set', async () => {
  const routePayload = getNetworkConfigurationsRoutePayload()
  routePayload.displayAllVNetStatusBanner = true
  routePayload.displayConfigStatusBanner = true
  const view = await serverRenderReact({
    name: 'network-configurations',
    path: '/enterprises/:business/settings/network_configurations',
    data: {payload: routePayload},
  })

  // verify that the full impact message takes presedence over the config only message
  expect(view).toMatch(NetworkConfigurationConsts.statusAllVNetBannerMessage)
})
