/** @jest-environment node */
/*
Adds a SSR test for our billing cost center edit page per the React testing documentation:
https://thehub.github.com/epd/engineering/dev-practicals/frontend/testing/react-testing/
*/

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {getEditCostCenterPayload} from '../../test-utils/mock-data'

// Register with react-core before attempting to render
import '../../entry'

const payload = getEditCostCenterPayload()

test('Renders', async () => {
  const view = await serverRenderReact({
    name: 'billing-app',
    path: '/enterprises/test/billing/cost_centers/123/edit',
    data: {payload},
  })
  expect(view).toMatch('You can add users to a cost center')
})
