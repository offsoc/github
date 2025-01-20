import {App} from './App'
import {ApiInsights} from './routes/ApiInsights'
import {Users} from './routes/Users'
import {Actors} from './routes/Actors'
import {Installations} from './routes/Installations'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('api-insights', () => ({
  App,
  routes: [
    jsonRoute({path: '/orgs/:org/insights/api', Component: ApiInsights}),
    jsonRoute({path: '/orgs/:org/insights/api/users/:user', Component: Users}),
    jsonRoute({path: '/orgs/:org/insights/api/users/:user/actors/:actor_type/:actor_id', Component: Actors}),
    jsonRoute({path: '/orgs/:org/insights/api/installations/:installation_id', Component: Installations}),
  ],
}))
