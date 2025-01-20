/** @jest-environment node */
/**
 * Adds a SSR test for our billing usage route per the react testing document:
 * https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/testing/#testing-ssr.
 *
 * These tests can be run with: `npm run jest -- --watch ./ui/packages/billing-app`
 */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../entry'

test('Renders', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: '/enterprises/github-inc/billing/budgets/1/edit',
    data: {payload: {slug: 'github-inc', budget: {uuid: '1'}, adminRoles: [], enabledProducts: []}},
  })
  expect(view).toMatch('Edit monthly budget')
})
