import {useNavigator} from './use-navigator'
import {StaticRouter} from 'react-router-dom/server'
import {ErrorBoundary} from './ErrorBoundary'
import type {EmbeddedData} from './embedded-data-types'
import type {AppRegistration} from './react-app-registry'
import {BaseProviders} from './BaseProviders'
import {CommonElements} from './CommonElements'
import type {History, Location} from '@remix-run/router'
import type {AppComponentType} from './AppWrapper'
import {AppRouter} from './AppRouter'

interface Props {
  appName: string
  history: History
  embeddedData: EmbeddedData
  routes: AppRegistration['routes']
  App?: AppComponentType
  initialLocation: Location<unknown>
}

export function ServerEntry({appName, history, embeddedData, routes, App, initialLocation}: Props) {
  // We create our "app" here. The app is a state machine that lets you dispatch a history update
  // and gives you a resolved location (after e.g., loading, redirects, etc.)
  const [{location, error, routeStateMap, appPayload, navigateOnError}] = useNavigator({
    initialLocation,
    appName,
    embeddedData,
    routes,
  })

  return (
    <BaseProviders appName={appName} wasServerRendered={true}>
      <ErrorBoundary>
        <AppRouter
          App={App}
          appPayload={appPayload}
          error={error}
          history={history}
          location={location}
          navigateOnError={navigateOnError}
          Router={StaticRouter}
          routes={routes}
          routeStateMap={routeStateMap}
        >
          <CommonElements />
        </AppRouter>
      </ErrorBoundary>
    </BaseProviders>
  )
}
