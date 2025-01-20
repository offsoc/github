import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import {App} from './App'
import {BusinessCustomPropertiesPage} from './routes/BusinessCustomPropertiesPage'
import {CustomPropertyDetailsPage} from './routes/CustomPropertyDetailsPage'
import {OrgCustomPropertiesPage} from './routes/OrgCustomPropertiesPage'
import {RepoCustomPropertiesPage} from './routes/RepoCustomPropertiesPage'
import {RepoSettingsCustomPropertiesPage} from './routes/RepoSettingsCustomPropertiesPage'

export const propertiesRoute = jsonRoute({
  path: '/:org/:repo/settings/custom-properties',
  Component: RepoSettingsCustomPropertiesPage,
})

export const definitionsRoute = jsonRoute({
  path: '/organizations/:org/settings/custom-properties',
  Component: OrgCustomPropertiesPage,
})

export const editDefinitionRoute = jsonRoute({
  path: '/organizations/:org/settings/custom-property/:propertyName',
  Component: CustomPropertyDetailsPage,
})

const createDefinitionRoute = jsonRoute({
  path: '/organizations/:org/settings/custom-property',
  Component: CustomPropertyDetailsPage,
})

export const repoCustomPropertiesRoute = jsonRoute({
  path: '/:org/:repo/custom-properties',
  Component: RepoCustomPropertiesPage,
})

export const businessCustomPropertiesRoute = jsonRoute({
  path: '/enterprises/:business/settings/custom-properties',
  Component: BusinessCustomPropertiesPage,
})

const newBusinessPropertyDefinitionRoute = jsonRoute({
  path: '/enterprises/:business/settings/custom-property',
  Component: CustomPropertyDetailsPage,
})

export const editBusinessPropertyDefinitionRoute = jsonRoute({
  path: '/enterprises/:business/settings/custom-property/:propertyName',
  Component: CustomPropertyDetailsPage,
})

registerReactAppFactory('custom-properties', () => ({
  App,
  routes: [
    repoCustomPropertiesRoute,
    propertiesRoute,
    createDefinitionRoute,
    editDefinitionRoute,
    definitionsRoute,
    businessCustomPropertiesRoute,
    newBusinessPropertyDefinitionRoute,
    editBusinessPropertyDefinitionRoute,
  ],
}))
