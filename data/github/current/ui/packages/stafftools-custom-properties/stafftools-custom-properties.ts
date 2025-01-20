import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {App} from './App'
import {RepositoryCustomPropertyValuesIndexPage} from './routes/RepositoryCustomPropertyValuesIndexPage'
import {OrganizationDefinitionsIndexPage} from './routes/OrganizationDefinitionsIndexPage'
import {CustomPropertyDefinitionShowPage} from './routes/CustomPropertyDefinitionShowPage'

registerReactAppFactory('stafftools-custom-properties', () => ({
  App,
  routes: [
    jsonRoute({
      path: '/stafftools/repositories/:owner/:repo/custom_properties',
      Component: RepositoryCustomPropertyValuesIndexPage,
    }),
    jsonRoute({
      path: '/stafftools/users/:org/organization_custom_properties',
      Component: OrganizationDefinitionsIndexPage,
    }),
    jsonRoute({
      path: '/stafftools/users/:org/organization_custom_properties/:name',
      Component: CustomPropertyDefinitionShowPage,
    }),
  ],
}))
