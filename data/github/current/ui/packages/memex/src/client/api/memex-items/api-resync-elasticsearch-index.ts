import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {ResyncElasticsearchIndexResponse} from './contracts'

export async function apiResyncElasticsearchIndex(): Promise<ResyncElasticsearchIndexResponse> {
  const apiData = getApiMetadata('memex-reindex-items-api-data')

  const {data} = await fetchJSONWith<ResyncElasticsearchIndexResponse>(apiData.url, {
    method: 'POST',
  })
  return data
}
