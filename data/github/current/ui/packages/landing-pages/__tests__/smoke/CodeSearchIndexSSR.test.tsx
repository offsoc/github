/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

test('Renders CodeSearchIndex with SSR', async () => {
  const view = await serverRenderReact({
    name: 'landing-pages',
    path: '/features/code-search',
    data: {payload: {}},
  })

  // verify Hero
  expect(view).toMatch('Code Search')
})
