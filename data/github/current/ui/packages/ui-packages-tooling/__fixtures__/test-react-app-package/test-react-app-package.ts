import {App} from './App'
import {SomeRoute} from './routes/SomeRoute'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('test-react-app-package', () => ({
  App,
  routes: [jsonRoute({path: '/some/:id/route', Component: SomeRoute})],
}))
