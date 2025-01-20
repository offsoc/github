import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {GetMemexChartResponse, UpdateMemexChartRequest} from './contracts/api'

export async function apiUpdateChart(body: UpdateMemexChartRequest): Promise<GetMemexChartResponse> {
  const apiMetadata = getApiMetadata('memex-chart-update-api-data')
  const {data} = await fetchJSONWith<GetMemexChartResponse>(apiMetadata.url, {
    method: 'PUT',
    body,
  })

  return data
}
