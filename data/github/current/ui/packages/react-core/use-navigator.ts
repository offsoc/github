import {startSoftNav} from '@github-ui/soft-nav/state'
import {ssrSafeHistory} from '@github-ui/ssr-utils'
import type {AgnosticRouteMatch, History} from '@remix-run/router'
import {startTransition, useCallback, useRef, useState} from 'react'
import type {Location} from 'react-router-dom'
import {matchRoutes} from 'react-router-dom'
import {TransitionType, type PageError, type RouteRegistration} from './app-routing-types'
import type {EmbeddedData} from './embedded-data-types'
import type {AppRegistration} from './react-app-registry'
import type {RouteState} from './route-state'
import {isHashNav} from './use-title-manager'

type Key = Location['key']
type Update = Parameters<Parameters<History['listen']>[0]>[0]

/**
 * A map from location key to route data.
 */
export type RouteStateMap = Record<Key, RouteState>

interface AppNavigationState {
  location: Location
  error: PageError | null
  navigateOnError: boolean
  routeStateMap: RouteStateMap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appPayload: any
  isLoading: boolean
}

interface AppNavigationMutations {
  handleHistoryUpdate: (update: Update) => void
}

type Result = [AppNavigationState, AppNavigationMutations]

type AppNavigationStateCallback = (
  state: AppNavigationState | ((prevState: AppNavigationState) => AppNavigationState),
) => void

interface ManagerState {
  /**
   * The location the app should render (and when there is a pendingNavigation, this is the "old" location)
   */
  location: Location

  /**
   * The error with the current location. TODO: should we be including this in responses?
   */
  error: PageError | null

  /**
   * Whether the app should navigate to the route page when there is an error
   */
  navigateOnError: boolean

  /**
   * Map from history-provided location key to a data blob for that page:
   */
  routeStateMap: RouteStateMap

  /**
   * Data for the app provided by the controller (independent of the location). This data is not scoped to a single
   * route within the React app and currently has no mechanism to be updated.
   */
  appPayload: unknown

  /**
   * The current navigation in progress.
   */
  pendingNavigation: {
    update: Update
  } | null

  /**
   * Counter indicating how many turbo navs happened. This will be used to know if a navigation was managed by turbo
   * when navigating using history.
   */
  turboCount: number
}

/**
 * Navigator is a state machine that handles navigation events and fetch results. State is pushed back into react via
 * the setAppNavigationState callback passed to the constructor.
 */
class Navigator {
  state: ManagerState
  private appNavigationStateCallback?: AppNavigationStateCallback

  constructor(
    initialLocation: Location,
    embeddedData: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appPayload: any,
    private routes: AppRegistration['routes'],
  ) {
    const matchedRoute = this.matchLocation(initialLocation)
    if (!matchedRoute) {
      throw new Error(`No route found for initial location: ${initialLocation.pathname} in [${this.getRoutesText()}]`)
    }
    const {data, title} = matchedRoute.route.loadFromEmbeddedData({
      embeddedData,
      location: initialLocation,
      pathParams: matchedRoute.params,
    })

    this.state = {
      location: initialLocation,
      routeStateMap: {[initialLocation.key]: {type: 'loaded', data, title}},
      appPayload,
      pendingNavigation: null,
      error: null,
      navigateOnError: false,
      turboCount: ssrSafeHistory?.state?.turboCount,
    }
  }

  setAppNavigationStateCallback(appNavigationStateCallback: AppNavigationStateCallback) {
    this.appNavigationStateCallback = appNavigationStateCallback
  }

  // On calls to `update` we update internal state _and_ call the setAppNavigationState callback passed to our constructor
  update(updates: Partial<ManagerState>) {
    Object.assign(this.state, updates) // we could make this a deepmerge if it proved helpful

    const appNavigationState = this.getAppNavigationState()
    this.appNavigationStateCallback?.(appNavigationState)
  }

  getAppNavigationState(): AppNavigationState {
    const {location, error, navigateOnError, routeStateMap: routeStateMap, appPayload, pendingNavigation} = this.state
    return {
      location,
      error,
      navigateOnError,
      routeStateMap,
      appPayload,
      isLoading: Boolean(pendingNavigation),
    }
  }

  async handleHistoryUpdate(update: Update) {
    // If the `turboCount` is different, it means that the navigation was managed by Turbo so Turbo should
    // also do the restore.
    if (update.action === 'POP' && history.state?.turboCount !== this.state.turboCount) return
    // Do not load any new data if we are simply setting a hash location
    if (this.isHashNavigation(update)) {
      this.navigateWithCurrentPayload(update)
      return
    }

    // We don't want to trigger soft navigations when using the back/forward buttons.
    if (update.action !== 'POP') startSoftNav('react')

    // TODO: check for and cancel a pending navigation
    // TODO: make sure this isn't the current page?
    if (this.state.routeStateMap[update.location.key] !== undefined) {
      this.navigateFromHistory(update)
    } else {
      const matchedRoute = this.matchLocation(update.location)
      if (!matchedRoute) {
        throw new Error('handleHistoryUpdate should only be called for matching routes')
      }

      if (matchedRoute.route.transitionType === TransitionType.TRANSITION_WHILE_FETCHING) {
        this.navigateWithoutPayload(update)
      }
      if (matchedRoute.route.transitionType === TransitionType.TRANSITION_WITHOUT_FETCH) {
        this.navigateWithoutPayload(update)
        return
      }

      this.enterLoadingState(update)

      const loaderResult = await matchedRoute.route.coreLoader({
        location: update.location,
        pathParams: matchedRoute.params,
      })

      // this update is no longer the latest pending navigation, so we can ignore the result
      if (update.location !== this.state.pendingNavigation?.update.location) {
        return
      }

      if (history.state && update.action !== 'POP') {
        const {turbo, ...state} = history.state

        // When using React to navigate, we don't want Turbo to set restorationIdentifiers. Without
        // the identifier, Turbo won't try to restore the page and cause an unwanted request.
        history.replaceState({...state, skipTurbo: true}, '', location.href)
      }

      switch (loaderResult.type) {
        case 'loaded':
          this.leaveLoadingStateWithRouteData(update, loaderResult.data, loaderResult.title)
          break
        case 'error':
          this.leaveLoadingStateWithError(update, loaderResult.error, false)
          break
        case 'redirect':
          // At this point, window.history.pushState will have already been called
          // with the pre-redirect URL. So we want to (a) ensure that URL doesn't stay
          // in history and (b) force a hard navigation. We can achieve that by calling
          // window.location.replace.

          // NOTE: even if `response.url` is redirecting within this app, we'll still
          // force a hard navigation. We might consider supporting a soft navigation to
          // some redirected URLs if it turns out to be common enough that the better UX
          // is worth the increased code complexity.

          // Redirects don't preserve hash, so we need to manually add it back
          window.location.replace(loaderResult.url + location.hash)
          break
        case 'route-handled-error':
          this.leaveLoadingStateWithError(update, loaderResult.error, true)
          break
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(`Unexpected loader result type: ${(loaderResult as any).type}`)
      }
    }
  }

  matchLocation(location: Location): AgnosticRouteMatch<string, RouteRegistration<unknown, unknown>> | undefined {
    return matchLocation(this.routes, location)
  }

  isHashNavigation(update: Update) {
    const current = this.state.location
    const target = update.location

    return isHashNav(current, target)
  }

  //
  // State transitions
  //

  navigateFromHistory(update: Update) {
    this.update({
      location: update.location,
      pendingNavigation: null,
      error: null,
    })
  }

  enterLoadingState(update: Update) {
    this.update({pendingNavigation: {update}})
  }

  leaveLoadingStateWithError(update: Update, error: PageError, navigateOnError: boolean) {
    this.update({location: update.location, error, pendingNavigation: null, navigateOnError})
  }

  navigateWithoutPayload(update: Update) {
    this.update({location: update.location, error: null})
  }

  // when navigating with a hash, we don't want to fetch any new data
  // however, react router will give us a bad location.key:
  // 1. if the navigation was via RR Link, the key will be a new hash that we don't have in our routeStateMap
  // 2. if the navigation was via the browser, the key will be the string "default"
  // so we need to create a new key and copy the response from the current location
  navigateWithCurrentPayload(update: Update) {
    const currentLocationKey = this.state.location.key
    const updateLocationKey = currentLocationKey + update.location.hash
    const location = {...update.location, key: updateLocationKey}
    const routeStateMap = {
      ...this.state.routeStateMap,
      [updateLocationKey]: this.state.routeStateMap[currentLocationKey]!,
    }

    this.update({...update, location, routeStateMap, error: null})
  }

  leaveLoadingStateWithRouteData(update: Update, data: unknown, title: string) {
    this.update({
      location: update.location,
      pendingNavigation: null,
      routeStateMap: data
        ? {...this.state.routeStateMap, [update.location.key]: {type: 'loaded', data, title}}
        : this.state.routeStateMap,
      error: null,
    })
  }

  private getRoutesText(): string {
    return this.routes.map(route => route.path).join(', ')
  }
}

export function matchLocation(
  routes: Array<RouteRegistration<unknown, unknown>>,
  location: Location,
): AgnosticRouteMatch<string, RouteRegistration<unknown, unknown>> | undefined {
  return matchRoutes(routes, location.pathname)?.[0]
}

export function useNavigator({
  initialLocation,
  embeddedData,
  routes,
}: {
  initialLocation: Location
  appName: string
  embeddedData: EmbeddedData
  routes: AppRegistration['routes']
}): Result {
  // because we want to keep the navigator in state, with a reference to the callback, and also with the state set on
  // the first render, we do a little dance where we first create the navigator, then use create the state, then use
  // a ref to only set the callback on the navigator once:

  const [navigator] = useState((): Navigator => {
    const {appPayload, ...embeddedRouteData} = embeddedData
    return new Navigator(
      initialLocation,
      {...embeddedRouteData, enabled_features: appPayload?.enabled_features ? appPayload.enabled_features : {}}, // TODO: is it safe to assume the island data is associated with this location?
      appPayload,
      routes,
    )
  })

  const [appNavigationState, setAppNavigationState] = useState<AppNavigationState>((): AppNavigationState => {
    return navigator.getAppNavigationState()
  })

  const hasSetCallback = useRef(false)
  if (!hasSetCallback.current) {
    navigator.setAppNavigationStateCallback(setAppNavigationState)
    hasSetCallback.current = true
  }

  const handleHistoryUpdate = useCallback(
    (update: Update) => {
      startTransition(() => {
        navigator.handleHistoryUpdate(update)
      })
    },
    [navigator],
  )

  return [appNavigationState, {handleHistoryUpdate}]
}
