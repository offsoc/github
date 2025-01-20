import {App} from './App'
import {Index} from './routes/Index'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('repos-code-frequency', () => ({
  App,
  routes: [jsonRoute({path: '/:owner/:repo/graphs/code-frequency', Component: Index})],
}))
