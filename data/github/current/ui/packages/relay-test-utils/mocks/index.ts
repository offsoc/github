import React from 'react'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import ISSUES_SHOW_QUERY from './__generated__/IssuesShowQuery.graphql'
import VIEWER_QUERY from './__generated__/ViewerQuery.graphql'
import {relayRoute} from '@github-ui/relay-route'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {IssuesShowPage} from './IssuesShow'

registerReactAppFactory('react-sandbox', () => {
  const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()
  return {
    App: ({children}: {children?: React.ReactNode}) => React.Fragment({children}),
    routes: [
      relayRoute({
        path: '/_react_sandbox/:owner/:repo/issues/:number',
        resourceName: 'IssuesShow',
        componentLoader: async () => {
          const module = await import('./IssuesShow')
          return module.IssuesShowPage
        },
        Component: IssuesShowPage,
        queryConfigs: {
          issuesShowQuery: {
            concreteRequest: ISSUES_SHOW_QUERY,
            variableMappers: routeParams => {
              return {
                owner: routeParams.pathParams['owner'],
                repo: routeParams.pathParams['repo'],
                number: routeParams.pathParams['number'] ? parseInt(routeParams.pathParams['number']) : undefined,
              }
            },
          },
          viewerQuery: {
            concreteRequest: VIEWER_QUERY,
          },
        },
        title: 'Sandbox issues',
        relayEnvironment,
        fallback: 'Loading issue show...',
      }),
    ],
  }
})
