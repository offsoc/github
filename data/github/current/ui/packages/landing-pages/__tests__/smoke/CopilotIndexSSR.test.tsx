/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'

// Register with react-core before attempting to render
import '../../ssr-entry'

import featuresCopilotPagePayload from '../fixtures/routes/FeaturesCopilotPage/indexPagePayload'

test('Renders CopilotIndex with SSR', async () => {
  const view = await serverRenderReact({
    name: 'landing-pages',
    path: '/features/copilot',
    data: {
      payload: featuresCopilotPagePayload,
    },
  })

  // verify Hero
  expect(view).toMatch('GitHub Copilot')
  expect(view).toMatch('The world’s most widely adopted AI developer tool.')

  // verify Enterprise
  expect(view).toMatch('Proven to increase developer productivity and accelerate the pace of software development.')

  // verify Features
  expect(view).toMatch('Start a conversation about your codebase.')

  // verify Pricing plans
  expect(view).toMatch('Copilot Business')
  expect(view).toMatch('19')
  expect(view).toMatch('Copilot Enterprise')
  expect(view).toMatch('39')
  expect(view).toMatch('Copilot Individual')
  expect(view).toMatch('10')

  // verify FAQs
  expect(view).toMatch('What is GitHub Copilot?')
})
