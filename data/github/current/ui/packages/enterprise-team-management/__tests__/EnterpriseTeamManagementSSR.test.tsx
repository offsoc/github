/** @jest-environment node */
import {serverRenderReact} from '@github-ui/ssr-test-utils/server-render'
import {
  getEnterpriseTeamManagementRoutePayload,
  getEnterpriseTeamManagementRoutePayloadNoTeam,
} from '../test-utils/mock-data'

// Register with react-core before attempting to render
import '../ssr-entry'

test('Renders EnterpriseTeamManagement New Team with SSR', async () => {
  const routePayload = getEnterpriseTeamManagementRoutePayloadNoTeam()

  const view = await serverRenderReact({
    name: 'enterprise-team-management',
    path: '/enterprises/:slug/new_team',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.enterpriseSlug)
})

test('Renders EnterpriseTeamManagement Edit Team with SSR', async () => {
  const routePayload = getEnterpriseTeamManagementRoutePayload()

  const view = await serverRenderReact({
    name: 'enterprise-team-management',
    path: '/enterprises/:slug/teams/:team_slug/edit',
    data: {payload: routePayload},
  })

  // verify ssr was able to render some content from the payload
  expect(view).toMatch(routePayload.enterpriseSlug)
  expect(routePayload.enterpriseTeam?.name).toBeTruthy()
  expect(routePayload.enterpriseTeam?.idpGroup?.text).toBeTruthy()
  expect(view).toMatch(routePayload.enterpriseTeam?.name ?? '')
  expect(view).toMatch(routePayload.enterpriseTeam?.idpGroup?.text ?? '')
})
