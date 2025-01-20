/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getEditHostedComputeNetworkingPolicySettingsRoutePayload} from '../test-utils/mock-data'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders EditHostedComputeNetworkingPolicySettings with SSR', async () => {
  const routePayload = getEditHostedComputeNetworkingPolicySettingsRoutePayload()
  const view = await serverRenderReact({
    name: 'network-configurations',
    path: '/enterprises/:business/settings/network_configurations',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(NetworkConfigurationConsts.hostedComputeNetworkingTitle)
})
