import {useNavigator} from './use-navigator'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Router} from 'react-router-dom'
import type {History, Location} from '@remix-run/router'
import {ErrorBoundary} from './ErrorBoundary'
import type {EmbeddedData} from './embedded-data-types'
import type {AppRegistration} from './react-app-registry'
import {BaseProviders} from './BaseProviders'
import {CommonElements} from './CommonElements'
import {useSoftNavLifecycle} from './use-soft-nav-lifecycle'
import {useNavigationFocus} from './use-navigation-focus'
import {useTitleManager} from './use-title-manager'
import {useScrollRestoration, installScrollRestoration} from './use-scroll-restoration'
import type {AppComponentType} from './AppWrapper'
import {AppRouter} from './AppRouter'

installScrollRestoration()

interface Props {
  appName: string
  initialLocation: Location<unknown>
  embeddedData: EmbeddedData
  routes: AppRegistration['routes']
  App?: AppComponentType
  wasServerRendered: boolean
  ssrError?: HTMLScriptElement
  history: History
}

export function ClientEntry({
  appName,
  initialLocation,
  history,
  embeddedData,
  routes,
  App,
  wasServerRendered,
  ssrError,
}: Props) {
  // We create our "app" here. The app is a state machine that lets you dispatch a history update
  // and gives you a resolved location (after e.g., loading, redirects, etc.)
  const [{location, error, routeStateMap, appPayload, navigateOnError, isLoading}, {handleHistoryUpdate}] =
    useNavigator({
      initialLocation,
      appName,
      embeddedData,
      routes,
    })

  useTitleManager(routeStateMap[location.key]!, error, location)
  useNavigationFocus(isLoading, location)
  useSoftNavLifecycle(location, isLoading, error, appName)
  useScrollRestoration()

  // When we get a history update, we send it to our app via handleHistoryUpdate
  // Note, we only want this to run in the browser to avoid SSR warnings about useLayoutEffect
  useLayoutEffect(() => {
    const unlisten = history.listen(handleHistoryUpdate)
    return unlisten
  }, [history, handleHistoryUpdate])

  return (
    <BaseProviders appName={appName} wasServerRendered={wasServerRendered}>
      <ErrorBoundary>
        <AppRouter
          App={App}
          appPayload={appPayload}
          error={error}
          history={history}
          location={location}
          navigateOnError={navigateOnError}
          Router={Router}
          routes={routes}
          routeStateMap={routeStateMap}
        >
          <CommonElements ssrError={ssrError} />
        </AppRouter>
      </ErrorBoundary>
    </BaseProviders>
  )
}
