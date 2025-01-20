import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {RedirectResponse} from './contracts'

export async function apiCancelMigration(): Promise<RedirectResponse> {
  const apiMetadata = getApiMetadata('memex-migration-cancel-api-data')
  const {data} = await fetchJSONWith<RedirectResponse>(apiMetadata.url, {
    method: 'DELETE',
  })

  return data
}
