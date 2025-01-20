import type {PathFunction, PathParams, Query} from './types'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

/**
 * Given a path function, a set of parameters for that function, and a query, returns a URL.
 */
export function getUrl<T extends PathParams | void>(path: PathFunction<T>, args: T, query?: Query): URL {
  const pathname = path(args)
  const target = new URL(pathname, ssrSafeLocation.origin || 'https://github.com')

  if (pathname === ssrSafeLocation.pathname) {
    target.search = new URLSearchParams(ssrSafeLocation.search).toString()
  }

  for (const [key, value] of Object.entries(query || {})) {
    if (value === null || value === undefined) {
      target.searchParams.delete(key)
    } else {
      target.searchParams.set(key, value.toString())
    }
  }

  return target
}

/**
 * Get an href for use in links. This will be a relative URL, and will work properly in SSR.
 */
export function getRelativeHref<T extends PathParams>(path: PathFunction<T>, args: T, query?: Query): string {
  const url = getUrl(path, args, query)
  return url.href.replace(url.origin, '') // strip origin, but keep the rest to make it relative
}

/**
 * Encodes special characters in a URL part, except `/`
 */
export function encodePart(part: string): string {
  return part.split('/').map(encodeURIComponent).join('/')
}
