/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getEnterpriseOverviewProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders licensing-enterprise-overview partial with SSR', async () => {
  const props = getEnterpriseOverviewProps()

  const view = await serverRenderReact({
    name: 'licensing-enterprise-overview',
    data: {props},
  })

  // verify ssr was able to render content from the props
  expect(view).toMatch('Enterprise Cloud')
})
