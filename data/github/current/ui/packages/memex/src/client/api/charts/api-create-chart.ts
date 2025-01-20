import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {CreateMemexChartRequest, GetMemexChartResponse} from './contracts/api'

export async function apiCreateChart(body: CreateMemexChartRequest): Promise<GetMemexChartResponse> {
  const apiMetadata = getApiMetadata('memex-chart-create-api-data')
  const {data} = await fetchJSONWith<GetMemexChartResponse>(apiMetadata.url, {
    method: 'POST',
    body,
  })

  return data
}
