/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getReactSandboxRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders ReactSandbox with SSR', async () => {
  const routePayload = getReactSandboxRoutePayload()

  const view = await serverRenderReact({
    name: 'react-sandbox',
    path: '/_react_sandbox',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.greeting)
})
