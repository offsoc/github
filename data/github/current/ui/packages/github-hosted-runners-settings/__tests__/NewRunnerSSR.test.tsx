/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getNewRunnerRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders NewRunner with SSR', async () => {
  const routePayload = getNewRunnerRoutePayload()

  const view = await serverRenderReact({
    name: 'github-hosted-runners-settings',
    path: '/organizations/:organization_id/settings/actions/github-hosted-runners/new',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.runnerListPath)
})
