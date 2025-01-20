/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getOrganizationSettingsSecurityProductsRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders OrganizationSettingsSecurityProducts with SSR', async () => {
  const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()

  const view = await serverRenderReact({
    name: 'security-products-enablement',
    path: '/organizations/:organization/settings/security_products',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.organization)
})
