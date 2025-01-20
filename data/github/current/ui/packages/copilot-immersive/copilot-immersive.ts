import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import {App} from './App'
import {CopilotImmersive} from './routes/CopilotImmersive'

registerReactAppFactory('copilot-immersive', () => ({
  App,
  routes: [
    jsonRoute({path: '/copilot', Component: CopilotImmersive}),
    jsonRoute({path: '/copilot/c/:threadID', Component: CopilotImmersive}),
    jsonRoute({path: '/copilot/d/:docsetName', Component: CopilotImmersive}),
    jsonRoute({path: '/copilot/r/:owner/:repository', Component: CopilotImmersive}),
  ],
}))
