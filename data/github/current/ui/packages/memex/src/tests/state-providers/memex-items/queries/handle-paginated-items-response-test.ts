import type {PaginatedMemexItemsData, SliceData} from '../../../../client/api/memex-items/paginated-views'
import {handlePaginatedItemsResponse} from '../../../../client/state-providers/memex-items/queries/handle-paginated-items-response'
import {
  buildSliceDataQueryKey,
  type SliceByDataQueryKey,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import {
  type MemexItemsPageQueryData,
  type MemexItemsTotalCountsQueryData,
  pageParamForInitialPage,
  type PaginatedMemexItemsQueryVariables,
  type SliceByQueryData,
} from '../../../../client/state-providers/memex-items/queries/types'
import {getQueryDataForMemexSecondaryGroupsPage} from '../../../../client/state-providers/memex-items/query-client-api/memex-groups'
import {getQueryDataForGroupedItemsPage} from '../../../../client/state-providers/memex-items/query-client-api/memex-items'
import {
  getQueryDataForMemexItemsTotalCounts,
  mergeQueryDataForMemexItemsTotalCounts,
} from '../../../../client/state-providers/memex-items/query-client-api/memex-totals'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {createTestQueryClient} from '../../../test-app-wrapper'
import {buildGroupedItemsResponse, buildGroupedItemsResponseWithSecondaryGroups} from '../query-client-api/helpers'

describe(`handlePaginatedItemsResponse`, () => {
  it('reads slices data and updates query client', () => {
    const queryClient = createTestQueryClient()
    const variables: PaginatedMemexItemsQueryVariables = {}
    const slice: SliceData = {
      sliceId: 'sliceId1',
      sliceValue: 'sliceValue1',
      sliceMetadata: {
        id: 'abc',
        name: 'optionName',
        nameHtml: 'optionName',
        color: 'BLUE',
        description: 'description',
        descriptionHtml: 'description',
      },
      totalCount: {isApproximate: false, value: 10},
    }

    const response = buildGroupedItemsResponse({
      groups: [],
      slices: [slice],
    })

    handlePaginatedItemsResponse(queryClient, variables, response)

    const slicesQueryDataQueryKey: SliceByDataQueryKey = buildSliceDataQueryKey(variables)
    const sliceQueryData = queryClient.getQueryData<SliceByQueryData>(slicesQueryDataQueryKey)
    expect({slices: [slice]}).toEqual(sliceQueryData)
  })

  it('reads total count for ungrouped data and sets in query client', () => {
    const queryClient = createTestQueryClient()
    const variables: PaginatedMemexItemsQueryVariables = {}

    const response: PaginatedMemexItemsData = {
      nodes: [],
      pageInfo: {hasNextPage: false, hasPreviousPage: false},
      totalCount: {isApproximate: false, value: 49},
    }

    handlePaginatedItemsResponse(queryClient, variables, response)

    const expectedTotalCountsQueryData: MemexItemsTotalCountsQueryData = {
      groups: {},
      totalCount: {isApproximate: false, value: 49},
    }

    const actualTotalCountsQueryData = getQueryDataForMemexItemsTotalCounts(queryClient, variables)
    expect(expectedTotalCountsQueryData).toEqual(actualTotalCountsQueryData)
  })

  it('reads total count for grouped data and sets in query client', () => {
    const queryClient = createTestQueryClient()
    const variables: PaginatedMemexItemsQueryVariables = {}

    const response = buildGroupedItemsResponse({
      groups: [
        {
          groupId: 'group1Id',
          items: [],
          totalCountOfItemsInGroup: {isApproximate: false, value: 100},
        },
        {
          groupId: 'group2Id',
          items: [],
          totalCountOfItemsInGroup: {isApproximate: false, value: 200},
        },
      ],
      totalCount: {isApproximate: false, value: 300},
    })

    handlePaginatedItemsResponse(queryClient, variables, response)

    const expectedTotalCountsQueryData: MemexItemsTotalCountsQueryData = {
      groups: {group1Id: {isApproximate: false, value: 100}, group2Id: {isApproximate: false, value: 200}},
      totalCount: {isApproximate: false, value: 300},
    }

    const actualTotalCountsQueryData = getQueryDataForMemexItemsTotalCounts(queryClient, variables)
    expect(expectedTotalCountsQueryData).toEqual(actualTotalCountsQueryData)
  })

  it('reads total count for next page of items for a group and sets in query client', () => {
    const queryClient = createTestQueryClient()
    const variables: PaginatedMemexItemsQueryVariables = {}

    const initialTotalCountsQueryData = {
      groups: {group1Id: {isApproximate: false, value: 100}, group2Id: {isApproximate: false, value: 200}},
      totalCount: {isApproximate: false, value: 10},
    }

    mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, initialTotalCountsQueryData)

    const response: PaginatedMemexItemsData = {
      nodes: [],
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {isApproximate: false, value: 111},
    }

    handlePaginatedItemsResponse(queryClient, variables, response, {groupId: 'group1Id'})

    const expectedTotalCountsQueryData: MemexItemsTotalCountsQueryData = {
      groups: {group1Id: {isApproximate: false, value: 111}, group2Id: {isApproximate: false, value: 200}},
      totalCount: {isApproximate: false, value: 10},
    }

    const actualTotalCountsQueryData = getQueryDataForMemexItemsTotalCounts(queryClient, variables)
    expect(expectedTotalCountsQueryData).toEqual(actualTotalCountsQueryData)
  })

  it('returns page of memex items from response for ungrouped data', () => {
    const queryClient = createTestQueryClient()
    const variables: PaginatedMemexItemsQueryVariables = {}
    const issue1 = issueFactory.build()
    const issue2 = issueFactory.build()

    const response: PaginatedMemexItemsData = {
      nodes: [issue1, issue2],
      pageInfo: {hasNextPage: false, hasPreviousPage: false},
      totalCount: {isApproximate: false, value: 49},
    }

    const queryDataFromResponse = handlePaginatedItemsResponse(queryClient, variables, response)
    expect(queryDataFromResponse.queryData).toHaveProperty('nodes')
    const queryDataAsItemsPage = queryDataFromResponse.queryData as MemexItemsPageQueryData

    expect(queryDataAsItemsPage.nodes).toHaveLength(2)
    expect(queryDataAsItemsPage.nodes[0].id).toEqual(issue1.id)
    expect(queryDataAsItemsPage.nodes[1].id).toEqual(issue2.id)
    expect(queryDataAsItemsPage.pageInfo).toEqual(response.pageInfo)
  })

  it('returns page of memex groups and sets query data for grouped items from response for grouped data', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
    const variables: PaginatedMemexItemsQueryVariables = {}
    const issue1 = issueFactory.build()
    const issue2 = issueFactory.build()

    const response = buildGroupedItemsResponse({
      groups: [
        {
          groupId: 'group1Id',
          items: [issue1],
          totalCountOfItemsInGroup: {isApproximate: false, value: 100},
        },
        {
          groupId: 'group2Id',
          items: [issue2],
          totalCountOfItemsInGroup: {isApproximate: false, value: 200},
        },
      ],
      totalCount: {isApproximate: false, value: 300},
    })

    const queryDataFromResponse = handlePaginatedItemsResponse(queryClient, variables, response)

    // Verify groups query data is returned
    if (
      !('groups' in response) ||
      !('groups' in queryDataFromResponse.queryData) ||
      !('secondaryGroups' in queryDataFromResponse)
    ) {
      // This is used for type safety
      throw Error('groups expected to be in response')
    }

    const {queryData: queryDataForGroups, secondaryGroups, groupedItems} = queryDataFromResponse

    expect(secondaryGroups).toBeUndefined()
    expect(queryDataForGroups.groups).toHaveLength(2)
    expect(queryDataForGroups.groups[0].groupId).toEqual('group1Id')
    expect(queryDataForGroups.groups[1].groupId).toEqual('group2Id')
    const expectedPageInfo = 'pageInfo' in response ? response.pageInfo : response.groups.pageInfo
    expect(queryDataForGroups.pageInfo).toEqual(expectedPageInfo)

    expect(groupedItems).toHaveLength(2)
    expect(groupedItems[0]).toEqual({groupId: 'group1Id'})
    expect(groupedItems[1]).toEqual({groupId: 'group2Id'})

    const queryDataForGroup1 = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      {groupId: 'group1Id'},
      pageParamForInitialPage,
    )
    const queryDataForGroup2 = getQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      {groupId: 'group2Id'},
      pageParamForInitialPage,
    )

    // Verify grouped items individual queries are set in query client

    expect(queryDataForGroup1?.nodes[0].id).toEqual(issue1.id)
    const expectedGroup1ItemsPageInfo = response.groupedItems[0].pageInfo
    expect(queryDataForGroup1?.pageInfo).toEqual(expectedGroup1ItemsPageInfo)
    expect(queryDataForGroup2?.nodes[0].id).toEqual(issue2.id)
    const expectedGroup2ItemsPageInfo = response.groupedItems[1].pageInfo
    expect(queryDataForGroup2?.pageInfo).toEqual(expectedGroup2ItemsPageInfo)
  })

  it('returns page of memex groups and sets query data for secondary groups from response for grouped data', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
    const variables: PaginatedMemexItemsQueryVariables = {}
    const [issue1, issue2, issue3, issue4] = [
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
    ]

    const response = buildGroupedItemsResponseWithSecondaryGroups({
      groups: [
        {
          groupId: 'group1Id',
          nestedItems: [
            {items: [issue1], secondaryGroupId: 'secondaryGroup1Id'},
            {items: [issue2], secondaryGroupId: 'secondaryGroup2Id'},
          ],
          totalCountOfItemsInGroup: {isApproximate: false, value: 100},
        },
        {
          groupId: 'group2Id',
          nestedItems: [
            {items: [issue3], secondaryGroupId: 'secondaryGroup1Id'},
            {items: [issue4], secondaryGroupId: 'secondaryGroup2Id'},
          ],
          totalCountOfItemsInGroup: {isApproximate: false, value: 200},
        },
      ],
      secondaryGroups: [
        {
          groupId: 'secondaryGroup1Id',
        },
        {
          groupId: 'secondaryGroup2Id',
        },
      ],
      totalCount: {isApproximate: false, value: 300},
      pageInfoForSecondaryGroups: {hasNextPage: true, hasPreviousPage: false, endCursor: 'endCursorForSecondaryGroups'},
    })

    const queryDataFromResponse = handlePaginatedItemsResponse(queryClient, variables, response)

    // Verify groups query data is returned
    if (
      !('groups' in response) ||
      !('secondaryGroups' in response) ||
      !('groups' in queryDataFromResponse.queryData) ||
      !('secondaryGroups' in queryDataFromResponse)
    ) {
      // This is used for type safety
      throw Error('groups and secondary groups expected to be in response')
    }

    const {queryData: queryDataForGroups, secondaryGroups, groupedItems} = queryDataFromResponse

    expect(queryDataForGroups.groups).toHaveLength(2)
    expect(queryDataForGroups.groups[0].groupId).toEqual('group1Id')
    expect(queryDataForGroups.groups[1].groupId).toEqual('group2Id')
    let expectedPageInfo = 'pageInfo' in response ? response.pageInfo : response.groups.pageInfo
    expect(queryDataForGroups.pageInfo).toEqual(expectedPageInfo)

    expect(secondaryGroups?.groups).toHaveLength(2)
    expect(secondaryGroups?.groups[0].groupId).toEqual('secondaryGroup1Id')
    expect(secondaryGroups?.groups[1].groupId).toEqual('secondaryGroup2Id')
    expectedPageInfo = 'pageInfo' in response ? response.pageInfo : response.secondaryGroups?.pageInfo
    expect(secondaryGroups?.pageInfo).toEqual(expectedPageInfo)

    expect(groupedItems).toHaveLength(4)
    expect(groupedItems[0]).toEqual({groupId: 'group1Id', secondaryGroupId: 'secondaryGroup1Id'})
    expect(groupedItems[1]).toEqual({groupId: 'group1Id', secondaryGroupId: 'secondaryGroup2Id'})
    expect(groupedItems[2]).toEqual({groupId: 'group2Id', secondaryGroupId: 'secondaryGroup1Id'})
    expect(groupedItems[3]).toEqual({groupId: 'group2Id', secondaryGroupId: 'secondaryGroup2Id'})

    const queryDataForSecondaryGroups = getQueryDataForMemexSecondaryGroupsPage(
      queryClient,
      variables,
      pageParamForInitialPage,
    )

    // Verify secondary group query is set in query client

    expect(queryDataForSecondaryGroups?.groups).toHaveLength(2)
    expect(queryDataForSecondaryGroups?.groups[0].groupId).toEqual('secondaryGroup1Id')
    expect(queryDataForSecondaryGroups?.groups[1].groupId).toEqual('secondaryGroup2Id')
    const expectedGroup1ItemsPageInfo = {
      hasNextPage: true,
      hasPreviousPage: false,
      endCursor: 'endCursorForSecondaryGroups',
    }
    expect(queryDataForSecondaryGroups?.pageInfo).toEqual(expectedGroup1ItemsPageInfo)
  })
})
