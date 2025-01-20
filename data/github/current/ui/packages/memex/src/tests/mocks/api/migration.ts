import type {ProjectMigration} from '../../../client/api/project-migration/contracts'
import type {GetRequestType} from '../../../mocks/msw-responders'
import {post_acknowledgeMigrationCompletion} from '../../../mocks/msw-responders/migration'
import {stubApiMethod} from './stub-api-method'

export function stubAcknowledgeCompletion(projectMigration: ProjectMigration) {
  return stubApiMethod<GetRequestType, ProjectMigration>(post_acknowledgeMigrationCompletion, projectMigration)
}
