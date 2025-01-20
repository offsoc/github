import type {ChildRoute, LoaderResult, RouteRegistration, TransitionType} from './app-routing-types'
import type React from 'react'
import type {Location} from '@remix-run/router'

export interface JsonRouteProps {
  path: string
  Component: React.ComponentType
  transitionType?: TransitionType
  shouldNavigateOnError?: boolean
  children?: ChildRoute[]
}
/**
 * A utility for building a route registration for a route that consumes a JSON object (either via embedding in a
 * script tag or via a JSON fetch on React soft navigations).
 */
export function jsonRoute<TRouteData, TEmbeddedData>({
  path,
  Component,
  /**
   * Some routes want to handle their own errors and not just show a generic error page. In this case,
   * the error is just handled like any other payload for the route.
   * NOTE: We might consider replacing the shouldNavigateOnError flag with a parallel implementation to jsonRoute.
   */
  shouldNavigateOnError,
  transitionType,
  children,
}: JsonRouteProps): RouteRegistration<TRouteData, TEmbeddedData> {
  async function coreLoader({location}: {location: Location}): Promise<LoaderResult<TRouteData>> {
    let response: Response
    try {
      const fetchPath = `${location.pathname}${location.search}`
      response = await window.fetch(fetchPath, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-GitHub-Target': 'dotcom',
          'X-React-Router': 'json',
        },
      })
    } catch (error) {
      return {
        type: shouldNavigateOnError ? 'route-handled-error' : 'error',
        error: {type: 'fetchError'},
      }
    }
    if (response.redirected) {
      return {
        type: 'redirect',
        url: response.url,
      }
    } else if (!response.ok) {
      return {
        type: shouldNavigateOnError ? 'route-handled-error' : 'error',
        error: {type: 'httpError', httpStatus: response.status},
      }
    } else {
      try {
        const responseJson = await response.json()
        return {
          type: 'loaded',
          data: responseJson,
          title: responseJson.title,
        }
      } catch (error) {
        return {
          type: shouldNavigateOnError ? 'route-handled-error' : 'error',
          error: {type: 'badResponseError'},
        }
      }
    }
  }

  function loadFromEmbeddedData({embeddedData}: {embeddedData: TEmbeddedData}): {data: TRouteData; title: string} {
    const data = embeddedData as unknown as TRouteData & {title: string}
    return {data, title: data.title}
  }

  return {
    path,
    // TODO: consider wrapping Component with a component that passes payload as a prop — ideally as part of migrating
    // away from useRoutePayload.
    Component,
    coreLoader,
    loadFromEmbeddedData,
    transitionType,
    children,
  }
}
