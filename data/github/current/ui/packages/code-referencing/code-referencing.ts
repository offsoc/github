import {TransitionType} from '@github-ui/react-core/app-routing-types'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {App} from './App'
import {Show} from './routes/Show'

registerReactAppFactory('code-referencing', () => ({
  App,
  routes: [
    jsonRoute({
      path: '/github-copilot/code_referencing',
      Component: Show,
      transitionType: TransitionType.FETCH_THEN_TRANSITION,
    }),
  ],
}))
