/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSomeRouteRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../entry'

test('Renders SomeRoute with SSR', async () => {
  const routePayload = getSomeRouteRoutePayload()
  const view = await serverRenderReact({
    name: 'test-react-app-package',
    path: '/some/:id/route',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.someField)
})
