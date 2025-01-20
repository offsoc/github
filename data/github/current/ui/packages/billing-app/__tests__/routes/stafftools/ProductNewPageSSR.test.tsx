/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../../entry'

test('Renders', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: '/stafftools/billing/products/new',
    data: {payload: {environment: 'development'}},
  })
  expect(view).toMatch('New product')
})
