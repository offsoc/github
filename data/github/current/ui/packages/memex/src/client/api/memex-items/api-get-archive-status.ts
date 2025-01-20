import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetArchiveStatusResponse} from './contracts'

export async function apiGetArchiveStatus(): Promise<GetArchiveStatusResponse> {
  const apiData = getApiMetadata('memex-get-archive-status-api-data')
  const url = new URL(apiData.url, window.location.origin)
  const {data} = await fetchJSON<GetArchiveStatusResponse>(url)

  return data
}
