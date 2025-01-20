import {App} from './App'
import {Page} from './routes/Page'
import {RelayPage} from './routes/RelayPage'
import RELAY_PAGE_QUERY from './routes/__generated__/RelayPageQuery.graphql'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {TransitionType} from '@github-ui/react-core/app-routing-types'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {relayRoute} from '@github-ui/relay-route'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'

registerReactAppFactory('navigation-test', () => {
  const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()

  const relayRouteConfig = {
    relayEnvironment,
    resourceName: 'NavigationTest',
    componentLoader: async () => {
      const module = await import('./routes/RelayPage')
      return module.RelayPage
    },
    Component: RelayPage,
    fallback: 'Loading Relay...',
  }

  return {
    App,
    routes: [
      jsonRoute({
        path: '/_navigation_test/react/json/transition_while_fetching',
        Component: Page,
        transitionType: TransitionType.TRANSITION_WHILE_FETCHING,
      }),
      jsonRoute({path: '/_navigation_test/react/json/:kind', Component: Page}),
      relayRoute({
        ...relayRouteConfig,
        path: '/_navigation_test/react/relay/csr',
        title: 'React-Relay CSR · Navigation Test',
        queryConfigs: {
          relayPageQuery: {
            concreteRequest: RELAY_PAGE_QUERY,
          },
        },
      }),
      relayRoute({
        ...relayRouteConfig,
        path: '/_navigation_test/react/relay/ssr',
        title: 'React-Relay SSR · Navigation Test',
        queryConfigs: {
          relayPageQuery: {
            concreteRequest: RELAY_PAGE_QUERY,
          },
        },
      }),
    ],
  }
})
