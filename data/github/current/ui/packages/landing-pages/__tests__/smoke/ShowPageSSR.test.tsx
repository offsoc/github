/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

import freeFormPagePayload from '../fixtures/routes/ShowPage/freeFormPagePayload'

test('Renders a Free Form page with SSR', async () => {
  const view = await serverRenderReact({
    name: 'landing-pages',
    path: '/contentful-e2e-test-do-not-remove',
    data: {
      payload: freeFormPagePayload,
    },
  })

  expect(view).toMatch('This is my super sweet hero heading')
  expect(view).toMatch('GitHub Section Intro')
  expect(view).toMatch('River Heading')
  expect(view).toMatch('Frequently Asked Questions')
  expect(view).toMatch('Example Pillar Heading')
})
