/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getNetworkConfigurationsSelectPanelProps} from '../test-utils/mock-data'
import {NetworkConfigurationConsts} from '../constants/network-configurations-consts'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders network-configurations-select-panel partial with SSR', async () => {
  const props = getNetworkConfigurationsSelectPanelProps()

  const view = await serverRenderReact({
    name: 'network-configurations-select-panel',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(`${NetworkConfigurationConsts.networkConfigurations}`)
})
