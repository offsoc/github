import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {MemexStatusResponse} from './contracts'

export type MemexUpdateStatusBody = {
  id: number
  body: string
  startDate: string | null
  targetDate: string | null
  statusId: string | null
}

export async function apiUpdateMemexStatus(body: MemexUpdateStatusBody): Promise<MemexStatusResponse> {
  const apiData = getApiMetadata('memex-status-update-api-data')
  const {data} = await fetchJSONWith<MemexStatusResponse>(apiData.url, {method: 'PUT', body})
  return data
}
