import {App} from './App'
import {Commits} from './routes/Commits'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('pull-request-commits', () => ({
  App,
  routes: [jsonRoute({path: '/:owner/:repo/pull/:pr_number/commits', Component: Commits})],
}))
