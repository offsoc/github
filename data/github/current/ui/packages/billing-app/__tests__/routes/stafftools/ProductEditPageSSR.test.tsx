/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../../entry'

test('Renders', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: '/stafftools/billing/products/actions/edit',
    data: {payload: {environment: 'development', product: {name: 'actions', friendlyProductName: 'Actions'}}},
  })
  expect(view).toMatch('Update product')
})
