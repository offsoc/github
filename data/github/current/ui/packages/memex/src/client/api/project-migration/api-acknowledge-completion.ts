import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'

export async function apiAcknowledgeMigrationCompletion(): Promise<void> {
  const apiMetadata = getApiMetadata('memex-migration-acknowledge-completion-api-data')
  await fetchJSONWith(apiMetadata.url, {
    method: 'POST',
  })
}
