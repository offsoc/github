import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {CountMatchedRepositoryItemsRequest, CountMatchedRepositoryItemsResponse} from './contracts'

export async function apiCountMatchedRepositoryItems({
  repositoryId,
  query,
  memexNumber,
}: CountMatchedRepositoryItemsRequest): Promise<CountMatchedRepositoryItemsResponse> {
  const apiData = getApiMetadata('count-issues-and-pulls-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('repositoryId', `${repositoryId}`)
  url.searchParams.set('q', query)
  url.searchParams.set('memexNumber', `${memexNumber}`)
  const {data} = await fetchJSON<CountMatchedRepositoryItemsResponse>(url)

  return data
}
