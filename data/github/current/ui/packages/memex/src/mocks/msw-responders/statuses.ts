import type {MemexCreateStatusBody} from '../../client/api/memex/api-create-status'
import type {MemexUpdateStatusBody} from '../../client/api/memex/api-update-status'
import type {MemexStatusesResponse, MemexStatusResponse} from '../../client/api/memex/contracts'
import {createRequestHandler, type GetRequestType, type MswResponseResolver} from '.'

export const get_getStatuses = (responseResolver: MswResponseResolver<GetRequestType, MemexStatusesResponse>) => {
  return createRequestHandler('get', 'memex-statuses-api-data', responseResolver)
}

export const post_createStatus = (
  responseResolver: MswResponseResolver<MemexCreateStatusBody, MemexStatusResponse>,
) => {
  return createRequestHandler('post', 'memex-status-create-api-data', responseResolver)
}

export const put_updateStatus = (responseResolver: MswResponseResolver<MemexUpdateStatusBody, MemexStatusResponse>) => {
  return createRequestHandler('put', 'memex-status-update-api-data', responseResolver)
}

export const delete_destroyStatus = (responseResolver: MswResponseResolver<undefined, undefined>) => {
  return createRequestHandler('delete', 'memex-status-destroy-api-data', responseResolver, {
    ignoreJsonBody: true,
    extraUrlParts: '/*',
  })
}
