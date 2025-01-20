import type {
  CountMatchedRepositoryItemsResponse,
  GetSuggestedRepositoriesResponse,
  SearchRepositoriesResponse,
  SearchRepositoryItemsResponse,
} from '../../client/api/repository/contracts'
import {createRequestHandler, type GetRequestType, type MswResponseResolver} from '.'

export const get_getSuggestedRepositories = (
  responseResolver: MswResponseResolver<GetRequestType, GetSuggestedRepositoriesResponse>,
) => {
  return createRequestHandler('get', 'suggested-repositories-api-data', responseResolver)
}

export const get_searchSuggestedRepositories = (
  responseResolver: MswResponseResolver<GetRequestType, SearchRepositoriesResponse>,
) => {
  return createRequestHandler('get', 'search-repositories-api-data', responseResolver)
}

export const get_searchIssuesAndPulls = (
  responseResolver: MswResponseResolver<GetRequestType, SearchRepositoryItemsResponse>,
) => {
  return createRequestHandler('get', 'search-issues-and-pulls-api-data', responseResolver)
}

export const get_countIssuesAndPulls = (
  responseResolver: MswResponseResolver<GetRequestType, CountMatchedRepositoryItemsResponse>,
) => {
  return createRequestHandler('get', 'count-issues-and-pulls-api-data', responseResolver)
}
