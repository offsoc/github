import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {MemexStatusesResponse} from './contracts'

export async function apiGetMemexStatuses(): Promise<MemexStatusesResponse> {
  const apiData = getApiMetadata('memex-statuses-api-data')

  const {data} = await fetchJSON<MemexStatusesResponse>(apiData.url)
  return data
}
