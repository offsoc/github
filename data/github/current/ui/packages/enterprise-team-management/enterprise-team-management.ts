import {App} from './App'
import {EnterpriseTeamManagement} from './routes/EnterpriseTeamManagement'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('enterprise-team-management', () => ({
  App,
  routes: [
    jsonRoute({path: '/enterprises/:slug/new_team', Component: EnterpriseTeamManagement}),
    jsonRoute({path: '/enterprises/:slug/teams/:team_slug/edit', Component: EnterpriseTeamManagement}),
  ],
}))
