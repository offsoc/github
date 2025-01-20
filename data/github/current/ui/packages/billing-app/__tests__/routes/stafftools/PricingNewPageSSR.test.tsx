/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../../entry'

test('Renders', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: '/stafftools/billing/products/actions/pricings/new',
    data: {
      payload: {
        friendlyProductName: 'Actions',
        productId: 'actions',
      },
    },
  })

  expect(view).toMatch('Create a new SKU pricing')
})
