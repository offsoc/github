import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {PageViewDeleteRequest} from './contracts'

export async function apiDestroyView(body: PageViewDeleteRequest): Promise<void> {
  const apiData = getApiMetadata('memex-view-delete-api-data')

  await fetchJSONWith<void>(apiData.url, {
    method: 'DELETE',
    body,
  })
}
