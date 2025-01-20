import {ApiError} from './api-error'
import {verifiedFetch} from '@github-ui/verified-fetch'

interface FetchOptions extends RequestInit {
  defaultErrorMessage?: string
}

export async function fetch(
  url: string,
  {defaultErrorMessage = 'Sorry, something went wrong', ...fetchOptions}: FetchOptions = {},
): Promise<void> {
  let response: Response

  try {
    response = await verifiedFetch(url, fetchOptions)
  } catch (e: unknown) {
    throw new Error(defaultErrorMessage)
  }

  if (response.ok) {
    return
  }

  throw new ApiError(defaultErrorMessage, response)
}
