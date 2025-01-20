import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {RedirectResponse} from './contracts'

export async function apiRetryMigration(): Promise<RedirectResponse> {
  const apiMetadata = getApiMetadata('memex-migration-retry-api-data')
  const {data} = await fetchJSONWith<RedirectResponse>(apiMetadata.url, {
    method: 'POST',
  })

  return {redirectUrl: data?.redirectUrl}
}
