import type React from 'react'
import type {Location, Params} from 'react-router-dom'

export interface PageError {
  httpStatus?: number
  type: 'fetchError' | 'httpError' | 'badResponseError'
}

export type ChildRoute = {path: string; Component: React.ComponentType; children?: ChildRoute[]}
/**
 * All the information the framework needs about a route.
 *
 * Note: you most often want to use one of the route registration helpers like jsonRoute or relayRoute
 */
export interface RouteRegistration<TRouteData = unknown, TEmbeddedData = unknown> {
  /**
   * The path pattern to match against.
   * @see {@link https://reactrouter.com/en/main/route/route#path}
   */
  path: string

  /**
   * The component to render when the route matches
   */
  Component: React.ComponentType

  /**
   * A function mapping from the initial embedded data on a page to the data for that route.
   * JSON-island routes might simply pass through the embedded data, while other routes may
   * need to construct parts of the data based on provided information about the request. Note
   * that this function must return the data type and not a promise, as that would block the
   * initial render of the app.
   */
  loadFromEmbeddedData: (initialDataArgs: {
    embeddedData: TEmbeddedData
    location: Location
    pathParams: Params<string>
  }) => {data: TRouteData; title: string}

  /**
   * A function that returns a promise for the data to be loaded for this route.
   *
   * Note: this was Renamed from `loader` to disambiguate from React Router `loader`s.
   */
  coreLoader: (loaderArgs: {location: Location; pathParams: Params<string>}) => Promise<LoaderResult<TRouteData>>

  /**
   * The transition type for this route.
   * @see {@link TransitionType}
   */
  transitionType?: TransitionType

  children?: ChildRoute[]
}

/**
 * The possible results to be returned by a loader function.
 */
export type LoaderResult<TRouteData> =
  | LoaderResultLoaded<TRouteData>
  // TODO: when we add Relay support, we'll likely want to use LoaderResultPrepared:
  // | LoaderResultPrepared<TRouteData>
  | LoaderResultRedirect
  | LoaderResultError
  | LoaderResultRouteHandledError

/**
 * When the route wants to be shown and the primary data for the page is ready for render.
 */
export interface LoaderResultLoaded<TRouteData> {
  type: 'loaded'
  data: TRouteData
  title: string
}

/**
 * When the route wants to be shown but is not yet fully loaded. This will be used by Relay routes, and routes that
 * want to manage their own loading state.
 */
// interface LoaderResultPrepared<TRouteData> {
//   type: 'prepared'
//   data?: TRouteData
//   finalResult: Promise<LoaderResult<TRouteData>>
// }

interface LoaderResultRedirect {
  type: 'redirect'
  url: string
}

interface LoaderResultError {
  type: 'error'
  error: PageError
}

/**
 * This is a special case of a loader result that is used when an error occurs, but it should be handled by the route
 * itself and not the framework.
 */
interface LoaderResultRouteHandledError {
  type: 'route-handled-error'
  error: PageError
}

/**
 * The transition type defines whether, when soft navigating to this route, the framework begins:
 *  - FETCH_THEN_TRANSITION => (default) rendering the page after a response has been received for the corresponding fetch of JSON
 *  - TRANSITION_WHILE_FETCHING => rendering the page before a response has been received for the corresponding fetch of JSON
 *  - TRANSITION_WITHOUT_FETCH => rendering the page without a fetch of JSON
 */
export const enum TransitionType {
  FETCH_THEN_TRANSITION = 'fetch-then-transition',
  TRANSITION_WHILE_FETCHING = 'transition-while-fetch',
  TRANSITION_WITHOUT_FETCH = 'transition-without-fetch',
}
