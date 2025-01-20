import {App} from './App'
import {ImportView} from './routes/ImportView'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('github-importer', () => ({
  App,
  routes: [jsonRoute({path: '/:owner/:repo/import', Component: ImportView})],
}))
