import type {
  AddMemexItemRequest,
  AddMemexItemResponse,
  ArchiveMemexItemRequest,
  ArchiveMemexItemResponse,
  BulkAddMemexItemsRequest,
  BulkAddMemexItemsResponse,
  BulkUpdateMemexItemsRequest,
  BulkUpdateMemexItemsResponse,
  ConvertDraftItemToIssueRequest,
  ConvertDraftItemToIssueResponse,
  GetArchivedMemexItemsResponse,
  GetArchiveStatusResponse,
  GetItemsTrackedByParentResponse,
  GetMemexItemResponse,
  GetSuggestedAssigneesResponse,
  GetSuggestedIssueTypesResponse,
  GetSuggestedLabelsResponse,
  GetSuggestedMilestonesResponse,
  IRemoveMemexItemResponse,
  IUpdateMemexItemRequest,
  RemoveMemexItemRequest,
  ResyncElasticsearchIndexResponse,
  UnarchiveMemexItemRequest,
  UnarchiveMemexItemResponse,
  UpdateMemexItemResponse,
} from '../../client/api/memex-items/contracts'
import type {GetPaginatedItemsResponse} from '../../client/api/memex-items/paginated-views'
import {createRequestHandler, type GetRequestType, type MswResponseResolver} from '.'

export const get_getArchivedItems = (
  responseResolver: MswResponseResolver<GetRequestType, GetArchivedMemexItemsResponse>,
) => {
  return createRequestHandler('get', 'memex-archived-items-get-api-data', responseResolver)
}

export const get_getArchiveStatus = (
  responseResolver: MswResponseResolver<GetRequestType, GetArchiveStatusResponse>,
) => {
  return createRequestHandler('get', 'memex-get-archive-status-api-data', responseResolver)
}

export const post_addMemexItem = (responseResolver: MswResponseResolver<AddMemexItemRequest, AddMemexItemResponse>) => {
  return createRequestHandler('post', 'memex-item-create-api-data', responseResolver)
}

export const post_bulkAddMemexItems = (
  responseResolver: MswResponseResolver<BulkAddMemexItemsRequest, BulkAddMemexItemsResponse>,
) => {
  return createRequestHandler('post', 'memex-item-create-bulk-api-data', responseResolver)
}

export const put_bulkUpdateMemexItems = (
  responseResolver: MswResponseResolver<BulkUpdateMemexItemsRequest, BulkUpdateMemexItemsResponse>,
) => {
  return createRequestHandler('put', 'memex-item-update-bulk-api-data', responseResolver)
}

export const get_getMemexItem = (responseResolver: MswResponseResolver<GetRequestType, GetMemexItemResponse>) => {
  return createRequestHandler('get', 'memex-item-get-api-data', responseResolver)
}

export const put_updateMemexItem = (
  responseResolver: MswResponseResolver<IUpdateMemexItemRequest, UpdateMemexItemResponse>,
) => {
  return createRequestHandler('put', 'memex-item-update-api-data', responseResolver)
}

export const delete_destroyMemexItem = (
  responseResolver: MswResponseResolver<RemoveMemexItemRequest, IRemoveMemexItemResponse>,
) => {
  return createRequestHandler('delete', 'memex-item-delete-api-data', responseResolver)
}

export const post_convertDraftItem = (
  responseResolver: MswResponseResolver<ConvertDraftItemToIssueRequest, ConvertDraftItemToIssueResponse>,
) => {
  return createRequestHandler('post', 'memex-item-convert-issue-api-data', responseResolver)
}

export const post_archiveMemexItem = (
  responseResolver: MswResponseResolver<ArchiveMemexItemRequest, ArchiveMemexItemResponse>,
) => {
  return createRequestHandler('post', 'memex-item-archive-api-data', responseResolver)
}

export const put_unarchiveMemexItem = (
  responseResolver: MswResponseResolver<UnarchiveMemexItemRequest, UnarchiveMemexItemResponse>,
) => {
  return createRequestHandler('put', 'memex-item-unarchive-api-data', responseResolver)
}

export const get_getSuggestedAssigneesForMemexItem = (
  responseResolver: MswResponseResolver<GetRequestType, GetSuggestedAssigneesResponse>,
) => {
  return createRequestHandler('get', 'memex-item-suggested-assignees-api-data', responseResolver)
}

export const get_getSuggestedLabelsForMemexItem = (
  responseResolver: MswResponseResolver<GetRequestType, GetSuggestedLabelsResponse>,
) => {
  return createRequestHandler('get', 'memex-item-suggested-labels-api-data', responseResolver)
}

export const get_getSuggestedMilestonesForMemexItem = (
  responseResolver: MswResponseResolver<GetRequestType, GetSuggestedMilestonesResponse>,
) => {
  return createRequestHandler('get', 'memex-item-suggested-milestones-api-data', responseResolver)
}

export const get_getSuggestedIssueTypesForMemexItem = (
  responseResolver: MswResponseResolver<GetRequestType, GetSuggestedIssueTypesResponse>,
) => {
  return createRequestHandler('get', 'memex-item-suggested-issue-types-api-data', responseResolver)
}

export const get_getItemsTrackedByParent = (
  responseResolver: MswResponseResolver<GetRequestType, GetItemsTrackedByParentResponse>,
) => {
  return createRequestHandler('get', 'memex-tracked-by-api-data', responseResolver)
}

export const get_getPaginatedItems = (
  responseResolver: MswResponseResolver<GetRequestType, GetPaginatedItemsResponse>,
) => {
  return createRequestHandler('get', 'memex-paginated-items-get-api-data', responseResolver)
}

export const post_resyncElasticsearchIndex = (
  responseResolver: MswResponseResolver<GetRequestType, ResyncElasticsearchIndexResponse>,
) => {
  return createRequestHandler('post', 'memex-reindex-items-api-data', responseResolver, {ignoreJsonBody: true})
}
