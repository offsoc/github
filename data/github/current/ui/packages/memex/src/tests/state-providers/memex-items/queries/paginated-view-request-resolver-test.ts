import type {QueryClient} from '@tanstack/react-query'

import type {
  GetPaginatedItemsRequest,
  GetPaginatedItemsResponse,
  PaginatedGroupsAndSecondaryGroupsData,
  PaginatedGroupsData,
  PaginatedItemsData,
  SliceData,
} from '../../../../client/api/memex-items/paginated-views'
import {
  AFTER_PARAM,
  HORIZONTAL_GROUPED_BY_COLUMN_KEY,
  HORIZONTAL_GROUPED_BY_COLUMN_VALUE_KEY,
  Q_PARAM,
  SECONDARY_AFTER_PARAM,
  SLICE_BY_COLUMN_ID_KEY,
  VERTICAL_GROUPED_BY_COLUMN_KEY,
  VERTICAL_GROUPED_BY_COLUMN_VALUE_KEY,
} from '../../../../client/platform/url'
import {
  GroupedItemBatchRequestResolver,
  paginatedViewRequestResolverFactory,
} from '../../../../client/state-providers/memex-items/queries/paginated-view-request-resolver'
import {
  buildSliceDataQueryKey,
  createGroupedItemsId,
  createGroupedItemsPageType,
  type PageTypeForGroupedItems,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
  pageTypeForUngroupedItems,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import {
  type GroupedItemBatchPageParam,
  type MemexGroupsPageQueryData,
  type MemexItemsPageQueryData,
  type MemexItemsTotalCountsQueryData,
  type PageParam,
  pageParamForInitialPage,
  type PaginatedMemexItemsQueryVariables,
  type SliceByQueryData,
} from '../../../../client/state-providers/memex-items/queries/types'
import {
  getQueryDataForMemexSecondaryGroupsPage,
  type GroupIdToGroupValueMap,
} from '../../../../client/state-providers/memex-items/query-client-api/memex-groups'
import {getQueryDataForGroupedItemsPage} from '../../../../client/state-providers/memex-items/query-client-api/memex-items'
import {
  getQueryDataForMemexItemsTotalCounts,
  mergeQueryDataForMemexItemsTotalCounts,
} from '../../../../client/state-providers/memex-items/query-client-api/memex-totals'
import {get_getPaginatedItems} from '../../../../mocks/msw-responders/memex-items'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {mswServer} from '../../../msw-server'
import {createTestQueryClient} from '../../../test-app-wrapper'
import {buildGroupedItemsResponse, buildGroupedItemsResponseWithSecondaryGroups} from '../query-client-api/helpers'

function stubGetPaginatedItemsMethodAndCaptureQueryParameters(response: GetPaginatedItemsResponse) {
  const stub = jest.fn<GetPaginatedItemsResponse, [URLSearchParams]>()
  const handler = get_getPaginatedItems((body, req) => {
    const url = new URL(req.url)
    stub(url.searchParams)
    return Promise.resolve(response)
  })
  mswServer.use(handler)
  return stub
}

function expectRequestToHaveBeenCalledWithQueryParams(
  stub: jest.Mock<GetPaginatedItemsResponse, [URLSearchParams]>,
  request: GetPaginatedItemsRequest,
) {
  expect(stub).toHaveBeenCalledTimes(1)
  const queryParams = stub.mock.calls[0][0]

  let queryParamCount = 0
  for (const queryParam of queryParams.keys()) {
    queryParamCount++
    if (queryParam === Q_PARAM) {
      expect(queryParams.get(queryParam)).toEqual(request.q)
    } else if (queryParam === AFTER_PARAM) {
      expect(queryParams.get(queryParam)).toEqual(request.after)
    } else if (queryParam === SECONDARY_AFTER_PARAM) {
      expect(queryParams.get(queryParam)).toEqual(request.secondaryAfter)
    } else if (queryParam === SLICE_BY_COLUMN_ID_KEY) {
      expect(queryParams.get(queryParam)).toEqual(request.sliceByColumnId?.toString())
    } else if (queryParam === VERTICAL_GROUPED_BY_COLUMN_KEY) {
      expect(queryParams.get(queryParam)).toEqual(request.verticalGroupedByColumnId?.toString())
    } else if (queryParam === VERTICAL_GROUPED_BY_COLUMN_VALUE_KEY) {
      expect(queryParams.get(queryParam)).toEqual(request.verticalGroupedByGroupValue)
    } else if (queryParam === HORIZONTAL_GROUPED_BY_COLUMN_KEY) {
      expect(queryParams.get(queryParam)).toEqual(request.horizontalGroupedByColumnId?.toString())
    } else if (queryParam === HORIZONTAL_GROUPED_BY_COLUMN_VALUE_KEY) {
      expect(queryParams.get(queryParam)).toEqual(request.groupedByGroupValue)
    } else {
      throw new Error(`Encountered unexpected query param key ${queryParam}`)
    }
  }

  // Ensure that there weren't any keys in the expected request that
  // we didn't have a query parameter for
  expect(queryParamCount).toEqual(Object.keys(request).length)
}

function expectPaginatedItemsResponse(actualResponse: GetPaginatedItemsResponse, expectedResponse: PaginatedItemsData) {
  // Assert response is correct shape
  if (!('nodes' in actualResponse)) {
    throw new Error('Expected nodes to be in response')
  }
  expect(actualResponse).toEqual(expectedResponse)
}

function expectPaginatedGroupsResponse(
  actualResponse: GetPaginatedItemsResponse,
  expectedResponse: PaginatedGroupsData,
) {
  // Assert response is correct shape
  if (!('groups' in actualResponse)) {
    throw new Error('Expected groups to be in response')
  }
  expect(actualResponse).toEqual(expectedResponse)
}

function expectPaginatedGroupsAndSecondaryGroupsResponse(
  actualResponse: GetPaginatedItemsResponse,
  expectedResponse: PaginatedGroupsAndSecondaryGroupsData,
) {
  // Assert response is correct shape
  if (!('groups' in actualResponse) || !('secondaryGroups' in actualResponse)) {
    throw new Error('Expected groups and secondaryGroups to be in response')
  }
  expect(actualResponse).toEqual(expectedResponse)
}

function expectPaginatedItemsQueryData(
  queryData: MemexItemsPageQueryData | MemexGroupsPageQueryData,
  expectedResponse: PaginatedItemsData,
) {
  if (!('nodes' in queryData)) {
    throw new Error('Expected nodes to be in queryData')
  }
  expect(queryData.nodes).toHaveLength(expectedResponse.nodes.length)
  for (const [i, node] of queryData.nodes.entries()) {
    expect(node.id).toEqual(expectedResponse.nodes[i].id)
  }
}

function expectPaginatedGroupsQueryData(
  queryData: MemexItemsPageQueryData | MemexGroupsPageQueryData,
  expectedResponse: PaginatedGroupsData | PaginatedGroupsAndSecondaryGroupsData,
) {
  if (!('groups' in queryData)) {
    throw new Error('Expected groups to be in queryData')
  }
  expect(queryData.groups).toHaveLength(expectedResponse.groups.nodes.length)
  for (const [i, group] of queryData.groups.entries()) {
    expect(group.groupId).toEqual(expectedResponse.groups.nodes[i].groupId)
  }
}

function expectPaginatedSecondaryGroupsQueryDataFromResponse(
  queryData: MemexItemsPageQueryData | MemexGroupsPageQueryData,
  expectedResponse: PaginatedGroupsData | PaginatedGroupsAndSecondaryGroupsData,
) {
  if (!('groups' in queryData)) {
    throw new Error('Expected groups to be in queryData')
  }
  if (!('secondaryGroups' in expectedResponse) || expectedResponse.secondaryGroups == null) {
    throw new Error('Expected secondaryGroups to be in response')
  }
  expect(queryData.groups).toHaveLength(expectedResponse.secondaryGroups.nodes.length)
  for (const [i, group] of queryData.groups.entries()) {
    expect(group.groupId).toEqual(expectedResponse.secondaryGroups.nodes[i].groupId)
  }
}

function expectGroupedItemsQueryData(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
  response: PaginatedGroupsData | PaginatedGroupsAndSecondaryGroupsData,
) {
  for (const groupedItems of response.groupedItems) {
    const actualQueryData = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      createGroupedItemsPageType(groupedItems),
      pageParam,
    )

    if (!actualQueryData) {
      throw new Error('Grouped items query data was not properly initialized')
    }
    expect(actualQueryData.nodes).toHaveLength(groupedItems.nodes.length)
    for (const [i, node] of actualQueryData.nodes.entries()) {
      expect(node.id).toEqual(groupedItems.nodes[i].id)
    }
  }
}

function expectSecondaryGroupsQueryData(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
  response: PaginatedGroupsAndSecondaryGroupsData,
) {
  const actualQueryData = getQueryDataForMemexSecondaryGroupsPage(
    queryClient,
    variables,

    pageParam,
  )

  if (!actualQueryData) {
    throw new Error('Secondary groups query data was not properly initialized')
  }
  expect(actualQueryData.groups).toHaveLength(response.secondaryGroups.nodes.length)
  for (const [i, node] of actualQueryData.groups.entries()) {
    expect(node.groupId).toEqual(response.secondaryGroups.nodes[i].groupId)
  }
}

function expectTotalCountQueryData(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  expectedQueryData: MemexItemsTotalCountsQueryData,
) {
  const actualQueryData = getQueryDataForMemexItemsTotalCounts(queryClient, variables)
  expect(actualQueryData).toEqual(expectedQueryData)
}

function expectSlicesQueryData(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  expectedQueryData: Array<SliceData>,
) {
  const actualQueryData = queryClient.getQueryData<SliceByQueryData>(buildSliceDataQueryKey(variables))
  expect(actualQueryData?.slices).toEqual(expectedQueryData)
}

describe('paginated request resolver', () => {
  describe('for an ungrouped view', () => {
    it('fetches initial page of items', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue'}
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForUngroupedItems
      const pageParam = pageParamForInitialPage

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const issue = issueFactory.build()
      const expectedResponse: PaginatedItemsData = {
        nodes: [issue],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
        totalCount: {isApproximate: false, value: 1},
      }

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {q: 'is:issue'})

      // Assert response is correct
      expectPaginatedItemsResponse(response, expectedResponse)

      const queryClient = createTestQueryClient()
      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedItemsQueryData(queryData, expectedResponse)

      // Assert total count query data was properly set up
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        groups: {},
        totalCount: response.totalCount,
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches next page of items', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {}
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForUngroupedItems
      const pageParam = {after: 'cursor'}

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const issue = issueFactory.build()
      const expectedResponse: PaginatedItemsData = {
        nodes: [issue],
        pageInfo: {hasNextPage: false, hasPreviousPage: true},
        totalCount: {isApproximate: false, value: 3},
      }

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {after: 'cursor'})

      // Assert response is correct
      expectPaginatedItemsResponse(response, expectedResponse)

      const queryClient = createTestQueryClient()
      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedItemsQueryData(queryData, expectedResponse)

      // Assert total count query data was properly set up
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        groups: {},
        totalCount: response.totalCount,
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('handles slice by column id and sets up slices query data', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {sliceByColumnId: 123}
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForUngroupedItems
      const pageParam = pageParamForInitialPage

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const issue = issueFactory.build()
      const expectedSlices: Array<SliceData> = [
        {
          sliceId: 'sliceId',
          sliceValue: 'sliceValue',
          totalCount: {isApproximate: false, value: 1},
        },
      ]
      const expectedResponse: PaginatedItemsData = {
        nodes: [issue],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
        totalCount: {isApproximate: false, value: 1},
        slices: expectedSlices,
      }

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {sliceByColumnId: 123})

      // Assert response is correct
      expectPaginatedItemsResponse(response, expectedResponse)

      const queryClient = createTestQueryClient()
      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedItemsQueryData(queryData, expectedResponse)

      // Assert query data for slices was set in query client
      expectSlicesQueryData(queryClient, variables, expectedSlices)
    })
  })

  describe('for a request for the next page of grouped items', () => {
    it('fetches next page of items with a vertical group by id', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue', verticalGroupedByColumnId: 123}
      const groupValuesMap: GroupIdToGroupValueMap = {group1Id: 'group1Value'}
      const pageType: PageTypeForGroupedItems = {groupId: 'group1Id'}
      const pageParam = {after: 'group1Cursor'}

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const issue = issueFactory.build()
      const expectedResponse: PaginatedItemsData = {
        nodes: [issue],
        pageInfo: {hasNextPage: false, hasPreviousPage: true},
        totalCount: {isApproximate: false, value: 5},
      }

      const queryClient = createTestQueryClient()
      const initialTotalCount: MemexItemsTotalCountsQueryData = {
        groups: {},
        totalCount: {isApproximate: false, value: 10},
      }
      mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, initialTotalCount)

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        verticalGroupedByGroupValue: 'group1Value',
        after: 'group1Cursor',
      })

      // Assert response is correct
      expectPaginatedItemsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedItemsQueryData(queryData, expectedResponse)

      // Assert total count query data was properly set up, leaving
      // the overall total count the same, but update for the group based on the response
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        ...initialTotalCount,
        groups: {group1Id: response.totalCount},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches next page of items with a horizontal group by id', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue', horizontalGroupedByColumnId: 123}
      const groupValuesMap: GroupIdToGroupValueMap = {group1Id: 'group1Value'}
      const pageType: PageTypeForGroupedItems = {groupId: 'group1Id'}
      const pageParam = {after: 'group1Cursor'}

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const issue = issueFactory.build()
      const expectedResponse: PaginatedItemsData = {
        nodes: [issue],
        pageInfo: {hasNextPage: false, hasPreviousPage: true},
        totalCount: {isApproximate: false, value: 5},
      }

      const queryClient = createTestQueryClient()
      const initialTotalCount: MemexItemsTotalCountsQueryData = {
        groups: {},
        totalCount: {isApproximate: false, value: 10},
      }
      mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, initialTotalCount)

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        horizontalGroupedByColumnId: 123,
        groupedByGroupValue: 'group1Value',
        after: 'group1Cursor',
      })

      // Assert response is correct
      expectPaginatedItemsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedItemsQueryData(queryData, expectedResponse)

      // Assert total count query data was properly set up, leaving
      // the overall total count the same, but update for the group based on the response
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        ...initialTotalCount,
        groups: {group1Id: response.totalCount},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches next page of items with both a vertical and horizontal group by id', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {
        horizontalGroupedByColumnId: 123,
        verticalGroupedByColumnId: 456,
      }
      const groupValuesMap: GroupIdToGroupValueMap = {group1Id: 'group1Value', group2Id: 'group2Value'}
      const pageType: PageTypeForGroupedItems = {groupId: 'group1Id', secondaryGroupId: 'group2Id'}
      const pageParam = {after: 'cursorForIntersection'}

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const issue = issueFactory.build()
      const expectedResponse: PaginatedItemsData = {
        nodes: [issue],
        pageInfo: {hasNextPage: false, hasPreviousPage: true},
        totalCount: {isApproximate: false, value: 5},
      }

      const queryClient = createTestQueryClient()
      const initialTotalCount: MemexItemsTotalCountsQueryData = {
        groups: {},
        totalCount: {isApproximate: false, value: 10},
      }
      mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, initialTotalCount)

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        verticalGroupedByColumnId: 456,
        verticalGroupedByGroupValue: 'group1Value',
        horizontalGroupedByColumnId: 123,
        groupedByGroupValue: 'group2Value',
        after: 'cursorForIntersection',
      })

      // Assert response is correct
      expectPaginatedItemsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedItemsQueryData(queryData, expectedResponse)

      // Assert total count query data was properly set up, leaving
      // the overall total count the same, but update for the group based on the response
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        ...initialTotalCount,
        groups: {[createGroupedItemsId(pageType)]: response.totalCount},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })
  })

  describe('for a grouped view', () => {
    it('fetches top level groups and grouped items with a vertical group by id', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue', verticalGroupedByColumnId: 123}
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForGroups
      const pageParam = pageParamForInitialPage

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const [issue1, issue2, issue3] = [issueFactory.build(), issueFactory.build(), issueFactory.build()]
      const expectedResponse = buildGroupedItemsResponse({
        groups: [
          {groupId: 'group1Id', items: [issue1, issue2], totalCountOfItemsInGroup: {isApproximate: false, value: 2}},
          {groupId: 'group2Id', items: [issue3], totalCountOfItemsInGroup: {isApproximate: false, value: 1}},
        ],
        totalCount: {isApproximate: false, value: 3},
      }) as PaginatedGroupsData

      const queryClient = createTestQueryClient()

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
      })

      // Assert response is correct
      expectPaginatedGroupsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedGroupsQueryData(queryData, expectedResponse)

      // Assert grouped items query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these grouped items
      expectGroupedItemsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)

      // Assert total count query data was properly set up
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        totalCount: response.totalCount,
        groups: {group1Id: {isApproximate: false, value: 2}, group2Id: {isApproximate: false, value: 1}},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches top level groups and grouped items with a horizontal group by id', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue', horizontalGroupedByColumnId: 123}
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForGroups
      const pageParam = pageParamForInitialPage

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const [issue1, issue2, issue3] = [issueFactory.build(), issueFactory.build(), issueFactory.build()]
      const expectedResponse = buildGroupedItemsResponse({
        groups: [
          {groupId: 'group1Id', items: [issue1, issue2], totalCountOfItemsInGroup: {isApproximate: false, value: 2}},
          {groupId: 'group2Id', items: [issue3], totalCountOfItemsInGroup: {isApproximate: false, value: 1}},
        ],
        totalCount: {isApproximate: false, value: 3},
      }) as PaginatedGroupsData

      const queryClient = createTestQueryClient()

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        horizontalGroupedByColumnId: 123,
      })

      // Assert response is correct
      expectPaginatedGroupsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedGroupsQueryData(queryData, expectedResponse)

      // Assert grouped items query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these grouped items
      expectGroupedItemsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)

      // Assert total count query data was properly set up
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        totalCount: response.totalCount,
        groups: {group1Id: {isApproximate: false, value: 2}, group2Id: {isApproximate: false, value: 1}},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches top level groups, secondary groups and grouped items with both a vertical and horizontal group by id', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        horizontalGroupedByColumnId: 456,
      }
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForGroups
      const pageParam = pageParamForInitialPage

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const [issue1] = [issueFactory.build()]
      const expectedResponse = buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            groupId: 'group1Id',
            nestedItems: [{secondaryGroupId: 'secondaryGroup1Id', items: [issue1]}],
          },
        ],
        secondaryGroups: [{groupId: 'secondaryGroup1Id'}],
        totalCount: {isApproximate: false, value: 1},
      }) as PaginatedGroupsAndSecondaryGroupsData

      const queryClient = createTestQueryClient()

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        horizontalGroupedByColumnId: 456,
      })

      // Assert response is correct
      expectPaginatedGroupsAndSecondaryGroupsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedGroupsQueryData(queryData, expectedResponse)

      // Assert secondary groups query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these secondary groups
      expectSecondaryGroupsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)

      // Assert grouped items query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these grouped items
      expectGroupedItemsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)

      // Assert total count query data was properly set up
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        totalCount: response.totalCount,
        groups: {group1Id: {isApproximate: false, value: 1}},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches next page of groups with a vertical group by id', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue', verticalGroupedByColumnId: 123}
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForGroups
      const pageParam = {after: 'groupsCursor'}

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const [issue1, issue2, issue3] = [issueFactory.build(), issueFactory.build(), issueFactory.build()]
      const expectedResponse = buildGroupedItemsResponse({
        groups: [
          {groupId: 'group1Id', items: [issue1, issue2], totalCountOfItemsInGroup: {isApproximate: false, value: 2}},
          {groupId: 'group2Id', items: [issue3], totalCountOfItemsInGroup: {isApproximate: false, value: 1}},
        ],
        totalCount: {isApproximate: false, value: 3},
      }) as PaginatedGroupsData

      const queryClient = createTestQueryClient()

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        after: 'groupsCursor',
      })

      // Assert response is correct
      expectPaginatedGroupsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedGroupsQueryData(queryData, expectedResponse)

      // Assert grouped items query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these grouped items
      expectGroupedItemsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)

      // Assert total count query data was properly set up
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        totalCount: response.totalCount,
        groups: {group1Id: {isApproximate: false, value: 2}, group2Id: {isApproximate: false, value: 1}},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches next page of groups with a horizontal group by id', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue', horizontalGroupedByColumnId: 123}
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForGroups
      const pageParam = {after: 'groupsCursor'}

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const [issue1, issue2, issue3] = [issueFactory.build(), issueFactory.build(), issueFactory.build()]
      const expectedResponse = buildGroupedItemsResponse({
        groups: [
          {groupId: 'group1Id', items: [issue1, issue2], totalCountOfItemsInGroup: {isApproximate: false, value: 2}},
          {groupId: 'group2Id', items: [issue3], totalCountOfItemsInGroup: {isApproximate: false, value: 1}},
        ],
        totalCount: {isApproximate: false, value: 3},
      }) as PaginatedGroupsData

      const queryClient = createTestQueryClient()

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        horizontalGroupedByColumnId: 123,
        after: 'groupsCursor',
      })

      // Assert response is correct
      expectPaginatedGroupsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedGroupsQueryData(queryData, expectedResponse)

      // Assert grouped items query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these grouped items
      expectGroupedItemsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)

      // Assert total count query data was properly set up
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        totalCount: response.totalCount,
        groups: {group1Id: {isApproximate: false, value: 2}, group2Id: {isApproximate: false, value: 1}},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches next page of groups with a vertical group by id and horizontal group by id with no secondaryAfter', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        horizontalGroupedByColumnId: 456,
      }
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForGroups
      const pageParam = {after: 'groupsCursor'}

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const [issue1] = [issueFactory.build()]
      const expectedResponse = buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            groupId: 'group3Id',
            nestedItems: [{secondaryGroupId: 'secondaryGroup1Id', items: [issue1]}],
          },
        ],
        secondaryGroups: [{groupId: 'secondaryGroup1Id'}],
        totalCount: {isApproximate: false, value: 1},
      }) as PaginatedGroupsAndSecondaryGroupsData

      const queryClient = createTestQueryClient()

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        horizontalGroupedByColumnId: 456,
        after: 'groupsCursor',
      })

      // Assert response is correct
      expectPaginatedGroupsAndSecondaryGroupsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response
      expectPaginatedGroupsQueryData(queryData, expectedResponse)

      // Assert secondary groups query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these secondary groups
      expectSecondaryGroupsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)

      // Assert grouped items query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these grouped items
      expectGroupedItemsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)

      // Assert total count query data was properly set up
      const expectedTotalCountData: MemexItemsTotalCountsQueryData = {
        totalCount: response.totalCount,
        groups: {group3Id: {isApproximate: false, value: 1}},
      }
      expectTotalCountQueryData(queryClient, variables, expectedTotalCountData)
    })

    it('fetches next page of secondary groups with a vertical group by id and horizontal group by id with no after', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        horizontalGroupedByColumnId: 456,
      }
      const groupValuesMap: GroupIdToGroupValueMap = {}
      const pageType = pageTypeForSecondaryGroups
      const pageParam = {after: 'secondaryGroupsCursor'}

      const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)

      const [issue1] = [issueFactory.build()]
      const expectedResponse = buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            groupId: 'group1Id',
            nestedItems: [{secondaryGroupId: 'secondaryGroup3Id', items: [issue1]}],
          },
        ],
        secondaryGroups: [{groupId: 'secondaryGroup3Id'}],
        totalCount: {isApproximate: false, value: 1},
      }) as PaginatedGroupsAndSecondaryGroupsData

      const queryClient = createTestQueryClient()

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        horizontalGroupedByColumnId: 456,
        secondaryAfter: 'secondaryGroupsCursor',
      })

      // Assert response is correct
      expectPaginatedGroupsAndSecondaryGroupsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      const queryData = requestResolver.queryData()

      // Assert query data is correct based on response - we're returning the secondary groups
      // query data in this case, not setting it manually onto the query client
      expectPaginatedSecondaryGroupsQueryDataFromResponse(queryData, expectedResponse)

      // Assert grouped items query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these grouped items
      expectGroupedItemsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)
    })

    it('fetches a grouped items batch based on an after and secondary after parameter', async () => {
      const variables: PaginatedMemexItemsQueryVariables = {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        horizontalGroupedByColumnId: 456,
      }
      const pageParam: GroupedItemBatchPageParam = {
        after: 'primaryGroupsCursor',
        secondaryAfter: 'secondaryGroupsCursor',
      }

      const requestResolver = new GroupedItemBatchRequestResolver(variables, pageParam)

      const [issue1] = [issueFactory.build()]
      const expectedResponse = buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            groupId: 'group3Id',
            nestedItems: [{secondaryGroupId: 'secondaryGroup3Id', items: [issue1]}],
          },
        ],
        secondaryGroups: [{groupId: 'secondaryGroup3Id'}],
        totalCount: {isApproximate: false, value: 1},
      }) as PaginatedGroupsAndSecondaryGroupsData

      const queryClient = createTestQueryClient()

      // Set up mock request handler
      const requestStub = stubGetPaginatedItemsMethodAndCaptureQueryParameters(expectedResponse)

      const response = await requestResolver.fetchData()
      // Assert request stub is called with correct request parameters
      expectRequestToHaveBeenCalledWithQueryParams(requestStub, {
        q: 'is:issue',
        verticalGroupedByColumnId: 123,
        horizontalGroupedByColumnId: 456,
        after: 'primaryGroupsCursor',
        secondaryAfter: 'secondaryGroupsCursor',
      })

      // Assert response is correct
      expectPaginatedGroupsAndSecondaryGroupsResponse(response, expectedResponse)

      requestResolver.handleResponse(queryClient)

      // Assert grouped items query data was properly set up
      // we use `pageParamForInitialPage` because we're looking at the first page of data for these grouped items
      expectGroupedItemsQueryData(queryClient, variables, pageParamForInitialPage, expectedResponse)
    })
  })
})
