import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import {App} from './App'
import {RepositoriesPage} from './routes/RepositoriesPage'

registerReactAppFactory('repos-list', () => ({
  App,
  routes: [jsonRoute({path: '/orgs/:org/repositories', Component: RepositoriesPage})],
}))
