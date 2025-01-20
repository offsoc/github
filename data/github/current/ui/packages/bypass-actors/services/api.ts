import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {BypassActor} from '../bypass-actors-types'

const request = (url: string, method: string, error = 'Unexpected error') => {
  return async (body?: object) => {
    const response = await verifiedFetchJSON(url, {
      body,
      method,
    })
    if (response.ok) {
      try {
        return await response.json()
      } catch (e) {
        throw new Error('Failed to read response')
      }
    } else {
      throw new Error(error)
    }
  }
}

export const getBypassSuggestions = (url: string, query: string): Promise<BypassActor[]> => {
  return request(`${url}?q=${encodeURIComponent(query)}`, 'GET')()
}
