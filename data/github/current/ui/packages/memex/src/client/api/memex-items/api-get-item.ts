import {getApiMetadata} from '../../helpers/api-metadata'
import {type ApiResult, fetchJSONWithErrors} from '../../platform/functional-fetch-wrapper'
import type {GetMemexItemRequest, GetMemexItemResponse} from './contracts'

export async function apiGetItem({memexProjectItemId}: GetMemexItemRequest): ApiResult<GetMemexItemResponse> {
  const apiData = getApiMetadata('memex-item-get-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('memexProjectItemId', `${memexProjectItemId}`)
  return fetchJSONWithErrors<GetMemexItemResponse>(url)
}
