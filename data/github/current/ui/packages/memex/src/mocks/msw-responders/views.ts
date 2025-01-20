import type {
  PageViewCreateRequest,
  PageViewCreateResponse,
  PageViewDeleteRequest,
  PageViewUpdateRequest,
  PageViewUpdateResponse,
} from '../../client/api/view/contracts'
import {createRequestHandler, type MswResponseResolver} from '.'

export const post_createView = (
  responseResolver: MswResponseResolver<PageViewCreateRequest, PageViewCreateResponse>,
) => {
  return createRequestHandler('post', 'memex-view-create-api-data', responseResolver)
}

export const put_updateView = (
  responseResolver: MswResponseResolver<PageViewUpdateRequest, PageViewUpdateResponse>,
) => {
  return createRequestHandler('put', 'memex-view-update-api-data', responseResolver)
}

export const delete_destroyView = (responseResolver: MswResponseResolver<PageViewDeleteRequest, void>) => {
  return createRequestHandler('delete', 'memex-view-delete-api-data', responseResolver)
}
