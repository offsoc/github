/** @jest-environment node */
// Register with react-core before attempting to render
import '../../ssr-entry'

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {getSchemaPagePayload} from '../../test-utils/mock-data'

test('Renders Custom Properties Schema with SSR', async () => {
  const routePayload = getSchemaPagePayload()
  const view = await serverRenderReact({
    name: 'custom-properties',
    path: '/organizations/github/settings/custom-properties',
    data: {payload: routePayload},
  })

  expect(view).toContain('Custom properties')
  expect(view).toContain(routePayload.definitions[0]!.propertyName)
})
