import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {CreateMemexColumnRequest, CreateMemexColumnResponse} from './contracts/api'

export async function apiCreateColumn(body: CreateMemexColumnRequest): Promise<CreateMemexColumnResponse> {
  const apiData = getApiMetadata('memex-column-create-api-data')
  const {data} = await fetchJSONWith<CreateMemexColumnResponse>(apiData.url, {
    method: 'POST',
    body,
  })

  return data
}
