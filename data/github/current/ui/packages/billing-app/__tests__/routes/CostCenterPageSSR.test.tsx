/** @jest-environment node */
/**
 * Adds a SSR test for our billing usage route per the react testing document:
 * https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/testing/#testing-ssr.
 *
 * These tests can be run with: `npm run jest -- --watch ./ui/packages/billing-app`
 */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCostCenterRoutePayload, mockCostCenter} from '../../test-utils/mock-data'
// Register with react-core before attempting to render
import '../../entry'

test('Renders', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: `/enterprises/github-inc/billing/cost_centers/${mockCostCenter.costCenterKey.uuid}`,
    data: {
      payload: getCostCenterRoutePayload(),
    },
  })
  expect(view).toMatch('Cost centers')
})
