import {TransitionType} from '@github-ui/react-core/app-routing-types'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import App from './App'
import InboxRoutePage from './routes/InboxRoutePage'

registerReactAppFactory('notifications-inbox', () => ({
  App,
  routes: [
    jsonRoute({
      path: '*',
      Component: InboxRoutePage,
      transitionType: TransitionType.TRANSITION_WITHOUT_FETCH,
    }),
  ],
}))
