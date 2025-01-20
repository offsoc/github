import {App} from './App'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {OrganizationIssueTypesSettings} from './routes/OrganizationIssueTypesSettings'
import {relayRoute} from '@github-ui/relay-route'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import ORGANIZATION_TYPE_SETTINGS_QUERY from './routes/__generated__/OrganizationIssueTypesSettingsQuery.graphql'
import ORGANIZATION_ISSUE_TYPES_SETTINGS_EDIT_QUERY from './routes/__generated__/OrganizationIssueTypesSettingsEditQuery.graphql'
import ORGANIZATION_ISSUE_TYPES_SETTINGS_CREATE_QUERY from './routes/__generated__/OrganizationIssueTypesSettingsCreateQuery.graphql'
import {OrganizationIssueTypesSettingsEdit} from './routes/OrganizationIssueTypesSettingsEdit'
import {OrganizationIssueTypesSettingsCreate} from './routes/OrganizationIssueTypesSettingsCreate'

registerReactAppFactory('issue-types', () => {
  const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()
  return {
    App,
    routes: [
      relayRoute({
        path: '/organizations/:organization_id/settings/issue-types',
        resourceName: 'OrganizationIssueTypeSettings',
        title: 'Organization Issue Type settings',
        fallback: 'Loading...',
        componentLoader: async () => {
          throw new Error('This method should not be called')
        },
        Component: OrganizationIssueTypesSettings,
        relayEnvironment,
        queryConfigs: {
          organizationIssueTypesSettingsQuery: {
            concreteRequest: ORGANIZATION_TYPE_SETTINGS_QUERY,
            variableMappers: routeParams => {
              return {
                organization_id: routeParams.pathParams['organization_id'],
              }
            },
          },
        },
      }),
      relayRoute({
        path: '/organizations/:organization_id/settings/issue-types/new',
        resourceName: 'OrganizationIssueTypesSettingsCreate',
        title: 'Create a new Issue Type',
        fallback: 'Loading...',
        componentLoader: async () => {
          throw new Error('This method should not be called')
        },
        Component: OrganizationIssueTypesSettingsCreate,
        relayEnvironment,
        queryConfigs: {
          organizationIssueTypesSettingsCreateQuery: {
            concreteRequest: ORGANIZATION_ISSUE_TYPES_SETTINGS_CREATE_QUERY,
            variableMappers: routeParams => {
              return {
                organization_id: routeParams.pathParams['organization_id'],
              }
            },
          },
        },
      }),
      relayRoute({
        path: '/organizations/:organization_id/settings/issue-types/:id',
        resourceName: 'OrganizationIssueTypesSettingsEdit',
        title: 'Edit Issue Type',
        fallback: 'Loading...',
        componentLoader: async () => {
          throw new Error('This method should not be called')
        },
        Component: OrganizationIssueTypesSettingsEdit,
        relayEnvironment,
        queryConfigs: {
          organizationIssueTypesSettingsEditQuery: {
            concreteRequest: ORGANIZATION_ISSUE_TYPES_SETTINGS_EDIT_QUERY,
            variableMappers: routeParams => {
              return {
                organization_id: routeParams.pathParams['organization_id'],
                id: routeParams.pathParams['id'],
              }
            },
          },
        },
      }),
    ],
  }
})
