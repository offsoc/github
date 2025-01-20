import type {
  CreateColumnOptionRequest,
  CreateColumnOptionResponse,
  CreateMemexColumnRequest,
  CreateMemexColumnResponse,
  DestroyColumnOptionRequest,
  DestroyColumnOptionResponse,
  DestroyMemexColumnRequest,
  GetMemexColumnsResponse,
  IDestroyMemexColumnResponse,
  UpdateColumnOptionRequest,
  UpdateColumnOptionResponse,
  UpdateMemexColumnRequest,
  UpdateMemexColumnResponse,
} from '../../client/api/columns/contracts/api'
import {createRequestHandler, type GetRequestType, type MswResponseResolver} from '.'

export const post_createMemexColumn = (
  responseResolver: MswResponseResolver<CreateMemexColumnRequest, CreateMemexColumnResponse>,
) => {
  return createRequestHandler('post', 'memex-column-create-api-data', responseResolver)
}

export const put_updateMemexColumn = (
  responseResolver: MswResponseResolver<UpdateMemexColumnRequest, UpdateMemexColumnResponse>,
) => {
  return createRequestHandler('put', 'memex-column-update-api-data', responseResolver)
}

export const delete_destroyMemexColumn = (
  responseResolver: MswResponseResolver<DestroyMemexColumnRequest, IDestroyMemexColumnResponse>,
) => {
  return createRequestHandler('delete', 'memex-column-delete-api-data', responseResolver)
}

export const get_getMemexColumns = (responseResolver: MswResponseResolver<GetRequestType, GetMemexColumnsResponse>) => {
  return createRequestHandler('get', 'memex-columns-get-api-data', responseResolver)
}

export const post_createMemexColumnOption = (
  responseResolver: MswResponseResolver<CreateColumnOptionRequest, CreateColumnOptionResponse>,
) => {
  return createRequestHandler('post', 'memex-column-option-create-api-data', responseResolver)
}

export const put_updateMemexColumnOption = (
  responseResolver: MswResponseResolver<UpdateColumnOptionRequest, UpdateColumnOptionResponse>,
) => {
  return createRequestHandler('put', 'memex-column-option-update-api-data', responseResolver)
}

export const delete_destroyMemexColumnOption = (
  responseResolver: MswResponseResolver<DestroyColumnOptionRequest, DestroyColumnOptionResponse>,
) => {
  return createRequestHandler('delete', 'memex-column-option-delete-api-data', responseResolver)
}
