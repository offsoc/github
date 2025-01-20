/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {initialPricingData} from '../../../test-utils/mock-data'

// Register with react-core before attempting to render
import '../../../entry'

test('Renders', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: '/stafftools/billing/products/:product_id/pricings/:pricing_id/edit',
    data: {
      payload: {pricing: initialPricingData},
    },
  })

  expect(view).toMatch('Edit SKU pricing')
})
