import {useCallback} from 'react'
import {useCSRFToken} from '@github-ui/use-csrf-token'

interface TypedResponse<T> extends Response {
  json(): Promise<T>
}

/**
 * The pieces of a RequestInit which we allow to be used.
 * We do not allow a body or method to be passed since those must be specified by other means.
 */
interface MethodlessRequestInit extends RequestInit {
  method?: never
}

/**
 * @deprecated use the `@github-ui/verified-fetch` package instead
 */
export function useVerifiedFetch<R = unknown>(
  path: string,
  method: 'get' | 'post' | 'delete',
): (init?: MethodlessRequestInit) => Promise<TypedResponse<R>> {
  const token = useCSRFToken(path, method)

  return useCallback(
    async (init?: MethodlessRequestInit) => {
      let requestMethod = method

      // TODO: eventually, in this case, we should make an additional API call to get a new token
      if (!token) throw new Error(`No authenticity token found for method ${requestMethod} and path ${path}`)

      if (!init) {
        init = {}
      }

      // This is required for rails endpoints marked with before_action :require_xhr
      addHeader(init, 'X-Requested-With', 'XMLHttpRequest')

      // Rails expects a post request with _method=delete for DELETE requests
      if (init.body instanceof URLSearchParams && requestMethod === 'delete') {
        init.body.append('_method', 'delete')
        requestMethod = 'post'
      }

      if (init.body instanceof URLSearchParams || init.body instanceof FormData) {
        // eslint-disable-next-line github/authenticity-token
        init.body.append('authenticity_token', token)
      } else {
        addHeader(init, 'Scoped-CSRF-Token', token)
      }

      return await fetch(path, {...init, method: requestMethod})
    },
    [path, method, token],
  )
}

function addHeader(init: RequestInit, key: string, value: string) {
  init.headers ??= new Headers()
  const headers = init.headers

  if (headers instanceof Headers) {
    headers.set(key, value)
  } else if (Array.isArray(headers)) {
    const existingIndex = headers.findIndex(([k]) => k === key)
    if (existingIndex === -1) {
      headers.push([key, value])
    } else {
      headers[existingIndex] = [key, value]
    }
  } else {
    headers[key] = value
  }
}
