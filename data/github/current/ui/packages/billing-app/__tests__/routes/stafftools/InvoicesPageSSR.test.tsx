/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../../entry'

import {CUSTOMER_SELECTIONS, GITHUB_INC_CUSTOMER} from '../../../test-utils/mock-data'

test('Renders Invoices', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: '/stafftools/enterprises/github-inc/billing/invoices',
    data: {
      payload: {
        customerSelections: CUSTOMER_SELECTIONS,
        slug: GITHUB_INC_CUSTOMER.displayId,
      },
    },
  })
  expect(view).toMatch('Invoices')
})
