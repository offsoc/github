import {AppContextProvider} from './AppContextProvider'
import {type AppComponentType, AppWrapper} from './AppWrapper'
import type {PageError} from './app-routing-types'
import type {AppRegistration} from './react-app-registry'
import {type Location, type Router as ReactRouterRouter, useRoutes} from 'react-router-dom'
import type {History} from '@remix-run/router'
import type {RouteStateMap} from './use-navigator'
import {ErrorPage} from './ErrorPage'
import {AppPayloadContext} from './use-app-payload'
import {createContext} from 'react'
import {RouteStateMapContext} from './route-state-map-context'

export const NavigationErrorContext = createContext<PageError | null>(null)

interface Props {
  App?: AppComponentType
  appPayload: unknown

  /**
   * Children will be included within the router context, but outside and after any routes.
   */
  children?: React.ReactNode
  error: PageError | null
  history: History
  location: Location
  navigateOnError: boolean
  Router: typeof ReactRouterRouter
  routes: AppRegistration['routes']
  routeStateMap: RouteStateMap
}

/**
 * Given a list of React core routes and routing state, render the app. The implementation of this component should be
 * client/server agnostic, and differences probably should live in the appropriate Entry instead.
 */
export function AppRouter({
  App,
  appPayload,
  children,
  error,
  history,
  location,
  navigateOnError,
  Router,
  routes,
  routeStateMap,
}: Props) {
  return (
    <AppContextProvider routes={routes} history={history}>
      {error && !navigateOnError ? (
        <ErrorPage {...error} />
      ) : (
        <AppPayloadContext.Provider value={appPayload}>
          <NavigationErrorContext.Provider value={error}>
            <RouteStateMapContext.Provider value={routeStateMap}>
              <Router location={location} navigator={history}>
                <AppRoutes routes={routes} App={App} />
                {children}
              </Router>
            </RouteStateMapContext.Provider>
          </NavigationErrorContext.Provider>
        </AppPayloadContext.Provider>
      )}
    </AppContextProvider>
  )
}

function AppRoutes({App, routes}: Pick<Props, 'routes' | 'App'>) {
  return useRoutes([{element: <AppWrapper App={App} />, children: routes}])
}
