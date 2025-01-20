import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import {App} from './App'
import {CopilotTask} from './routes/CopilotTask'
import {EDITOR_PATH} from './utilities/urls'

registerReactAppFactory('copilot-task', () => ({
  App,
  routes: [
    jsonRoute({path: `/:owner/:repo/pull/:pr_number/${EDITOR_PATH}`, Component: CopilotTask}),
    jsonRoute({path: `/:owner/:repo/pull/:pr_number/${EDITOR_PATH}/new`, Component: CopilotTask}),
    jsonRoute({path: `/:owner/:repo/pull/:pr_number/${EDITOR_PATH}/file/:path/*`, Component: CopilotTask}),
  ],
}))
