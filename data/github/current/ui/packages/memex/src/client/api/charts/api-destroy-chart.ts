import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {DeleteMemexChartRequest} from './contracts/api'

export async function apiDestroyChart(body: DeleteMemexChartRequest): Promise<void> {
  const apiMetadata = getApiMetadata('memex-chart-delete-api-data')
  await fetchJSONWith(apiMetadata.url, {
    method: 'DELETE',
    body,
  })
}
