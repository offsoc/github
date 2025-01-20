import {getInsightsUrl, reportTraceData} from '@github-ui/internal-api-insights'
import {type JSONRequestInit, verifiedFetch, verifiedFetchJSON} from '@github-ui/verified-fetch'

import {Resources} from '../strings'
import {ApiError} from './api-error'
import {ContentType} from './content-type'
import {formEncodeObject} from './utils'

export type ErrorResponse = {code: 401; message: string} | {code: 404; message: string}

/**
 * Returns the string error message from a JSON response, returns a generic error message
 * if nothing is found in the response.
 */
function getErrorMessageFromResponse(jsonResponse: unknown, defaultMessage = Resources.genericErrorMessage): string {
  if (typeof jsonResponse === 'object' && jsonResponse !== null) {
    // Case 1: The response is a JSON object with an "error" property.
    if ('error' in jsonResponse && typeof jsonResponse.error === 'string') {
      return jsonResponse.error
    }
    // Case 2: The response is a JSON object with an "errors" property.
    else if ('errors' in jsonResponse && typeof jsonResponse.errors === 'string') {
      return jsonResponse.errors
    }
    // Case 3: The response is a JSON object with a "message" property.
    else if ('message' in jsonResponse && typeof jsonResponse.message === 'string') {
      return jsonResponse.message
    }
    // Case 4: The response is a JSON object with an "errors" property that is an array of strings.
    else if (
      'errors' in jsonResponse &&
      Array.isArray(jsonResponse.errors) &&
      jsonResponse.errors.length > 0 &&
      typeof jsonResponse.errors[0] === 'string'
    ) {
      return jsonResponse.errors[0]
    }
  }
  return defaultMessage
}

type HttpMethod = 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE'

export class ErrorUsedToCatchStackTraceBeforeAsyncAction extends Error {
  constructor(...args: Parameters<ErrorConstructor>) {
    super(...args)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'ErrorUsedToCatchStackTraceBeforeAsyncAction'
  }
}

export type RequestInitOverride = Omit<RequestInit, 'method' | 'body'>
/**
 * This method will call the server with the options provided and return
 * a promise with the response. Uses the fetch API.
 * @param url absolute url to make the request to
 * @param method HTTP method to use in the request
 * @param body a JSON object representing data to be included in the request body.
 * Will be form-encoded prior to being sent to the server.
 * @param token a CSRF token to use in the call. Required for all non-GET requests.
 */
export async function fetchJSON<TResponse>(
  url: string | URL,
  init?: RequestInitOverride & {
    method?: 'GET'
  },
): Promise<{
  headers: Headers
  ok: boolean
  data: TResponse
}>
/**
 * This version doesn't require a body option when the value would be undefined
 */
export async function fetchJSON<TResponse>(
  url: string | URL,
  init: RequestInitOverride & {
    method: 'PATCH' | 'POST' | 'PUT' | 'DELETE'
    body?: undefined
    token?: string
    contentType?: ContentType
  },
): Promise<{
  headers: Headers
  ok: boolean
  data: TResponse
}>
export async function fetchJSON<TBody, TResponse>(
  url: string | URL,
  init: RequestInitOverride & {
    method: 'PATCH' | 'POST' | 'PUT' | 'DELETE'
    body: TBody
    token?: string
    contentType?: ContentType
  },
): Promise<{
  headers: Headers
  ok: boolean
  data: TResponse
}>
export async function fetchJSON<TBody, TResponse>(
  url: string | URL,
  {
    token,
    contentType = ContentType.JSON,
    ...init
  }: RequestInitOverride & {
    method?: HttpMethod
    body?: TBody | undefined
    token?: string | undefined
    /**
     * JSON should be the default for new request bodies.
     * Legacy bodies may use form-encoded params as necessary,
     * but that should only be for scenarios where it's not
     * possible to use a JSON body.
     */
    contentType?: ContentType
  } = {},
): Promise<{
  headers: Headers
  ok: boolean
  data: TResponse
}> {
  url = getInsightsUrl(url.toString())
  const request = csrfRequestWithToken(url, token, buildRequestInit(init, contentType))
  request.headers.set('Accept', 'application/json')

  if (init.body) {
    request.headers.set('Content-Type', contentType)
  }
  request.headers.set('X-Requested-With', 'XMLHttpRequest')
  /**
   * immediately before the first 'await' we grab a stack trace
   * so we can include it in the errors when/if the request
   * fails
   */
  const errorForStack = new Error()

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  let jsonResponse: any | undefined = undefined
  let ok = false
  let status = 0
  let headers = new Headers()

  try {
    const response = await fetch(request)

    ok = response.ok
    status = response.status
    headers = response.headers

    const textResponse = await response.text()

    jsonResponse = textResponse && JSON.parse(textResponse)
  } catch (e) {
    if (e instanceof Error) {
      throw new ApiError(e.message, {name: e.name, status, sourceStack: errorForStack.stack})
    }

    throw new ApiError(Resources.genericErrorMessage, {status, sourceStack: errorForStack.stack})
  }

  if (ok && jsonResponse) {
    reportTraceData(jsonResponse)

    return {
      headers,
      ok,
      data: jsonResponse as TResponse,
    }
  } else if (ok) {
    return {
      headers,
      ok,
      data: {} as TResponse,
    }
  } else if (status === 401) {
    // Received 401 Unauthorized response indicating the user's does not have a valid
    // session. Reloading the page at the current URL will prompt them to login and will
    // be redirected back after successfully logging in.
    window.location.reload()

    return {
      headers,
      ok,
      data: {} as TResponse,
    }
  } else if (jsonResponse) {
    const message =
      (Array.isArray(jsonResponse.errors) ? jsonResponse.errors[0] : jsonResponse.errors) ??
      Resources.genericErrorMessage
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new ApiError(message, {
      status,
      code: jsonResponse.code,
      sourceStack: errorForStack.stack,
    })
  } else {
    throw new ApiError(Resources.genericErrorMessage, {status, sourceStack: errorForStack.stack})
  }
}

/**
 * Represents a successful or error response from the API.
 * - If the response is successful, `ok` will be `true` and the `data` property will contain the response data.
 * - If the response is an error, `ok` will be `false` and the `error` property will contain the error code and message.
 */
export type ApiResult<TResponse> = Promise<
  | {
      headers: Headers
      ok: true
      data: TResponse
    }
  | {
      headers: Headers
      ok: false
      error: ErrorResponse
    }
>

/**
 * This method acts the same as fetchJSON, but it will not throw an error for expected errors, like 404. Instead,
 * it will return this as part of the return data and the caller can decide how to handle it. Unexpected errors
 * will still be thrown.
 */
export async function fetchJSONWithErrors<TResponse>(
  url: string | URL,
  init?: RequestInitOverride & {
    method?: 'GET'
  },
): ApiResult<TResponse>
/**
 * This version doesn't require a body option when the value would be undefined
 */
export async function fetchJSONWithErrors<TResponse>(
  url: string | URL,
  init: RequestInitOverride & {
    method: 'PATCH' | 'POST' | 'PUT' | 'DELETE'
    body?: undefined
    token?: string
    contentType?: ContentType
  },
): ApiResult<TResponse>
export async function fetchJSONWithErrors<TBody, TResponse>(
  url: string | URL,
  init: RequestInitOverride & {
    method: 'PATCH' | 'POST' | 'PUT' | 'DELETE'
    body: TBody
    token?: string
    contentType?: ContentType
  },
): ApiResult<TResponse>
export async function fetchJSONWithErrors<TBody, TResponse>(
  url: string | URL,
  {
    token,
    contentType = ContentType.JSON,
    ...init
  }: RequestInitOverride & {
    method?: HttpMethod
    body?: TBody | undefined
    token?: string | undefined
    /**
     * JSON should be the default for new request bodies.
     * Legacy bodies may use form-encoded params as necessary,
     * but that should only be for scenarios where it's not
     * possible to use a JSON body.
     */
    contentType?: ContentType
  } = {},
): ApiResult<TResponse> {
  const request = csrfRequestWithToken(getInsightsUrl(url.toString()), token, buildRequestInit(init, contentType))
  request.headers.set('Accept', 'application/json')

  if (init.body) {
    request.headers.set('Content-Type', contentType)
  }
  request.headers.set('X-Requested-With', 'XMLHttpRequest')
  /**
   * immediately before the first 'await' we grab a stack trace
   * so we can include it in the errors when/if the request
   * fails
   */
  const errorForStack = new Error()

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  let jsonResponse: any | undefined = undefined
  let ok = false
  let status = 0
  let headers = new Headers()

  try {
    const response = await fetch(request)

    ok = response.ok
    status = response.status
    headers = response.headers

    const textResponse = await response.text()

    jsonResponse = textResponse && JSON.parse(textResponse)
  } catch (e) {
    if (e instanceof Error) {
      throw new ApiError(e.message, {name: e.name, status, sourceStack: errorForStack.stack})
    }

    throw new ApiError(Resources.genericErrorMessage, {status, sourceStack: errorForStack.stack})
  }

  if (ok && jsonResponse) {
    reportTraceData(jsonResponse)
    return {
      headers,
      ok,
      data: jsonResponse as TResponse,
    }
  } else if (ok) {
    return {
      headers,
      ok,
      data: {} as TResponse,
    }
  } else if (status === 401) {
    // Received 401 Unauthorized response indicating the user's does not have a valid
    // session. Reloading the page at the current URL will prompt them to login and will
    // be redirected back after successfully logging in.
    window.location.reload()

    const message = getErrorMessageFromResponse(jsonResponse, 'Unauthorized')
    return {
      headers,
      ok,
      error: {code: 401, message},
    }
  } else if (status === 404) {
    // eslint-disable-next-line i18n-text/no-en
    const message = getErrorMessageFromResponse(jsonResponse, 'Not Found')
    return {
      headers,
      ok,
      error: {code: 404, message},
    }
  }

  // By this point, we would have returned if the response was ok, so we know that we are now handling an error.
  if (jsonResponse) {
    const message = getErrorMessageFromResponse(jsonResponse)
    throw new ApiError(message, {
      status,
      code: jsonResponse.code,
      sourceStack: errorForStack.stack,
    })
  }

  throw new ApiError(Resources.genericErrorMessage, {status, sourceStack: errorForStack.stack})
}

export async function fetchJSONWith<TResponse>(
  path: string,
  init?: JSONRequestInit & {
    /**
     * JSON should be the default for new request bodies.
     * Legacy bodies may use form-encoded params as necessary,
     * but that should only be for scenarios where it's not
     * possible to use a JSON body.
     */
    contentType?: typeof ContentType.JSON | typeof ContentType.FormData
  },
): Promise<{
  headers: Headers
  ok: boolean
  data: TResponse
}> {
  /**
   * immediately before the first 'await' we grab a stack trace
   * so we can include it in the errors when/if the request
   * fails
   */
  const errorForStack = new Error()

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  let jsonResponse: any | undefined = undefined
  let ok = false
  let status = 0
  let headers = new Headers()
  let contentType = 'unknown'
  const requestContentType = init?.contentType ?? ContentType.JSON

  try {
    const response =
      requestContentType === ContentType.FormData
        ? await verifiedFetchFormData(getInsightsUrl(path), init)
        : await verifiedFetchJSON(getInsightsUrl(path), init)

    ok = response.ok
    status = response.status
    headers = response.headers
    contentType = response.headers.get('content-type') || 'unknown'

    const textResponse = await response.text()
    jsonResponse = textResponse && JSON.parse(textResponse)
  } catch (e) {
    if (e instanceof Error) {
      throw new ApiError(e.message, {
        name: e.name,
        status,
        contentType,
        sourceStack: errorForStack.stack,
      })
    }

    throw new ApiError(Resources.genericErrorMessage, {
      status,
      sourceStack: errorForStack.stack,
    })
  }

  if (ok && jsonResponse) {
    reportTraceData(jsonResponse)
    return {
      headers,
      ok,
      data: jsonResponse as TResponse,
    }
  } else if (ok) {
    return {
      headers,
      ok,
      data: {} as TResponse,
    }
  } else if (status === 401) {
    // Received 401 Unauthorized response indicating the user's does not have a valid
    // session. Reloading the page at the current URL will prompt them to login and will
    // be redirected back after successfully logging in.
    window.location.reload()

    return {
      headers,
      ok,
      data: {} as TResponse,
    }
  } else if (jsonResponse) {
    const message =
      (Array.isArray(jsonResponse.errors) ? jsonResponse.errors[0] : jsonResponse.errors) ??
      Resources.genericErrorMessage
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new ApiError(message, {
      status,
      code: jsonResponse.code,
      sourceStack: errorForStack.stack,
    })
  } else {
    throw new ApiError(Resources.genericErrorMessage, {
      status,
      sourceStack: errorForStack.stack,
    })
  }
}

/**
 * This method will call the server repeatedly with the options provided until a 200 response is returned.
 * Uses the fetch API.
 * @param url absolute url to make the request to
 * @param options options to pass to the fetch API
 * @param timeBetweenRequests time in milliseconds between requests
 */
export async function fetchPoll(
  url: RequestInfo,
  options?: RequestInit,
  timeBetweenRequests = 1000,
): Promise<Response> {
  return (async function poll(wait: number): Promise<Response> {
    const request = new Request(url, options)
    request.headers.append('X-Requested-With', 'XMLHttpRequest')
    const errorForStack = new ErrorUsedToCatchStackTraceBeforeAsyncAction()
    const response = await self.fetch(request)
    const {status} = response
    if (status < 200 || status >= 300) {
      throw new ApiError(Resources.genericErrorMessage, {status, sourceStack: errorForStack.stack})
    }

    if (status === 200) return response
    if (status === 202) {
      await new Promise(resolve => setTimeout(resolve, wait))
      return poll(wait)
    }
    throw new ApiError(Resources.genericErrorMessage, {status, sourceStack: errorForStack.stack})
  })(timeBetweenRequests)
}

/**
 * A wrapper around the native fetch API that will throw when the response is not OK and
 * can attach CSRF tokens. Use for very specific cases when `fetchJSON` will not work.
 */
export async function wrappedFetch(url: RequestInfo, options?: RequestInit, token?: string): Promise<Response> {
  const req = csrfRequestWithToken(url, token, options)

  /**
   * immediately before the first 'await' we grab a stack trace
   * so we can include it in the errors when/if the request
   * fails
   */
  const errorForStack = new ErrorUsedToCatchStackTraceBeforeAsyncAction()
  const response = await fetch(req)
  const {status} = response
  if (response.ok) {
    return response
  } else {
    throw new ApiError(Resources.genericErrorMessage, {status, sourceStack: errorForStack.stack})
  }
}

/**
 * A wrapper around the native fetch API that will throw when the response is not OK and
 * can attach CSRF tokens. Use for very specific cases when `fetchJSON` will not work.
 */
export async function wrappedVerifiedFetch(path: string, init?: RequestInit): Promise<Response> {
  /**
   * immediately before the first 'await' we grab a stack trace
   * so we can include it in the errors when/if the request
   * fails
   */
  const errorForStack = new ErrorUsedToCatchStackTraceBeforeAsyncAction()
  const response = await verifiedFetch(path, init)
  const {status} = response
  if (response.ok) {
    return response
  } else {
    throw new ApiError(Resources.genericErrorMessage, {status, sourceStack: errorForStack.stack})
  }
}

function buildRequestInit<T>({body, ...initOpts}: Omit<RequestInit, 'body'> & {body?: T}, contentType: ContentType) {
  const init: RequestInit = {...initOpts}
  if (body && contentType === ContentType.JSON) {
    init.body = JSON.stringify(body)
  } else if (body) {
    init.body = formEncodeObject(body)
  }
  return init
}

function csrfRequestWithToken(url: RequestInfo, token: string | undefined, options: RequestInit = {}): Request {
  // Enforce same-origin request if we're dealing with CSRF-Token.
  // CSRF tokens should never be send to any other origin.
  const request = new Request(url, {...options, mode: 'same-origin'})
  if (token) {
    request.headers.append('Scoped-CSRF-Token', token)
  }

  return request
}

/**
 * A Fetch function which will automatically add the correct headers for sending
 * encoded form data to the server, and then receiving a JSON response back.
 *
 * Will automatically form encode the request body if provided.
 */
// NOTE: This function should eventually be removed when we can migrate these endpoints to use JSON requests instead.
export function verifiedFetchFormData(path: string, init?: JSONRequestInit): Promise<Response> {
  const initHeaders: HeadersInit = init?.headers ?? {}

  const headers: HeadersInit = {
    ...initHeaders,
    Accept: 'application/json',
    'Content-Type': ContentType.FormData,
  }

  const body = init?.body ? formEncodeObject(init.body) : undefined

  return verifiedFetch(path, {...init, body, headers})
}
