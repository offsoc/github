import {App} from './App'
import {List} from './routes/List'
import {New} from './routes/New'
import {Show} from './routes/Show'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('group-settings', () => ({
  App,
  routes: [
    jsonRoute({path: '/organizations/:organization_id/groups', Component: List}),
    jsonRoute({path: '/organizations/:organization_id/settings/groups', Component: List}),
    jsonRoute({path: '/organizations/:organization_id/settings/groups/new', Component: New}),
    jsonRoute({path: '/organizations/:organization_id/settings/groups/:group_id', Component: Show}),
    // jsonRoute({path: '/organizations/:organization_id/settings/groups/:group_path/review', Component: Review}),
  ],
}))
