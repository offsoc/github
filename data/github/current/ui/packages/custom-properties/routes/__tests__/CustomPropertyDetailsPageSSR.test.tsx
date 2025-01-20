/** @jest-environment node */
// Register with react-core before attempting to render
import '../../ssr-entry'

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {getPropertyDetailsPagePayload} from '../../test-utils/mock-data'

test('Renders Custom Property Details Page with SSR', async () => {
  const routePayload = getPropertyDetailsPagePayload()
  const view = await serverRenderReact({
    name: 'custom-properties',
    path: '/organizations/github/settings/custom-property',
    data: {payload: routePayload},
  })

  expect(view).toContain('New property')
})
