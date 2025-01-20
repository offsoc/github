import type {QueryClient} from '@tanstack/react-query'

import {apiGetPaginatedItems} from '../../../api/memex-items/api-get-paginated-items'
import type {
  GetPaginatedItemsRequest,
  GetPaginatedItemsResponse,
  GroupedItemBatchRequest,
  GroupedItemBatchResponse,
  PaginatedGroupedItemsRequest,
  PaginatedGroupedItemsResponse,
  PaginatedGroupsAndSecondaryGroupsRequest,
  PaginatedGroupsAndSecondaryGroupsResponse,
  PaginatedGroupsRequest,
  PaginatedGroupsResponse,
  PaginatedItemsRequest,
  PaginatedItemsResponse,
} from '../../../api/memex-items/paginated-views'
import {createMemexItemModel} from '../../../models/memex-item-model'
import type {GroupIdToGroupValueMap} from '../query-client-api/memex-groups'
import {
  buildGroupedItemsQueryData,
  buildGroupsQueryData,
  buildSecondaryGroupsQueryData,
  setSlicesDataFromResponse,
  updateTotalCountsQueryDataFromResponse,
} from './handle-paginated-items-response'
import {
  isPageTypeForGroupedItems,
  type PageType,
  type PageTypeForGroupedItems,
  type PageTypeForGroups,
  pageTypeForGroups,
  type PageTypeForSecondaryGroups,
  type PageTypeForUngroupedItems,
  pageTypeForUngroupedItems,
} from './query-keys'
import type {
  GroupedItemBatchPageParam,
  MemexGroupsPageQueryData,
  MemexItemsPageQueryData,
  PageParam,
  pageParamForNextPlaceholder,
  PaginatedMemexItemsQueryVariables,
} from './types'

export function paginatedViewRequestResolverFactory(
  variables: PaginatedMemexItemsQueryVariables,
  groupValuesMap: GroupIdToGroupValueMap,
  pageType: PageType,
  pageParam: Exclude<PageParam, typeof pageParamForNextPlaceholder>,
) {
  if (pageType === pageTypeForUngroupedItems) {
    return new PaginatedItemsRequestResolver(variables, groupValuesMap, pageType, pageParam)
  } else if (isPageTypeForGroupedItems(pageType)) {
    return new PaginatedGroupedItemsRequestResolver(variables, groupValuesMap, pageType, pageParam)
  } else if (pageType === pageTypeForGroups) {
    // A page type of `groups` means one of the following:
    // 1. We're grouped in two directions and this is the top-level request where we're expecting
    // groups, secondary groups, and grouped items.
    // 2. We're grouped in two directions and this is a request for an addtional page of groups
    // and grouped items, with no `secondaryAfter` defined.
    // 3. We're grouped in one direction and this is the top-level request where we're expecting
    // groups and grouped items.
    // 4. We're grouped in one direction and this is a request for an additional page of groups
    // and grouped items.
    // Scenarios 1 and 2 mean we want to use a PaginatedGroupsAndSecondaryGroupsRequestResolver,
    // and Scenarios 3 and 4 lead to a PaginatedGroupsRequestResolver
    if (variables.horizontalGroupedByColumnId && variables.verticalGroupedByColumnId) {
      return new PaginatedGroupsAndSecondaryGroupsRequestResolver(variables, groupValuesMap, pageType, pageParam)
    } else {
      return new PaginatedGroupsRequestResolver(variables, groupValuesMap, pageType, pageParam)
    }
  } else {
    // A page type of `secondaryGroups` means the following:
    // 1. We're grouped in two directions and this is the a request for an additional page of secondary groups
    // and grouped items, with no `after` defined.
    return new PaginatedGroupsAndSecondaryGroupsRequestResolver(variables, groupValuesMap, pageType, pageParam)
  }
}

/**
 * Handles building a request for a grouped item batch from the current variables,
 * combined with a GroupedItemBatchPageParam containing an after and secondaryAfter
 * parameter. Then, sends this request using apiGetPaginatedItems, and handles a
 * response with groups, secondaryGroups and groupedItems. The groups and secondaryGroups
 * are ignored, because the client is already aware of this data, only the grouped items
 * are new, which are manually updated in the query client.
 *
 * This class is constructed manually, and not through the factory, as its usage
 * is slightly different from the rest of the resolvers - mainly in the fact that it
 * doesn't return any query data.
 */
export class GroupedItemBatchRequestResolver {
  private _variables: PaginatedMemexItemsQueryVariables
  private _pageParam: GroupedItemBatchPageParam
  private _response: GroupedItemBatchResponse

  constructor(variables: PaginatedMemexItemsQueryVariables, pageParam: GroupedItemBatchPageParam) {
    this._variables = variables
    this._pageParam = pageParam
  }

  public async fetchData(signal?: AbortSignal) {
    const request = this.buildRequest()
    const response = await apiGetPaginatedItems(request, signal)
    if (!('groups' in response) || response.secondaryGroups == null || !('groupedItems' in response)) {
      throw new Error('Expected, groups, secondaryGroups, and groupedItems in response')
    }
    this._response = response
    return this._response
  }

  public handleResponse(queryClient: QueryClient) {
    updateTotalCountsQueryDataFromResponse(queryClient, this._variables, this._response)
    buildGroupedItemsQueryData(queryClient, this._variables, this._response)
  }

  private buildRequest() {
    let request: GroupedItemBatchRequest | undefined = undefined

    const {horizontalGroupedByColumnId, verticalGroupedByColumnId, ...requestVariables} = this._variables

    if (horizontalGroupedByColumnId && verticalGroupedByColumnId) {
      request = {...requestVariables, horizontalGroupedByColumnId, verticalGroupedByColumnId, ...this._pageParam}
    }

    if (!request) {
      throw new Error('Could not create grouped item batch request')
    }
    return request
  }
}

abstract class BasePaginatedViewRequestResolver<
  TRequest extends GetPaginatedItemsRequest,
  TResponse extends GetPaginatedItemsResponse,
  TPageType extends PageType,
  TQueryData extends MemexItemsPageQueryData | MemexGroupsPageQueryData,
> {
  protected _variables: PaginatedMemexItemsQueryVariables
  protected _groupValuesMap: GroupIdToGroupValueMap
  protected _pageType: TPageType
  protected _pageParam: Exclude<PageParam, typeof pageParamForNextPlaceholder>

  protected _queryData: TQueryData
  protected _request: TRequest
  protected _response: TResponse

  constructor(
    variables: PaginatedMemexItemsQueryVariables,
    groupValuesMap: GroupIdToGroupValueMap,
    pageType: TPageType,
    pageParam: Exclude<PageParam, typeof pageParamForNextPlaceholder>,
  ) {
    this._variables = variables
    this._groupValuesMap = groupValuesMap
    this._pageType = pageType
    this._pageParam = pageParam
    this._request = this.buildRequest()
  }

  public async fetchData(signal?: AbortSignal) {
    this._response = await this.makeRequest(signal)
    return this._response
  }

  public handleResponse(queryClient: QueryClient) {
    setSlicesDataFromResponse(queryClient, this._variables, this._response)
    updateTotalCountsQueryDataFromResponse(queryClient, this._variables, this._response, this._pageType)

    this._queryData = this.buildQueryData(queryClient)
  }

  public queryData() {
    return this._queryData
  }

  /**
   * Using the variables and page params provided to the constructor, this
   * method implements building a request for a specific scenario (ungrouped items, grouped items, etc.)
   */
  protected abstract buildRequest(): TRequest

  /**
   * Using a request that was built specifically for this scenario, this method calls the appropriate
   * endpoint (`apiGetPaginatedItems`, `apiGetPaginatedGroups`, etc.) and does some basic assertions
   * on the shape of the response.
   */
  protected abstract makeRequest(signal?: AbortSignal): Promise<TResponse>

  /**
   * Using a strongly typed response for a specific scenario, this method returns the data for this query
   * as well as priming the query cache for any ancillary data returned in the response.
   */
  protected abstract buildQueryData(queryClient: QueryClient): TQueryData
}

/**
 * Used in the following scenarios:
 * 1. Top-level request for items in an ungrouped view
 * 2. Next page of items in an ungrouped view
 */
class PaginatedItemsRequestResolver extends BasePaginatedViewRequestResolver<
  PaginatedItemsRequest,
  PaginatedItemsResponse,
  PageTypeForUngroupedItems,
  MemexItemsPageQueryData
> {
  protected buildRequest() {
    const {horizontalGroupedByColumnId, verticalGroupedByColumnId, ...requestVariables} = this._variables
    return {...requestVariables, ...this._pageParam}
  }

  protected async makeRequest(signal?: AbortSignal) {
    const response = await apiGetPaginatedItems(this._request, signal)
    if ('groups' in response) {
      throw new Error('Did not expect groups in response')
    }
    return response
  }

  protected override buildQueryData(): MemexItemsPageQueryData {
    const {totalCount, ...responseWithoutTotalCount} = this._response
    return {
      ...responseWithoutTotalCount,
      nodes: responseWithoutTotalCount.nodes.map(item => createMemexItemModel(item)),
    }
  }
}

/**
 * Used in the following scenarios:
 * 1. Next page of items for a group
 * 2. Next page of items for a "cell" (intersection of a primary and secondary group)
 */
class PaginatedGroupedItemsRequestResolver extends BasePaginatedViewRequestResolver<
  PaginatedGroupedItemsRequest,
  PaginatedGroupedItemsResponse,
  PageTypeForGroupedItems,
  MemexItemsPageQueryData
> {
  protected buildRequest() {
    let request: PaginatedGroupedItemsRequest | undefined = undefined

    const {horizontalGroupedByColumnId, verticalGroupedByColumnId, ...requestVariables} = this._variables

    // Based on the presence of horizontal and/or vertical grouped by column ids in our variables, we need to
    // look up the group value(s) based on the page type's group id (and potentially secondary group id)
    if (horizontalGroupedByColumnId && !verticalGroupedByColumnId) {
      // If we have a horizontal group id, and no vertical group id, then we need to use
      // the groupedByGroupValue parameter
      const groupedByGroupValue = this._groupValuesMap[this._pageType.groupId]
      if (groupedByGroupValue) {
        request = {...requestVariables, horizontalGroupedByColumnId, groupedByGroupValue}
      }
    } else if (!horizontalGroupedByColumnId && verticalGroupedByColumnId) {
      // If we have a vertical group id, and no horizontal group id, then we need to use
      // the verticalGroupedByGroupValue parameter
      const verticalGroupedByGroupValue = this._groupValuesMap[this._pageType.groupId]
      if (verticalGroupedByGroupValue) {
        request = {...requestVariables, verticalGroupedByColumnId, verticalGroupedByGroupValue}
      }
    } else if (horizontalGroupedByColumnId && verticalGroupedByColumnId && this._pageType.secondaryGroupId) {
      // If we have both a horizontal and vertical group id, then we're looking at fetching the next page
      // for a "cell" of data, and need to set verticalGroupedByGroupValue to the page type's group id,
      // and the groupedByGroupValue to the page type's secondary group id.
      // This logic only works because we only use secondary groups for the board view, where the primary
      // groups are vertical and the secondary groups are horizontal. If we ever introduce secondary
      // grouping to the table view, we'll need to revist this.
      const groupedByGroupValue = this._groupValuesMap[this._pageType.secondaryGroupId]
      const verticalGroupedByGroupValue = this._groupValuesMap[this._pageType.groupId]
      if (groupedByGroupValue && verticalGroupedByGroupValue) {
        request = {
          ...requestVariables,
          horizontalGroupedByColumnId,
          groupedByGroupValue,
          verticalGroupedByColumnId,
          verticalGroupedByGroupValue,
        }
      }
    }
    if (!request) {
      throw new Error('Could not create grouped items request')
    }
    return {...request, ...this._pageParam}
  }

  protected async makeRequest(signal?: AbortSignal) {
    const response = await apiGetPaginatedItems(this._request, signal)
    if ('groups' in response) {
      throw new Error('Did not expect groups in response')
    }
    return response
  }

  protected override buildQueryData(): MemexItemsPageQueryData {
    const {totalCount, ...responseWithoutTotalCount} = this._response
    return {
      ...responseWithoutTotalCount,
      nodes: responseWithoutTotalCount.nodes.map(item => createMemexItemModel(item)),
    }
  }
}

/**
 * Used in the following scenarios:
 * 1. Top-level request for a view grouped in one direction - returns groups and grouped items
 * 2. Next page of groups for a view grouped in one direction - returns groups and grouped items
 */
class PaginatedGroupsRequestResolver extends BasePaginatedViewRequestResolver<
  PaginatedGroupsRequest,
  PaginatedGroupsResponse,
  PageTypeForGroups,
  MemexGroupsPageQueryData
> {
  protected buildRequest() {
    let request: PaginatedGroupsRequest | undefined = undefined

    const {horizontalGroupedByColumnId, verticalGroupedByColumnId, ...requestVariables} = this._variables
    if (horizontalGroupedByColumnId && !verticalGroupedByColumnId) {
      request = {...requestVariables, horizontalGroupedByColumnId}
    } else if (!horizontalGroupedByColumnId && verticalGroupedByColumnId) {
      request = {...requestVariables, verticalGroupedByColumnId}
    }
    if (!request) {
      throw new Error('Could not create groups request')
    }
    return {...request, ...this._pageParam}
  }

  protected async makeRequest(signal?: AbortSignal) {
    const response = await apiGetPaginatedItems(this._request, signal)
    if ('nodes' in response || response.secondaryGroups != null) {
      throw new Error('Did not expect nodes or secondaryGroups in response')
    }
    return response
  }

  protected override buildQueryData(queryClient: QueryClient): MemexGroupsPageQueryData {
    const groupPageQueryData = buildGroupsQueryData(this._response)
    buildGroupedItemsQueryData(queryClient, this._variables, this._response)

    return groupPageQueryData
  }
}

/**
 * Used in the following scenarios:
 * 1. Top-level request for a view grouped in two directions - returns groups, secondary groups and grouped items
 * 2. Request for next page of groups for a view grouped in two directions without a secondaryAfter param
 * 3. Request for next page of secondary groups for a view grouped in two directions without an after param
 */
class PaginatedGroupsAndSecondaryGroupsRequestResolver extends BasePaginatedViewRequestResolver<
  PaginatedGroupsAndSecondaryGroupsRequest,
  PaginatedGroupsAndSecondaryGroupsResponse,
  PageTypeForGroups | PageTypeForSecondaryGroups,
  MemexGroupsPageQueryData
> {
  protected buildRequest() {
    let request: PaginatedGroupsAndSecondaryGroupsRequest | undefined = undefined

    const {horizontalGroupedByColumnId, verticalGroupedByColumnId, ...requestVariables} = this._variables
    if (horizontalGroupedByColumnId && verticalGroupedByColumnId) {
      // If the page type is groups, then we can just use the page param, which is either undefined or has an `after`.
      if (this._pageType === pageTypeForGroups) {
        request = {...requestVariables, horizontalGroupedByColumnId, verticalGroupedByColumnId, ...this._pageParam}
      }
      // If the page type is secondary groups, this request will only be correct if it is paired with a defined
      // page param with an after value.
      else if (this._pageParam && 'after' in this._pageParam) {
        request = {
          ...requestVariables,
          horizontalGroupedByColumnId,
          verticalGroupedByColumnId,
          secondaryAfter: this._pageParam.after,
        }
      }
    }
    if (!request) {
      throw new Error('Could not create groups and secondary groups request')
    }
    return request
  }

  protected async makeRequest(signal?: AbortSignal) {
    const response = await apiGetPaginatedItems(this._request, signal)
    if (!('secondaryGroups' in response) || !response.secondaryGroups) {
      throw new Error('Expected secondaryGroups in response')
    }
    return response
  }

  protected override buildQueryData(queryClient: QueryClient): MemexGroupsPageQueryData {
    // The data from the response to include in the query data returned from this class
    // (and ultimately from the query), depends on the the page type. If the page type is
    // 'groups', then we want to return query data from the groups from the response and
    // set ancillary data of the secondary groups and grouped items directly onto the query
    // client.
    if (this._pageType === pageTypeForGroups) {
      const groupPageQueryData = buildGroupsQueryData(this._response)
      buildSecondaryGroupsQueryData(queryClient, this._variables, this._response)
      buildGroupedItemsQueryData(queryClient, this._variables, this._response)

      return groupPageQueryData
    }
    // Otherwise, the page type is 'secondaryGroups` and we want to return the secondary
    // groups from the response as the query data, along with setting the ancillary data
    // of the grouped items directly onto the query client.
    else {
      const groupPageQueryData: MemexGroupsPageQueryData = {
        groups: [],
        pageInfo: this._response.secondaryGroups.pageInfo,
      }

      for (const group of this._response.secondaryGroups.nodes) {
        groupPageQueryData.groups.push(group)
      }

      buildGroupedItemsQueryData(queryClient, this._variables, this._response)

      return groupPageQueryData
    }
  }
}
