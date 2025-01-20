import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import {App} from './App'
import {EnterpriseSecurityManagers} from './routes/EnterpriseSecurityManagers'

registerReactAppFactory('security-managers', () => ({
  App,
  routes: [jsonRoute({path: '/enterprises/:business/security-managers', Component: EnterpriseSecurityManagers})],
}))
