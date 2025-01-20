import {App} from './App'
import {NewExemptionRequestPage} from './routes/NewExemptionRequestPage'
import {ExemptionRequestPage} from './routes/ExemptionRequestPage'
import {BypassRequestsPage} from './routes/BypassRequestsPage'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('delegated-bypass', () => ({
  App,
  routes: [
    jsonRoute({path: '/:owner/:repo/exemptions/new/:exemptionHashId', Component: NewExemptionRequestPage}),
    jsonRoute({path: '/:owner/:repo/exemptions/:exemptionHashId', Component: ExemptionRequestPage}),
    jsonRoute({path: '/:owner/:repo/settings/rules/bypass_requests', Component: BypassRequestsPage}),
    jsonRoute({
      path: '/:owner/:repo/secret_scanning/exemptions/new/:exemptionHashId',
      Component: NewExemptionRequestPage,
    }),
    jsonRoute({path: '/:owner/:repo/secret_scanning/exemptions/:exemptionHashId', Component: ExemptionRequestPage}),
    jsonRoute({path: '/:owner/:repo/security/secret_scanning/bypass_requests', Component: BypassRequestsPage}),
  ],
}))
