import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import {App} from './App'
import {Commit} from './routes/Commit'
import {Commits} from './routes/Commits'

registerReactAppFactory('commits', () => ({
  App,
  routes: [
    jsonRoute({path: '/:owner/:repo/commits', Component: Commits}),
    jsonRoute({path: '/:owner/:repo/commits/:ref', Component: Commits}),
    jsonRoute({path: '/:owner/:repo/commits/:ref/:path/*', Component: Commits}),
    jsonRoute({path: '/:owner/:repo/commit/:oid', Component: Commit}),
    jsonRoute({path: '/:owner/:repo/commit/:oid/:path/*', Component: Commit}),
    jsonRoute({
      path: '/_view_fragments/Voltron::CommitFragmentsController/show/:owner/:repo/:name/repo_layout',
      Component: Commit,
    }),
  ],
}))
