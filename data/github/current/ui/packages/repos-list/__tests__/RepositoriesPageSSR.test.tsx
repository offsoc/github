/** @jest-environment node */
// Register with react-core before attempting to render
import '../ssr-entry'

import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

import {getRepositoriesRoutePayload} from '../test-utils/mock-data'

test('Renders RepositoriesPage with SSR', async () => {
  const routePayload = getRepositoriesRoutePayload()
  const view = await serverRenderReact({
    name: 'repos-list',
    path: '/orgs/github/repositories',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch('test-repo')
})
