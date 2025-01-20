import {useEffect, useRef} from 'react'
import type {PageError} from './app-routing-types'
import {setTitle} from '@github-ui/document-metadata'
import type {Location} from 'react-router-dom'
import type {RouteState} from './route-state'

export const isHashNav = (current: Location | null, target: Location | null) => {
  if (current === null || target === null) return false
  return current.pathname === target.pathname && current.search === target.search && Boolean(target.hash)
}

export function useTitleManager(currentRouteState: RouteState | null, error: PageError | null, location: Location) {
  const previousLocation = useRef<Location | null>(null)

  useEffect(() => {
    if (!previousLocation.current) {
      previousLocation.current = location
    }

    if (!isHashNav(previousLocation.current, location) && (error || currentRouteState)) {
      if (error) {
        const errorTitle = getTitleForError(error)
        setTitle(errorTitle)
      } else if (currentRouteState?.type === 'loaded') {
        // Some of our React applications manage their own title,
        // so we only set the title if it's present in the payload
        currentRouteState.title && setTitle(addGitHubToTitle(currentRouteState.title))
      }
    }

    if (previousLocation.current?.key !== location.key) {
      previousLocation.current = location
    }
  }, [error, currentRouteState, location])
}

const getTitleForError = (error: PageError) => {
  const innerTitle =
    error.httpStatus === 404
      ? '404 Page not found'
      : error.httpStatus === 500
        ? '500 Internal server error'
        : error.httpStatus
          ? `Error ${error.httpStatus}`
          : 'Error'
  return addGitHubToTitle(innerTitle)
}

function addGitHubToTitle(title: string) {
  // This matches Rails-generated HTML where " · GitHub" is only added to the title for logged out users
  // Here's the original PR that added that behavior: https://github.com/github/github/pull/2899
  if (document.body.classList.contains('logged-out')) return `${title} · GitHub`
  return title
}
