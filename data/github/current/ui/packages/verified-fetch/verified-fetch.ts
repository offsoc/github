/**
 * A Fetch function which will automatically add the correct headers for
 * making requests to GitHub application servers as long as the associated controller methods allow it.
 * Track down the associated controller method and confirm the controller includes
 * ApplicationController::VerifiedFetchDependency as well as `allow_verified_fetch only:`
 * to the relevant controller methods.
 *
 * ## Example
 *
 *     const onClick = async () => {
 *       const resp = await verifiedFetch('/foo', {method: 'POST'})
 *       if (resp.ok) console.log('The response was', await resp.text())
test.
 *     }
 */
export function verifiedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  assertRelativePathOrSameOrigin(path)

  const headers: HeadersInit = {
    ...init.headers,
    'GitHub-Verified-Fetch': 'true',
    'X-Requested-With': 'XMLHttpRequest',
  }

  return fetch(path, {...init, headers})
}

export interface JSONRequestInit extends Omit<RequestInit, 'body'> {
  body?: unknown
}

function assertRelativePathOrSameOrigin(path: string) {
  if (process.env.NODE_ENV === 'test' && !window.location.origin) return
  const url = new URL(path, window.location.origin)
  if (url.origin !== window.location.origin) {
    throw new Error('Can not make cross-origin requests from verifiedFetch')
  }
}

/**
 * A Fetch function which will automatically add the correct headers for
 * making JSON requests
 *
 * Will also `JSON.stringify` the request body if provided.

 * ## Example
 *
 *     const onClick = async () => {
 *       const resp = await verifiedFetchJSON('/foo', {body: {foo: 'bar'}, method: 'POST'})
 *       if (resp.ok) console.log('The response was', await resp.json())
 *     }
 */
export function verifiedFetchJSON(path: string, init?: JSONRequestInit): Promise<Response> {
  const initHeaders: HeadersInit = init?.headers ?? {}

  const headers: HeadersInit = {
    ...initHeaders,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  const body = init?.body ? JSON.stringify(init.body) : undefined

  return verifiedFetch(path, {...init, body, headers})
}

/**
 * A Fetch function which will automatically add the GitHub-Is-React header for
 * making JSON requests. It will in turn call verifiedFetchJSON.
 *
 * Using this in React components to fetch data enables us to track these
 * requests in Datadog in the request.dist.referrer metric.
 */
export function reactFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers: HeadersInit = {
    ...init.headers,
    'GitHub-Is-React': 'true',
  }

  return verifiedFetch(path, {...init, headers})
}

/**
 * A Fetch function which will automatically add the GitHub-Is-React header for
 * making JSON requests. It will in turn call verifiedFetchJSON.
 *
 * Using this in React components to fetch data enables us to track these
 * requests in Datadog in the request.dist.referrer metric.
 */
export function reactFetchJSON(path: string, init?: JSONRequestInit): Promise<Response> {
  const initHeaders: HeadersInit = init?.headers ?? {}

  const headers: HeadersInit = {
    ...initHeaders,
    'GitHub-Is-React': 'true',
  }

  return verifiedFetchJSON(path, {...init, headers})
}
