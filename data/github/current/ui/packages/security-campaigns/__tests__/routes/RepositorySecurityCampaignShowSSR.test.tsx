/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {getRepositorySecurityCampaignShowRoutePayload} from '../../test-utils/mock-data'

// Register with react-core before attempting to render
import '../../ssr-entry'

test('Renders SecurityCampaigns with SSR', async () => {
  const routePayload = getRepositorySecurityCampaignShowRoutePayload()
  const view = await serverRenderReact({
    name: 'security-campaigns',
    path: '/:owner/:repo/security/campaigns/:campaignId',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.campaign.name)
})
