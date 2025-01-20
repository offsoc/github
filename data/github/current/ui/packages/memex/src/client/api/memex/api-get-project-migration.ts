import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {ProjectMigration} from '../project-migration/contracts'

export async function apiGetProjectMigration(): Promise<ProjectMigration> {
  const apiData = getApiMetadata('memex-migration-get-api-data')
  const {data} = await fetchJSON<ProjectMigration>(apiData.url)
  return data
}
