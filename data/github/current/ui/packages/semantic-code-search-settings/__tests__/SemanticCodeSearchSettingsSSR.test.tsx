/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getSemanticCodeSearchSettingsRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders SemanticCodeSearchSettings with SSR', async () => {
  const routePayload = getSemanticCodeSearchSettingsRoutePayload()
  const view = await serverRenderReact({
    name: 'semantic-code-search-settings',
    path: '/organizations/:org/settings/copilot/semantic_code_search',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.initialIndexedRepos[0]!.name)
})
