import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {UpdateMemexColumnRequest, UpdateMemexColumnResponse} from './contracts/api'

export async function apiUpdateColumn(body: UpdateMemexColumnRequest): Promise<UpdateMemexColumnResponse> {
  const apiData = getApiMetadata('memex-column-update-api-data')
  const {data} = await fetchJSONWith<UpdateMemexColumnResponse>(apiData.url, {
    method: 'PUT',
    body,
  })

  return data
}
