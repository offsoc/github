/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getOnboardingOrganizationsRoutePayload} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders OnboardingOrganizations with SSR', async () => {
  const routePayload = getOnboardingOrganizationsRoutePayload()
  const view = await serverRenderReact({
    name: 'enterprise-onboarding',
    path: '/enterprises/:slug/onboarding/organizations/new',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.business.name)
  expect(view).toMatch(routePayload.business.avatar_url)
})
