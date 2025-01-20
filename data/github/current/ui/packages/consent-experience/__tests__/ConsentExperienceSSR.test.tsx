/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getConsentExperienceProps} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders consent-experience partial with SSR', async () => {
  const props = getConsentExperienceProps()
  const view = await serverRenderReact({
    name: 'consent-experience',
    data: {props},
  })

  // verify ssr was able to render some content from the props
  expect(view).toMatch(
    'Yes please, I’d like GitHub and affiliates to use my information for personalized communications, targeted advertising and campaign effectiveness.',
  )
})
