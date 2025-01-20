import {App} from './App'
import {SemanticCodeSearchSettings} from './routes/SemanticCodeSearchSettings'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('semantic-code-search-settings', () => ({
  App,
  routes: [
    jsonRoute({
      path: '/organizations/:org/settings/copilot/semantic_code_search',
      Component: SemanticCodeSearchSettings,
    }),
  ],
}))
