/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getImportViewRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders ImportView with SSR', async () => {
  const routePayload = getImportViewRoutePayload()

  const view = await serverRenderReact({
    name: 'github-importer',
    path: '/:owner/:repo/import',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content
  expect(view).toContain('Preparing your new repository')
  expect(view).toContain('There is no need to keep this window open')
  expect(view).toContain('Your import will begin shortly...')
})
