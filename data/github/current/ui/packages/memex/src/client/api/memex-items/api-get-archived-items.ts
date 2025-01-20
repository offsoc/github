import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import {PER_PAGE_PARAM, VISIBLE_FIELDS_PARAM} from '../../platform/url'
import type {GetArchivedMemexItemsRequest, GetArchivedMemexItemsResponse} from './contracts'

export async function apiGetArchivedItems(
  request: GetArchivedMemexItemsRequest,
): Promise<GetArchivedMemexItemsResponse> {
  const apiData = getApiMetadata('memex-archived-items-get-api-data')
  const url = new URL(apiData.url, window.location.origin)
  if (request.perPage !== undefined) {
    url.searchParams.set(PER_PAGE_PARAM, request.perPage.toString())
  }
  if (request.visibleFields) {
    url.searchParams.set(VISIBLE_FIELDS_PARAM, JSON.stringify(request.visibleFields))
  }
  const {data} = await fetchJSON<GetArchivedMemexItemsResponse>(url)

  return data
}
