/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

test('Renders FeaturesIndex with SSR', async () => {
  const view = await serverRenderReact({
    name: 'landing-pages',
    path: '/features',
    data: {payload: {}},
  })

  // verify Hero
  // TODO: better selector? It's currently the beginning of the title, which might change.
  expect(view).toMatch('The tools you need')
})
