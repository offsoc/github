import {PROJECT_ROUTE} from '../routes'

/**
 * Returns a key to use for session storage based on the current projects
 * ownerType, ownerIdentifier, and projectIdentifier.
 * @param key string
 * @returns string
 */

export function getStorageKey(key: string): string {
  /**
   * This is always truthy in production, since we only render the app
   * at one of these paths, however some tests aren't written to
   * run at a given path, so we allow for potentially nullish values
   */
  const match = PROJECT_ROUTE.matchFullPathOrChildPaths(window.location.pathname)
  return [
    'projects-v2',
    'session-store-v1',
    match?.params.ownerType,
    match?.params.ownerIdentifier,
    match?.params.projectNumber,
    key,
  ].join('/')
}
