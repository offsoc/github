import {App} from './App'
import {DefaultSetup} from './routes/DefaultSetup'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('repository-code-scanning-settings', () => ({
  App,
  routes: [jsonRoute({path: '/:owner/:repo/settings/code-scanning/default-setup', Component: DefaultSetup})],
}))
