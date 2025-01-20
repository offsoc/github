import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {PostStatsRequest, PostStatsResponse} from './contracts'

export async function apiPostStats(body: PostStatsRequest): Promise<PostStatsResponse> {
  const apiData = getApiMetadata('stats-post-api-data')

  const {data} = await fetchJSONWith<PostStatsResponse>(apiData.url, {
    method: 'POST',
    body,
  })

  return data
}
