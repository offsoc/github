import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetItemsTrackedByParentResponse, IGetItemsTrackedByParentRequest} from './contracts'

export async function apiGetItemsTrackedByParent({
  issueId,
}: IGetItemsTrackedByParentRequest): Promise<GetItemsTrackedByParentResponse> {
  const apiData = getApiMetadata('memex-tracked-by-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('issueId', `${issueId}`)
  const {data} = await fetchJSON<GetItemsTrackedByParentResponse>(url)

  return data
}
