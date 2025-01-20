import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {IndexPage} from './pages/IndexPage'
import {CustomRoutesPage} from './pages/CustomRoutesPage'

registerReactAppFactory('notification-settings', () => ({
  routes: [
    jsonRoute({path: '/settings/notifications', Component: IndexPage}),
    jsonRoute({path: '/settings/notifications/custom_routing', Component: CustomRoutesPage}),
  ],
}))
