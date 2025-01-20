import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetMemexColumnsRequest, GetMemexColumnsResponse} from './contracts/api'

export async function apiGetColumns(query: GetMemexColumnsRequest): Promise<GetMemexColumnsResponse> {
  const apiData = getApiMetadata('memex-columns-get-api-data')
  const url = new URL(apiData.url, window.location.origin)
  for (const columnId of query.memexProjectColumnIds) {
    url.searchParams.append('columnIds[]', `${columnId}`)
  }
  const {data} = await fetchJSON<GetMemexColumnsResponse>(url)

  return data
}
