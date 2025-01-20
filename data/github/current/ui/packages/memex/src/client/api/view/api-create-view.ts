import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {PageViewCreateRequest, PageViewCreateResponse} from './contracts'

export async function apiCreateView(body: PageViewCreateRequest): Promise<PageViewCreateResponse> {
  const apiData = getApiMetadata('memex-view-create-api-data')

  const {data} = await fetchJSONWith<PageViewCreateResponse>(apiData.url, {
    method: 'POST',
    body,
  })

  return data
}
