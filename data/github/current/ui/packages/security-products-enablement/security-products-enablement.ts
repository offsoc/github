import App from './App'
import OrganizationSettingsSecurityProducts from './routes/OrganizationSettingsSecurityProducts'
import SecurityConfiguration from './routes/SecurityConfiguration'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

registerReactAppFactory('security-products-enablement', () => ({
  App,
  routes: [
    jsonRoute({
      path: '/organizations/:organization/settings/security_products',
      Component: OrganizationSettingsSecurityProducts,
    }),
    jsonRoute({
      path: '/organizations/:organization/settings/security_products/configurations/new',
      Component: SecurityConfiguration,
    }),
    jsonRoute({
      path: '/organizations/:organization/settings/security_products/configurations/edit/:id',
      Component: SecurityConfiguration,
    }),
    jsonRoute({
      path: '/organizations/:organization/settings/security_products/configurations/view',
      Component: SecurityConfiguration,
    }),
  ],
}))
