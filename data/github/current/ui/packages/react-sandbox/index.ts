import {TransitionType} from '@github-ui/react-core/app-routing-types'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {App} from './App'
import {SandboxLayoutWithOutlet} from './SandboxLayout'
import {CssModules} from './routes/CssModules/CssModules'
import {FilterPage} from './routes/Filter'
import {IndexPage} from './routes/Index'
import {SSRErrorPage} from './routes/SSRError'
import {ShowPage} from './routes/Show'
import {relayRoute} from '@github-ui/relay-route'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {Fragment} from 'react/jsx-runtime'
import {createElement} from 'react'
import {RelaySandboxPage} from './routes/RelaySandboxPage/RelaySandboxPage'
import RelaySandboxPageQuery$parameters from './routes/RelaySandboxPage/__generated__/RelaySandboxPageQuery$parameters'

registerReactAppFactory('react-sandbox', () => {
  const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()
  return {
    App,
    routes: [
      jsonRoute({
        path: '/_react_sandbox',
        Component: SandboxLayoutWithOutlet,
        transitionType: TransitionType.TRANSITION_WHILE_FETCHING,
        children: [
          {
            path: '/_react_sandbox',
            Component: IndexPage,
          },
          {
            path: '/_react_sandbox/ssr-error',
            Component: SSRErrorPage,
          },
          {
            path: '/_react_sandbox/:sandbox_id',
            Component: ShowPage,
          },
          {path: '/_react_sandbox/filter', Component: FilterPage},
          {path: '/_react_sandbox/css-modules', Component: CssModules},
        ],
      }),
      relayRoute({
        path: '/_react_sandbox/relay',
        componentLoader: async () => {
          return RelaySandboxPage
        },
        Component: RelaySandboxPage,
        resourceName: 'valid resource name',
        queryConfigs: {
          relaySandboxPage: {
            concreteRequest: RelaySandboxPageQuery$parameters,
          },
        },
        title: 'title',
        relayEnvironment,
        fallback: createElement(Fragment),
      }),
    ],
  }
})
