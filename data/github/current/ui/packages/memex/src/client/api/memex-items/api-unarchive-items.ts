import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {UnarchiveMemexItemRequest, UnarchiveMemexItemResponse} from './contracts'

export async function apiUnarchiveItems(body: UnarchiveMemexItemRequest): Promise<UnarchiveMemexItemResponse> {
  const apiData = getApiMetadata('memex-item-unarchive-api-data')

  const {data} = await fetchJSONWith<UnarchiveMemexItemResponse>(apiData.url, {
    method: 'PUT',
    body,
  })
  return data
}
