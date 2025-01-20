import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {DestroyMemexColumnRequest, IDestroyMemexColumnResponse} from './contracts/api'

export async function apiDestroyColumn(body: DestroyMemexColumnRequest): Promise<IDestroyMemexColumnResponse> {
  const apiData = getApiMetadata('memex-column-delete-api-data')
  await fetchJSONWith<IDestroyMemexColumnResponse>(apiData.url, {
    method: 'DELETE',
    body,
  })
}
