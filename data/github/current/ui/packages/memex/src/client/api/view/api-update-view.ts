import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {PageViewUpdateRequest, PageViewUpdateResponse} from './contracts'

export async function apiUpdateView(body: PageViewUpdateRequest): Promise<PageViewUpdateResponse> {
  const apiData = getApiMetadata('memex-view-update-api-data')

  const {data} = await fetchJSONWith<PageViewUpdateResponse>(apiData.url, {
    method: 'PUT',
    body,
  })

  return data
}
