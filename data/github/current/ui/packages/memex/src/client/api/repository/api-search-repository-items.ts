import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {SearchRepositoryItemsResponse} from './contracts'

export async function apiSearchRepositoryItems(
  repositoryId: number,
  query: string,
  memexNumber?: number,
  limit?: number,
): Promise<SearchRepositoryItemsResponse> {
  const apiData = getApiMetadata('search-issues-and-pulls-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('repositoryId', `${repositoryId}`)
  url.searchParams.set('q', query)

  if (memexNumber != null) {
    url.searchParams.set('memexNumber', `${memexNumber}`)
  }

  if (limit != null) {
    url.searchParams.set('limit', `${limit}`)
  }

  const {data} = await fetchJSON<SearchRepositoryItemsResponse>(url)

  return data
}
