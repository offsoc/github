/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getCommitsRoutePayload, getAppPayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders Commits with SSR', async () => {
  const payload = getCommitsRoutePayload()
  const appPayload = getAppPayload()

  const view = await serverRenderReact({
    name: 'pull-request-commits',
    path: '/:owner/:repo/pull/:pr_number/commits',
    data: {payload, appPayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(payload.pullRequest.title)
})
