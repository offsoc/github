import {type JSONRequestInit, verifiedFetchJSON} from '@github-ui/verified-fetch'

export const JSON_HEADER = {'Content-Type': 'application/json'}

function responseIsJson(response: Response): boolean {
  return !!response.headers.get('Content-Type')?.includes('application/json')
}

interface FetchOptions extends JSONRequestInit {}

export async function fetchJson<T>(url: string, fetchOptions?: FetchOptions): Promise<T> {
  const response = await verifiedFetchJSON(url, fetchOptions)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  // If the SSO token expires, we will get an HTML response instead of json
  if (!responseIsJson(response)) {
    throw new Error('Response is not JSON')
  }

  return response.json() as Promise<T>
}

export async function tryFetchJson<T>(url: string, fetchOptions?: FetchOptions): Promise<T | null> {
  try {
    return await fetchJson<T>(url, fetchOptions)
  } catch {
    return null
  }
}
