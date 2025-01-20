import React from 'react'

import {App} from './App'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

const PoliciesPage = React.lazy(() => import(/* webpackPreload: true */ './routes/Policies'))
const SeatManagementPage = React.lazy(() => import(/* webpackPreload: true */ './routes/SeatManagement'))
const StandaloneSeatManagementPage = React.lazy(
  () => import(/* webpackPreload: true */ './routes/StandaloneSeatManagement'),
)

registerReactAppFactory('copilot-for-business', () => ({
  App,
  routes: [
    jsonRoute({path: '/organizations/:org/settings/copilot/seat_management', Component: SeatManagementPage}),
    jsonRoute({path: '/organizations/:org/settings/copilot/policies', Component: PoliciesPage}),
    jsonRoute({
      path: '/enterprises/:slug/enterprise_licensing/copilot/seat_management',
      Component: StandaloneSeatManagementPage,
    }),
  ],
}))
