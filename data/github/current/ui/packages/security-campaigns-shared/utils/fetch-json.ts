import {type JSONRequestInit, verifiedFetchJSON} from '@github-ui/verified-fetch'
import {ApiError} from './api-error'

function responseIsJson(response: Response): boolean {
  return response.headers?.get('Content-Type')?.includes('application/json') ?? false
}

interface FetchOptions extends JSONRequestInit {
  defaultErrorMessage?: string
}

export async function fetchJson<T>(
  url: string,
  {defaultErrorMessage = 'Sorry, something went wrong', ...fetchOptions}: FetchOptions = {},
): Promise<T> {
  let response: Response

  try {
    response = await verifiedFetchJSON(url, fetchOptions)
  } catch (e: unknown) {
    throw new Error(defaultErrorMessage)
  }

  if (response.ok) {
    // If the SSO token expires, we will get an HTML response instead of json
    if (!responseIsJson(response)) {
      throw new ApiError('Response is not JSON', response)
    }

    try {
      return response.json()
    } catch (e: unknown) {
      throw new ApiError(defaultErrorMessage, response)
    }
  }

  if (responseIsJson(response)) {
    let body: unknown
    try {
      body = await response.json()
    } catch (e: unknown) {
      throw new ApiError(defaultErrorMessage, response)
    }

    const message =
      body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message
        : defaultErrorMessage
    throw new ApiError(message, response)
  }

  throw new ApiError(defaultErrorMessage, response)
}
