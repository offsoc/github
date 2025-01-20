import type {CollaboratorRole} from '../../client/api/common-contracts'
import type {
  ApplyTemplateRequest,
  ApplyTemplateResponse,
  DeleteMemexResponse,
  FilterSuggestionsResponse,
  GetAllMemexDataResponse,
  GetCollaboratorsResponse,
  GetCustomTemplatesResponse,
  GetOrganizationAccessResponse,
  GetSuggestedCollaboratorsResponse,
  IRemoveCollaboratorsRequest,
  IUpdateMemexRequest,
  RemoveCollaboratorsResponse,
  UpdateCollaboratorsResponse,
  UpdateMemexResponse,
} from '../../client/api/memex/contracts'
import {createRequestHandler, type GetRequestType, type MswResponseResolver} from '.'

export const get_refreshMemex = (responseResolver: MswResponseResolver<GetRequestType, GetAllMemexDataResponse>) => {
  return createRequestHandler('get', 'memex-refresh-api-data', responseResolver)
}

export const put_updateMemex = (responseResolver: MswResponseResolver<IUpdateMemexRequest, UpdateMemexResponse>) => {
  return createRequestHandler('put', 'memex-update-api-data', responseResolver)
}

export const delete_destroyMemex = (responseResolver: MswResponseResolver<GetRequestType, DeleteMemexResponse>) => {
  return createRequestHandler('delete', 'memex-delete-api-data', responseResolver, {ignoreJsonBody: true})
}

export const get_getMemexCollaborators = (
  responseResolver: MswResponseResolver<GetRequestType, GetCollaboratorsResponse>,
) => {
  return createRequestHandler('get', 'memex-collaborators-api-data', responseResolver)
}

export const get_getSuggestedMemexCollaborators = (
  responseResolver: MswResponseResolver<GetRequestType, GetSuggestedCollaboratorsResponse>,
) => {
  return createRequestHandler('get', 'memex-suggested-collaborators-api-data', responseResolver)
}

export const post_updateMemexCollaborators = (
  responseResolver: MswResponseResolver<
    {
      permission: CollaboratorRole
      collaborators: Array<string>
    },
    UpdateCollaboratorsResponse
  >,
) => {
  return createRequestHandler('post', 'memex-add-collaborators-api-data', responseResolver)
}

export const delete_removeMemexCollaborators = (
  responseResolver: MswResponseResolver<IRemoveCollaboratorsRequest, RemoveCollaboratorsResponse>,
) => {
  return createRequestHandler('delete', 'memex-remove-collaborators-api-data', responseResolver)
}

export const get_getOrganizationAccess = (
  responseResolver: MswResponseResolver<GetRequestType, GetOrganizationAccessResponse>,
) => {
  return createRequestHandler('get', 'memex-get-organization-access-api-data', responseResolver)
}

export const put_updateOrganizationAccess = (
  responseResolver: MswResponseResolver<{permission: CollaboratorRole}, void>,
) => {
  return createRequestHandler('put', 'memex-update-organization-access-api-data', responseResolver)
}

export const post_applyTemplate = (
  responseResolver: MswResponseResolver<ApplyTemplateRequest, ApplyTemplateResponse>,
) => {
  return createRequestHandler('post', 'memex-template-api-data', responseResolver)
}

export const get_customTemplates = (
  responseResolver: MswResponseResolver<GetRequestType, GetCustomTemplatesResponse>,
) => {
  return createRequestHandler('get', 'memex-custom-templates-api-data', responseResolver)
}

export const get_getFilterSuggestions = (
  responseResolver: MswResponseResolver<GetRequestType, FilterSuggestionsResponse>,
) => {
  return createRequestHandler('get', 'memex-filter-suggestions-api-data', responseResolver)
}
