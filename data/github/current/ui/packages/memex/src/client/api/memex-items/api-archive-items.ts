import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {ArchiveMemexItemRequest, ArchiveMemexItemResponse} from './contracts'

export async function apiArchiveItems(body: ArchiveMemexItemRequest): Promise<ArchiveMemexItemResponse> {
  const apiData = getApiMetadata('memex-item-archive-api-data')

  const {data} = await fetchJSONWith<ArchiveMemexItemResponse>(apiData.url, {
    method: 'POST',
    body,
  })
  return data
}
