import {App} from './App'
import {TransitionType} from '@github-ui/react-core/app-routing-types'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {Index} from './routes/Index/Page'
import {New} from './routes/New/Page'
import {Edit} from './routes/Edit/Page'
import {Show} from './routes/Show/Page'

registerReactAppFactory('copilot-custom-models', () => ({
  App,
  routes: [
    jsonRoute({
      path: '/organizations/:org/settings/copilot/custom_models',
      Component: Index,
      transitionType: TransitionType.FETCH_THEN_TRANSITION,
    }),
    jsonRoute({
      path: '/organizations/:org/settings/copilot/custom_model/new',
      Component: New,
      transitionType: TransitionType.FETCH_THEN_TRANSITION,
    }),
    jsonRoute({
      path: '/organizations/:org/settings/copilot/custom_model/training/:custom_model_id',
      Component: Show,
      transitionType: TransitionType.FETCH_THEN_TRANSITION,
    }),
    jsonRoute({
      path: '/organizations/:org/settings/copilot/custom_model/:custom_model_id/edit',
      Component: Edit,
      transitionType: TransitionType.FETCH_THEN_TRANSITION,
    }),
  ],
}))
