import {ssrSafeDocument} from './ssr-globals'

/***
 * Are we rendering on the server?
 */
export const IS_SERVER = typeof ssrSafeDocument === 'undefined'

/***
 * Are we rendering on the client?
 */
export const IS_BROWSER = !IS_SERVER

/***
 * This helper returns `true` if:
 * - we are rendering on the server
 * - we are on the client, and the app has been hydrated from a server-render
 */
export function wasServerRendered() {
  if (IS_SERVER) {
    return true
  }

  return Boolean(ssrSafeDocument!.querySelector('react-app[data-ssr="true"]'))
}
