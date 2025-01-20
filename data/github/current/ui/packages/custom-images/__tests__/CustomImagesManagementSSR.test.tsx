/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCustomImagesRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders CustomImagesManagement with SSR', async () => {
  const routePayload = getCustomImagesRoutePayload()

  const view = await serverRenderReact({
    name: 'custom-images',
    path: '/organizations/:organization_id/settings/actions/custom-images',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch('Custom images')
})
