import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {relayRoute} from '@github-ui/relay-route'
import type {RouteParams, VariableTransformer} from '@github-ui/relay-route/types'

import {App} from './App'
import PULL_REQUEST_ACTIVITY_CONTENT_QUERY from './components/__generated__/PullRequestActivityViewerContentQuery.graphql'
import PULL_REQUEST_COMMITS_VIEWER_CONTENT_QUERY from './components/__generated__/PullRequestCommitsViewerContentQuery.graphql'
import PULL_REQUEST_FILES_CONTENT_QUERY from './components/__generated__/PullRequestFilesViewerContentQuery.graphql'
import PULL_REQUEST_MAIN_CONTENT_AREA_QUERY from './components/__generated__/PullRequestMainContentAreaQuery.graphql'
import PULL_REQUEST_SUMMARY_VIEWER_CONTENT_QUERY from './components/__generated__/PullRequestSummaryViewerContentQuery.graphql'
import PULL_REQUEST_SUMMARY_VIEWER_SECONDARY_CONTENT_QUERY from './components/__generated__/PullRequestSummaryViewerSecondaryContentQuery.graphql'
import DEFERRED_COMMITS_DATA_LOADER_QUERY from './components/commits/__generated__/DeferredCommitsDataLoaderQuery.graphql'
import PULL_REQUEST_DETAILS_PANE_QUERY from './components/details-pane/__generated__/DetailsPaneQuery.graphql'
import PULL_REQUEST_VIEWER_HEADER_QUERY from './components/header/__generated__/PullRequestHeaderWrapperQuery.graphql'
import {RELAY_CONSTANTS} from './constants'
import {PullRequestActivityPage} from './pages/PullRequestActivityPage'
import {PullRequestCommitsPage} from './pages/PullRequestCommitsPage'
import {PullRequestFilesPage} from './pages/PullRequestsFilesPage'
import {PullRequestSummaryPage} from './pages/PullRequestSummaryPage'
import {parseCommitRange} from './utils/urls'

const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()
const variableMappers = (routeParams: RouteParams<'owner' | 'repo' | 'number'>) => {
  return {
    owner: routeParams.pathParams['owner'],
    repo: routeParams.pathParams['repo'],
    number: routeParams.pathParams['number'] ? parseInt(routeParams.pathParams['number']) : undefined,
  }
}

const variableMappersWithTimelinePageSize = (routeParams: RouteParams<'owner' | 'repo' | 'number'>) => {
  return {...variableMappers(routeParams), timelinePageSize: RELAY_CONSTANTS.timelinePageSize}
}

const sharedQueries = {
  headerQuery: {
    concreteRequest: PULL_REQUEST_VIEWER_HEADER_QUERY,
    variableMappers,
  },

  mainContentAreaQuery: {
    concreteRequest: PULL_REQUEST_MAIN_CONTENT_AREA_QUERY,
    variableMappers,
  },
}

const showPageQueries = {
  ...sharedQueries,
  contentQuery: {
    concreteRequest: PULL_REQUEST_SUMMARY_VIEWER_CONTENT_QUERY,
    variableMappers,
  },
  secondaryContentQuery: {
    concreteRequest: PULL_REQUEST_SUMMARY_VIEWER_SECONDARY_CONTENT_QUERY,
    variableMappers: variableMappersWithTimelinePageSize,
  },
  detailsPaneQuery: {
    concreteRequest: PULL_REQUEST_DETAILS_PANE_QUERY,
    variableMappers,
  },
}

const filesPageQueries = {
  ...sharedQueries,
  contentQuery: {
    concreteRequest: PULL_REQUEST_FILES_CONTENT_QUERY,
    variableMappers,
  },
}

const activityPageViewQueries = {
  ...sharedQueries,
  contentQuery: {
    concreteRequest: PULL_REQUEST_ACTIVITY_CONTENT_QUERY,
    variableMappers: variableMappersWithTimelinePageSize,
  },
}

const commitsPageViewQueries = {
  ...sharedQueries,
  contentQuery: {
    concreteRequest: PULL_REQUEST_COMMITS_VIEWER_CONTENT_QUERY,
    variableMappers,
  },
  deferredCommitsDataQuery: {
    concreteRequest: DEFERRED_COMMITS_DATA_LOADER_QUERY,
    variableMappers,
  },
}

const sharedConfig = {
  relayEnvironment,
  title: '', // We are setting the page title in the component, if we set it here it will be overwritten
  fallback: 'Loading...',
  componentLoader: () => {
    throw new Error('This method should not be called')
  },
}

const commitRangeTransformer: VariableTransformer<'range'> = (variables, routeParams) => {
  const commitData = routeParams.pathParams['range']
  if (commitData) {
    const commitVariables = parseCommitRange(commitData)
    return {
      ...variables,
      ...commitVariables,
      // used to conditionally load graphql data for single commit view
      isSingleCommit: !!commitVariables && 'singleCommitOid' in commitVariables,
    }
  }

  return variables
}

registerReactAppFactory('pull-request-viewer', () => ({
  App,
  routes: [
    relayRoute({
      ...sharedConfig,
      path: '/_view_fragments/voltron/pull_requests/show/:owner/:repo/:number/pull_request_layout',
      Component: PullRequestSummaryPage,
      queryConfigs: showPageQueries,
    }),
    relayRoute({
      ...sharedConfig,
      path: '/:owner/:repo/pull/:number',
      Component: PullRequestSummaryPage,
      queryConfigs: showPageQueries,
    }),
    relayRoute({
      ...sharedConfig,
      path: '/:owner/:repo/pull/:number/prx',
      Component: PullRequestSummaryPage,
      queryConfigs: showPageQueries,
    }),
    relayRoute({
      ...sharedConfig,
      path: '/:owner/:repo/pull/:number/files',
      Component: PullRequestFilesPage,
      queryConfigs: filesPageQueries,
    }),
    relayRoute({
      ...sharedConfig,
      path: '/:owner/:repo/pull/:number/files/:range',
      Component: PullRequestFilesPage,
      queryConfigs: filesPageQueries,
      transformVariables: commitRangeTransformer,
    }),
    relayRoute({
      ...sharedConfig,
      path: '/:owner/:repo/pull/:number/commits',
      Component: PullRequestCommitsPage,
      queryConfigs: commitsPageViewQueries,
    }),
    relayRoute({
      ...sharedConfig,
      path: '/:owner/:repo/pull/:number/commits/:range',
      Component: PullRequestFilesPage,
      queryConfigs: filesPageQueries,
      transformVariables: commitRangeTransformer,
    }),
    relayRoute({
      ...sharedConfig,
      path: '/:owner/:repo/pull/:number/activity',
      Component: PullRequestActivityPage,
      queryConfigs: activityPageViewQueries,
    }),
  ],
}))
