import ISSUE_VIEWER_VIEW_QUERY from '@github-ui/issue-viewer/IssueViewerViewQuery.graphql'
import CURRENT_REPOSITORY_QUERY from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import TOP_REPOSITORIES_QUERY from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {relayRoute} from '@github-ui/relay-route'

import {App} from './App'
import CUSTOM_VIEWS_QUERY from './components/sidebar/__generated__/SavedViewsQuery.graphql'
import {clientSideRelayDataGenerator, setRecordMap} from './pages/ClientSideRelayDataGenerator'
import {IssueDashboardCustomViewPage} from './pages/IssueDashboardCustomViewPage'
import {IssueDashboardKnownViewPage} from './pages/IssueDashboardKnownViewPage'
import {IssueDashboardPage} from './pages/IssueDashboardPage'
import {IssueIndexPage} from './pages/IssueIndexPage'
import {IssueShowPage} from './pages/IssueShowPage'
import CURRENT_VIEW_QUERY from './pages/__generated__/ClientSideRelayDataGeneratorViewQuery.graphql'
import ISSUE_DASHBOARD_CUSTOM_VIEW_PAGE_QUERY from './pages/__generated__/IssueDashboardCustomViewPageQuery.graphql'
import ISSUE_DASHBOARD_KNOWN_VIEW_PAGE_QUERY from './pages/__generated__/IssueDashboardKnownViewPageQuery.graphql'
import ISSUE_INDEX_PAGE_QUERY from './pages/__generated__/IssueIndexPageQuery.graphql'
import {IssueDashboardNewPage} from './pages/issue-new/IssueDashboardNewPage'
import {IssueRepoNewPage} from './pages/issue-new/IssueRepoNewPage'
import URL_ARGUMENTS_METADATA_QUERY from './pages/issue-new/__generated__/InternalIssueNewPageUrlArgumentsMetadataQuery.graphql'
import {VARIABLE_TRANSFORMERS} from './utils/variable-transformers'
import type {ErrorCallbacks} from '@github-ui/fetch-graphql'

const isDevelopment = () => process.env.NODE_ENV === 'development'

const reloadPage = () => {
  const reloadParameter = ['reload', '1'] as const
  const url = new URL(window.location.href, window.location.origin)

  /**
   * Return early when the parameter already exists to avoid an infinite loop
   */
  if (url.searchParams.has(...reloadParameter)) {
    return
  }

  url.searchParams.set(...reloadParameter)
  // Reload the page
  window.location.assign(url)
}

registerReactAppFactory('issues-react', () => {
  const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()
  setRecordMap(relayEnvironment)
  clientSideRelayDataGenerator({environment: relayEnvironment})

  const errorCallbacks: ErrorCallbacks = {
    404: {
      // handle authentication error
      AUTHENTICATION: reloadPage,
    },
    200: {
      // handle SAML error
      FORBIDDEN: reloadPage,
    },
  }

  const relayRouteConfig = {
    componentLoader: async () => {
      throw new Error('This method should not be called')
    },
    fallback: isDevelopment() ? 'Loading...' : '',
    relayEnvironment,
  }
  return {
    App,
    routes: [
      relayRoute({
        ...relayRouteConfig,
        path: '/:owner/:name/issues/new',
        resourceName: 'IssueRepoNew',
        title: 'New Issue',
        Component: IssueRepoNewPage,
        transformVariables: VARIABLE_TRANSFORMERS['/:owner/:name/issues/new'],
        queryConfigs: {
          currentRepositoryQuery: {
            concreteRequest: CURRENT_REPOSITORY_QUERY,
            variableMappers: routeParams => {
              return {
                owner: routeParams.pathParams['owner'],
                name: routeParams.pathParams['name'],
              }
            },
          },
          urlArgumentsMetadataQuery: {
            concreteRequest: URL_ARGUMENTS_METADATA_QUERY,
            variableMappers: routeParams => {
              return {
                owner: routeParams.pathParams['owner'],
                name: routeParams.pathParams['name'],
              }
            },
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/:owner/:name/issues/new/choose',
        resourceName: 'IssueRepoNew',
        title: 'New Issue',
        Component: IssueRepoNewPage,
        transformVariables: VARIABLE_TRANSFORMERS['/:owner/:name/issues/new/choose'],
        queryConfigs: {
          currentRepositoryQuery: {
            concreteRequest: CURRENT_REPOSITORY_QUERY,
            variableMappers: routeParams => {
              return {
                owner: routeParams.pathParams['owner'],
                name: routeParams.pathParams['name'],
              }
            },
          },
          urlArgumentsMetadataQuery: {
            concreteRequest: URL_ARGUMENTS_METADATA_QUERY,
            variableMappers: routeParams => {
              return {
                owner: routeParams.pathParams['owner'],
                name: routeParams.pathParams['name'],
              }
            },
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/issues/new',
        resourceName: 'NewIssue',
        title: 'New Issue',
        Component: IssueDashboardNewPage,
        transformVariables: VARIABLE_TRANSFORMERS['/issues/new'],
        queryConfigs: {
          topRepositoriesQuery: {
            concreteRequest: TOP_REPOSITORIES_QUERY,
          },
          currentRepositoryQuery: {
            concreteRequest: CURRENT_REPOSITORY_QUERY,
            variableMappers: () => {
              return {name: undefined, owner: undefined}
            },
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/issues/assigned',
        resourceName: 'ClientSideView',
        title: 'Assigned to me',
        Component: IssueDashboardKnownViewPage,
        transformVariables: VARIABLE_TRANSFORMERS['/issues/assigned'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_DASHBOARD_KNOWN_VIEW_PAGE_QUERY,
          },
          customViewsQuery: {
            concreteRequest: CUSTOM_VIEWS_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/issues/mentioned',
        resourceName: 'ClientSideView',
        title: 'Mentioned',
        Component: IssueDashboardKnownViewPage,
        transformVariables: VARIABLE_TRANSFORMERS['/issues/mentioned'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_DASHBOARD_KNOWN_VIEW_PAGE_QUERY,
          },
          customViewsQuery: {
            concreteRequest: CUSTOM_VIEWS_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/issues/createdByMe',
        resourceName: 'ClientSideView',
        title: 'Created by me',
        Component: IssueDashboardKnownViewPage,
        transformVariables: VARIABLE_TRANSFORMERS['/issues/createdByMe'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_DASHBOARD_KNOWN_VIEW_PAGE_QUERY,
          },
          customViewsQuery: {
            concreteRequest: CUSTOM_VIEWS_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/issues/recentActivity',
        resourceName: 'ClientSideView',
        title: 'Recent Activity',
        Component: IssueDashboardKnownViewPage,
        transformVariables: VARIABLE_TRANSFORMERS['/issues/recentActivity'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_DASHBOARD_KNOWN_VIEW_PAGE_QUERY,
          },
          customViewsQuery: {
            concreteRequest: CUSTOM_VIEWS_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/:owner/:repo/issues/:number',
        resourceName: 'IssueShow',
        title: 'Issue',
        Component: IssueShowPage,
        transformVariables: VARIABLE_TRANSFORMERS['/:owner/:repo/issues/:number'],
        queryConfigs: {
          issueViewerViewQuery: {
            concreteRequest: ISSUE_VIEWER_VIEW_QUERY,
            variableMappers: routeParams => {
              return {
                owner: routeParams.pathParams['owner'],
                repo: routeParams.pathParams['repo'],
                number: routeParams.pathParams['number'] ? parseInt(routeParams.pathParams['number']) : undefined,
              }
            },
          },
        },
        maxAge: 10,
        errorCallbacks,
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/:owner/:repo/issues',
        resourceName: 'IssueRepoIndex',
        title: 'Repo Issues',
        Component: IssueIndexPage,
        transformVariables: VARIABLE_TRANSFORMERS['/:owner/:repo/issues'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_INDEX_PAGE_QUERY,
          },
        },
        errorCallbacks,
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/issues/:id',
        resourceName: 'View',
        title: 'View',
        Component: IssueDashboardCustomViewPage,
        transformVariables: VARIABLE_TRANSFORMERS['/issues/:id'],
        queryConfigs: {
          currentViewQuery: {
            concreteRequest: CURRENT_VIEW_QUERY,
            variableMappers: routeParams => {
              return {
                id: routeParams.pathParams['id'],
              }
            },
          },
          pageQuery: {
            concreteRequest: ISSUE_DASHBOARD_CUSTOM_VIEW_PAGE_QUERY,
          },
          customViewsQuery: {
            concreteRequest: CUSTOM_VIEWS_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/issues',
        resourceName: 'IssuesIndex',
        title: 'Issues',
        Component: IssueDashboardPage,
        transformVariables: VARIABLE_TRANSFORMERS['/issues'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_DASHBOARD_KNOWN_VIEW_PAGE_QUERY,
          },
          customViewsQuery: {
            concreteRequest: CUSTOM_VIEWS_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/:owner/:repo/issues/created_by/:author',
        resourceName: 'IssueRepoIndex',
        title: 'Repo Issues',
        Component: IssueIndexPage,
        transformVariables: VARIABLE_TRANSFORMERS['/:owner/:repo/issues/created_by/:author'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_INDEX_PAGE_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/:owner/:repo/issues/assigned/:assignee',
        resourceName: 'IssueRepoIndex',
        title: 'Repo Issues',
        Component: IssueIndexPage,
        transformVariables: VARIABLE_TRANSFORMERS['/:owner/:repo/issues/assigned/:assignee'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_INDEX_PAGE_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/:owner/:repo/issues/mentioned/:mentioned',
        resourceName: 'IssueRepoIndex',
        title: 'Repo Issues',
        Component: IssueIndexPage,
        transformVariables: VARIABLE_TRANSFORMERS['/:owner/:repo/issues/mentioned/:mentioned'],
        queryConfigs: {
          pageQuery: {
            concreteRequest: ISSUE_INDEX_PAGE_QUERY,
          },
        },
      }),
    ],
  }
})
