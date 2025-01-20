/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSecurityConfigurationsRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders SecurityConfiguration with SSR', async () => {
  const routePayload = getSecurityConfigurationsRoutePayload()

  const view = await serverRenderReact({
    name: 'security-products-enablement',
    path: '/organizations/:organization/settings/security_products/configurations/new',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.organization)
})
