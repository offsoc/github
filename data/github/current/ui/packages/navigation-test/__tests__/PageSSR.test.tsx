/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getPageRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders Page with SSR', async () => {
  const routePayload = getPageRoutePayload()

  const view = await serverRenderReact({
    name: 'navigation-test',
    path: '_navigation_test/react/json/ssr',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.someField)
})
