import type {
  CreateMemexChartRequest,
  DeleteMemexChartRequest,
  GetMemexChartResponse,
  UpdateMemexChartRequest,
} from '../../client/api/charts/contracts/api'
import {createRequestHandler, type MswResponseResolver} from '.'

export const post_createChart = (
  responseResolver: MswResponseResolver<CreateMemexChartRequest, GetMemexChartResponse>,
) => {
  return createRequestHandler('post', 'memex-chart-create-api-data', responseResolver)
}

export const put_updateChart = (
  responseResolver: MswResponseResolver<UpdateMemexChartRequest, GetMemexChartResponse>,
) => {
  return createRequestHandler('put', 'memex-chart-update-api-data', responseResolver)
}

export const delete_destroyChart = (responseResolver: MswResponseResolver<DeleteMemexChartRequest, void>) => {
  return createRequestHandler('delete', 'memex-chart-delete-api-data', responseResolver)
}
