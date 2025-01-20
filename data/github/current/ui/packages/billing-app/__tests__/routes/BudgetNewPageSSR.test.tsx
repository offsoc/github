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
import {MOCK_PRODUCTS} from '../../test-utils/mock-data'

test('Renders', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: '/enterprises/github-inc/billing/budgets/new',
    data: {payload: {slug: 'github-inc', adminRoles: [], current_user_id: '', enabledProducts: MOCK_PRODUCTS}},
  })
  expect(view).toMatch('New monthly budget')
})
