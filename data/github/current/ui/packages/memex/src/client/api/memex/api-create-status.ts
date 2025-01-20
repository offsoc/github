import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {MemexStatus, MemexStatusResponse} from './contracts'

export type MemexCreateStatusBody = {
  body: string
  startDate: string | null
  targetDate: string | null
  statusId: string | null
}

export async function apiCreateMemexStatus(body: MemexCreateStatusBody): Promise<MemexStatusResponse> {
  const apiData = getApiMetadata('memex-status-create-api-data')
  const {data} = await fetchJSONWith<MemexStatusResponse>(apiData.url, {method: 'POST', body})
  return data
}

export async function apiDestroyMemexStatus(id: number): Promise<undefined> {
  const apiData = getApiMetadata('memex-status-destroy-api-data')
  await fetchJSONWith<MemexStatus>(`${apiData.url}/${id}`, {method: 'DELETE'})
}
