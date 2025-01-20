import type {ProjectMigration, RedirectResponse} from '../../client/api/project-migration/contracts'
import {createRequestHandler, type GetRequestType, type MswResponseResolver} from '.'

export const post_retryMigration = (responseResolver: MswResponseResolver<GetRequestType, RedirectResponse>) => {
  return createRequestHandler('post', 'memex-migration-retry-api-data', responseResolver, {ignoreJsonBody: true})
}

export const delete_cancelMigration = (responseResolver: MswResponseResolver<GetRequestType, RedirectResponse>) => {
  return createRequestHandler('delete', 'memex-migration-cancel-api-data', responseResolver, {ignoreJsonBody: true})
}

export const post_acknowledgeMigrationCompletion = (
  responseResolver: MswResponseResolver<GetRequestType, ProjectMigration>,
) => {
  return createRequestHandler('post', 'memex-migration-acknowledge-completion-api-data', responseResolver, {
    ignoreJsonBody: true,
  })
}

export const get_getProjectMigration = (responseResolver: MswResponseResolver<GetRequestType, ProjectMigration>) => {
  return createRequestHandler('get', 'memex-migration-get-api-data', responseResolver)
}
