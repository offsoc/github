import type {QueryClient} from '@tanstack/react-query'

import {createMemexItemModel, type MemexItemModel} from '../../../../client/models/memex-item-model'
import {
  buildPageParamsQueryKey,
  buildUngroupedMemexItemsQueryKey,
  createGroupedItemsId,
  isQueryForItemsMetadata,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
  paginatedMemexItemsQueryKey,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import {
  type GroupedPageParamsQueryData,
  type GroupedWithSecondaryGroupsPageParamsQueryData,
  type MemexItemsPageQueryData,
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PageParamsQueryData,
  type PaginatedMemexItemsQueryVariables,
  type UngroupedPageParamsQueryData,
} from '../../../../client/state-providers/memex-items/queries/types'
import {
  setQueryDataForMemexGroupsPage,
  setQueryDataForMemexSecondaryGroupsPage,
} from '../../../../client/state-providers/memex-items/query-client-api/memex-groups'
import {getMemexItemModelsFromQueryClient} from '../../../../client/state-providers/memex-items/query-client-api/memex-items'
import {
  getPageParamsQueryDataForVariables,
  invalidateInactiveInitialQueries,
  setPageParamsQueryDataForVariables,
} from '../../../../client/state-providers/memex-items/query-client-api/page-params'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {
  activateQueryByQueryKey,
  initQueryClient,
  setAndActivateInitialQueriesByPage,
  setGroupedItemsForPage,
  setMemexItemsForPage,
} from './helpers'

function getItemsAndGroupsQueriesData(queryClient: QueryClient) {
  return queryClient.getQueriesData({
    queryKey: [paginatedMemexItemsQueryKey],
    predicate: query => !isQueryForItemsMetadata(query),
  })
}

describe('query-client-api page params', () => {
  it('operates on the correct query when there are variables in the query key', () => {
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

    const queryClient = initQueryClient()
    const memexItemModels = [issueFactory.build()].map(item => createMemexItemModel(item))
    const queryData: MemexItemsPageQueryData = {
      nodes: memexItemModels,
      pageInfo: {endCursor: '', startCursor: '', hasNextPage: false, hasPreviousPage: false},
    }
    const key = buildUngroupedMemexItemsQueryKey({q: 'status:Todo'}, pageParamForInitialPage)

    queryClient.setQueryData<MemexItemsPageQueryData>(key, queryData)

    // Our helper for determining the correct key requires an "active" query.
    // By adding an observer to the query, we can place it into the active state
    activateQueryByQueryKey(queryClient, key)

    const returnedMemexItemModels = getMemexItemModelsFromQueryClient(queryClient)
    expect(returnedMemexItemModels).toEqual(memexItemModels)
  })
  it('operates on the on the key for an "active" query', () => {
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

    const queryClient = initQueryClient()
    const memexItemModelsForActive = [issueFactory.build()].map(item => createMemexItemModel(item))
    const memexItemModelsForInactive = [issueFactory.build()].map(item => createMemexItemModel(item))
    const queryDataForActive: MemexItemsPageQueryData = {
      nodes: memexItemModelsForActive,
      pageInfo: {endCursor: '', startCursor: '', hasNextPage: false, hasPreviousPage: false},
    }
    const queryDataForInactive = {
      nodes: memexItemModelsForInactive,
      pageInfo: {endCursor: '', startCursor: '', hasNextPage: false, hasPreviousPage: false},
      totalCount: {value: memexItemModelsForInactive.length, isApproximate: false},
    }
    const keyForActiveQuery = buildUngroupedMemexItemsQueryKey({q: 'status:Todo'}, pageParamForInitialPage)
    const keyForInactiveQuery = buildUngroupedMemexItemsQueryKey({q: 'status:Done'}, pageParamForInitialPage)

    queryClient.setQueryData<MemexItemsPageQueryData>(keyForInactiveQuery, queryDataForInactive)
    queryClient.setQueryData<MemexItemsPageQueryData>(keyForActiveQuery, queryDataForActive)

    // Our helper for determining the correct key requires an "active" query.
    // By adding an observer to the query, we can place it into the active state
    activateQueryByQueryKey(queryClient, keyForActiveQuery)

    const returnedMemexItemModels = getMemexItemModelsFromQueryClient(queryClient)
    expect(returnedMemexItemModels).toEqual(memexItemModelsForActive)
  })

  describe('getPageParamsQueryDataForVariables', () => {
    it('returns ungrouped default data if no data in query client', () => {
      const queryClient = initQueryClient()

      const pageParamsQueryData = getPageParamsQueryDataForVariables(queryClient, {})
      const expectedPageParamsQueryData: PageParamsQueryData = {pageParams: [pageParamForInitialPage]}

      expect(pageParamsQueryData).toEqual(expectedPageParamsQueryData)
    })

    it('returns ungrouped data found in query client', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {}
      const expectedPageParamsQueryData: PageParamsQueryData = {
        pageParams: [pageParamForInitialPage, {after: 'firstPageEndCursor'}],
      }

      queryClient.setQueryData(buildPageParamsQueryKey(variables), expectedPageParamsQueryData)

      const pageParamsQueryData = getPageParamsQueryDataForVariables(queryClient, variables)

      expect(pageParamsQueryData).toEqual(expectedPageParamsQueryData)
    })

    it('returns grouped data found in query client', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {}
      const expectedPageParamsQueryData: PageParamsQueryData = {
        groupedItems: {group1: [pageParamForInitialPage]},
        pageParams: [pageParamForInitialPage, {after: 'firstPageEndCursor'}],
      }

      queryClient.setQueryData(buildPageParamsQueryKey(variables), expectedPageParamsQueryData)

      const pageParamsQueryData = getPageParamsQueryDataForVariables(queryClient, variables)

      expect(pageParamsQueryData).toEqual(expectedPageParamsQueryData)
    })
  })

  describe('setPageParamsQueryDataForVariables', () => {
    it('updates data in query client', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {}
      const expectedPageParamsQueryData: PageParamsQueryData = {
        pageParams: [pageParamForInitialPage, {after: 'firstPageEndCursor'}],
      }

      setPageParamsQueryDataForVariables(queryClient, variables, expectedPageParamsQueryData)

      const returnedPageParamsQueryData = queryClient.getQueryData(buildPageParamsQueryKey(variables))

      expect(returnedPageParamsQueryData).toEqual(expectedPageParamsQueryData)
    })
  })

  describe('invalidateInactiveInitialQueries', () => {
    it('removes inactive items queries except for initial page', () => {
      const queryClient = initQueryClient()
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue', horizontalGroupedByColumnId: 'Assignees'}
      const memexItemModels = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
      setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage, {
        groups: [{groupId: 'group1', groupValue: 'Group Name'}],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      })
      setGroupedItemsForPage(queryClient, variables, {groupId: 'group1'}, pageParamForInitialPage, [memexItemModels[0]])
      setGroupedItemsForPage(queryClient, variables, {groupId: 'group1'}, {after: 'cursor'}, [memexItemModels[1]])

      const queriesData = getItemsAndGroupsQueriesData(queryClient)
      expect(queriesData).toHaveLength(3) // 1 top-level groups page, 2 pages of items

      invalidateInactiveInitialQueries(queryClient)

      const newQueriesData = getItemsAndGroupsQueriesData(queryClient)
      expect(newQueriesData).toHaveLength(2) // 1 top-level groups page, 1 page of items
    })

    it('does not remove active queries', () => {
      const queryClient = initQueryClient()
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue'}
      const memexItemModels = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
      setAndActivateInitialQueriesByPage(queryClient, variables, [[memexItemModels[0]], [memexItemModels[1]]])

      const queriesData = getItemsAndGroupsQueriesData(queryClient)
      expect(queriesData).toHaveLength(2)

      invalidateInactiveInitialQueries(queryClient)

      const newQueriesData = getItemsAndGroupsQueriesData(queryClient)
      expect(newQueriesData).toHaveLength(2)
    })

    it('does not remove placeholder queries', () => {
      const queryClient = initQueryClient()
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue'}
      const memexItemModels = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
      setMemexItemsForPage(queryClient, variables, pageParamForInitialPage, [memexItemModels[0]])
      setMemexItemsForPage(queryClient, variables, {after: 'cursor'}, [memexItemModels[1]])
      setMemexItemsForPage(queryClient, variables, pageParamForNextPlaceholder, [memexItemModels[1]])
      setPageParamsQueryDataForVariables(queryClient, variables, {
        pageParams: [pageParamForInitialPage, pageParamForNextPlaceholder],
      })

      const queriesData = getItemsAndGroupsQueriesData(queryClient)
      expect(queriesData).toHaveLength(3) // 2 pages of items and a placeholder

      invalidateInactiveInitialQueries(queryClient)

      const newQueriesData = getItemsAndGroupsQueriesData(queryClient)
      expect(newQueriesData).toHaveLength(2) // 1 page of items and a placeholder
      expect(newQueriesData.map(q => q[0][3])).toContain(pageParamForNextPlaceholder)

      const pageParamsQuery = getPageParamsQueryDataForVariables(queryClient, variables)
      expect(pageParamsQuery).toEqual({pageParams: [pageParamForInitialPage, pageParamForNextPlaceholder]})
    })

    it('invalidates first page unless the query is a child of a top-level groups page', () => {
      const queryClient = initQueryClient()
      const groupedVariables: PaginatedMemexItemsQueryVariables = {
        q: 'is:issue',
        horizontalGroupedByColumnId: 'Assignees',
      }
      const ungroupedVariables = {q: 'hi'}
      const memexItemModels = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))

      setQueryDataForMemexGroupsPage(queryClient, groupedVariables, pageParamForInitialPage, {
        groups: [{groupId: 'group1', groupValue: 'Group Name'}],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      })
      setGroupedItemsForPage(queryClient, groupedVariables, {groupId: 'group1'}, pageParamForInitialPage, [
        memexItemModels[0],
      ])
      setGroupedItemsForPage(queryClient, groupedVariables, {groupId: 'group1'}, {after: 'cursor'}, [
        memexItemModels[1],
      ])
      setMemexItemsForPage(queryClient, ungroupedVariables, pageParamForInitialPage, [memexItemModels[0]])
      setMemexItemsForPage(queryClient, ungroupedVariables, {after: 'cursor'}, [memexItemModels[1]])
      setPageParamsQueryDataForVariables(queryClient, groupedVariables, {
        groupedItems: {group1: [pageParamForInitialPage, {after: 'cursor'}]},
        pageParams: [pageParamForInitialPage],
      })
      setPageParamsQueryDataForVariables(queryClient, ungroupedVariables, {
        pageParams: [pageParamForInitialPage, {after: 'cursor'}],
      })

      const queriesData = getItemsAndGroupsQueriesData(queryClient)
      // 1 top-level groups page, 2 pages of grouped items, 2 pages of ungrouped items
      expect(queriesData).toHaveLength(5)

      invalidateInactiveInitialQueries(queryClient)

      const newQueriesData = getItemsAndGroupsQueriesData(queryClient)
      // 1 top-level groups page, 1 page of grouped items, 1 page of ungrouped items
      expect(newQueriesData.length).toEqual(3)

      const staleQueriesData = queryClient.getQueriesData({
        queryKey: [paginatedMemexItemsQueryKey],
        stale: true,
      })
      // Two queries have been invalidated
      expect(staleQueriesData).toHaveLength(2)

      const freshQueriesData = queryClient.getQueriesData({
        queryKey: [paginatedMemexItemsQueryKey],
        stale: false,
        predicate: query => !isQueryForItemsMetadata(query),
      })
      expect(freshQueriesData).toHaveLength(1)
      const freshQueryKey = freshQueriesData[0][0]
      // First page of items for `group1` wasn't invalidated
      expect(freshQueryKey[2]).toEqual({groupId: 'group1'})
      expect(freshQueryKey[3]).toEqual(pageParamForInitialPage)

      const groupedPageParamsQueryData = getPageParamsQueryDataForVariables(queryClient, groupedVariables)
      const expectedGroupedPageParamsQueryData: GroupedPageParamsQueryData = {
        // Second pageParam for `group1` was removed
        groupedItems: {
          group1: [pageParamForInitialPage],
        },
        pageParams: [pageParamForInitialPage],
      }
      expect(groupedPageParamsQueryData).toEqual(expectedGroupedPageParamsQueryData)
      const ungroupedPageParamsQueryData = getPageParamsQueryDataForVariables(queryClient, ungroupedVariables)
      const expectedUngroupedPageParamsQueryData: UngroupedPageParamsQueryData = {
        // Second pageParam was removed
        pageParams: [pageParamForInitialPage],
      }
      expect(ungroupedPageParamsQueryData).toEqual(expectedUngroupedPageParamsQueryData)
    })

    it('removes inactive items and groups queries for groups not in the initial top-level view response', () => {
      const queryClient = initQueryClient()
      const variables: PaginatedMemexItemsQueryVariables = {q: 'is:issue', horizontalGroupedByColumnId: 'Assignees'}
      const memexItemModels = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
      setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage, {
        groups: [{groupId: 'group1', groupValue: 'Group 1'}],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      })
      setQueryDataForMemexGroupsPage(
        queryClient,
        variables,
        {after: 'cursor'},
        {
          groups: [{groupId: 'group2', groupValue: 'Group 2'}],
          pageInfo: {hasNextPage: false, hasPreviousPage: false},
        },
      )
      setGroupedItemsForPage(queryClient, variables, {groupId: 'group1'}, pageParamForInitialPage, [memexItemModels[0]])
      setGroupedItemsForPage(queryClient, variables, {groupId: 'group2'}, pageParamForInitialPage, [memexItemModels[1]])

      const queriesData = getItemsAndGroupsQueriesData(queryClient)
      expect(queriesData).toHaveLength(4) // 2 top-level groups pages, 2 pages of items

      invalidateInactiveInitialQueries(queryClient)

      const newQueriesData = getItemsAndGroupsQueriesData(queryClient)
      expect(newQueriesData).toHaveLength(2) // 1 top-level groups page, 1 page of items
    })

    describe('when a view is secondarily grouped', () => {
      it('removes non-initial page queries and invalidates the top-level initial page query', () => {
        seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
        const queryClient = initQueryClient()
        const variables = {q: 'is:issue', horizontalGroupBy: 'Assignee', verticalGroupBy: 'Status'}
        const memexItemModels: Array<MemexItemModel> = []
        const pageParamsQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
          pageParams: [],
          secondaryGroups: [],
          groupedItems: {},
          groupedItemBatches: [],
        }

        // 2 pages of groups
        setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage, {
          groups: [{groupId: 'status1Id', groupValue: 'Status 1'}],
          pageInfo: {hasNextPage: true, hasPreviousPage: false},
        })
        pageParamsQueryData.pageParams.push(pageParamForInitialPage)
        setQueryDataForMemexGroupsPage(
          queryClient,
          variables,
          {after: 'cursor'},
          {
            groups: [{groupId: 'status2Id', groupValue: 'Status 2'}],
            pageInfo: {hasNextPage: false, hasPreviousPage: true},
          },
        )
        pageParamsQueryData.pageParams.push({after: 'cursor'})
        // 2 pages of secondary groups
        setQueryDataForMemexSecondaryGroupsPage(queryClient, variables, pageParamForInitialPage, {
          groups: [{groupId: 'assignee1Id', groupValue: 'Assignee 1'}],
          pageInfo: {hasNextPage: true, hasPreviousPage: false},
        })
        pageParamsQueryData.secondaryGroups.push(pageParamForInitialPage)
        setQueryDataForMemexSecondaryGroupsPage(
          queryClient,
          variables,
          {after: 'secondaryCursor'},
          {
            groups: [{groupId: 'assignee2Id', groupValue: 'Assignee 2'}],
            pageInfo: {hasNextPage: false, hasPreviousPage: true},
          },
        )
        pageParamsQueryData.secondaryGroups.push({after: 'secondaryCursor'})
        // 2 pages of items for each groupedItems page type
        const groupedItemsPageTypes = [
          {groupId: 'status1Id', secondaryGroupId: 'assignee1Id'},
          {groupId: 'status2Id', secondaryGroupId: 'assignee1Id'},
          {groupId: 'status1Id', secondaryGroupId: 'assignee2Id'},
          {groupId: 'status2Id', secondaryGroupId: 'assignee2Id'},
        ]
        for (const pageType of groupedItemsPageTypes) {
          const item = createMemexItemModel(issueFactory.build())
          memexItemModels.push(item)
          setGroupedItemsForPage(queryClient, variables, pageType, pageParamForInitialPage, [item])
          const secondItem = createMemexItemModel(issueFactory.build())
          memexItemModels.push(secondItem)
          const pageParam = {after: item.id.toString()}
          setGroupedItemsForPage(queryClient, variables, pageType, pageParam, [secondItem])
          pageParamsQueryData.groupedItems[createGroupedItemsId(pageType)] = [pageParamForInitialPage, pageParam]
        }
        pageParamsQueryData.groupedItemBatches.push({after: 'cursor', secondaryAfter: 'secondaryCursor'})

        setPageParamsQueryDataForVariables(queryClient, variables, pageParamsQueryData)

        const queriesData = getItemsAndGroupsQueriesData(queryClient)
        expect(queriesData).toHaveLength(12) // 2 groups pages, 2 secondary groups pages, 8 grouped items pages

        invalidateInactiveInitialQueries(queryClient)

        const newQueriesData = getItemsAndGroupsQueriesData(queryClient)
        expect(newQueriesData).toHaveLength(3) // 1 groups page, 1 secondary groups page, 1 grouped items page
        const expectedQueryKeys = [
          [paginatedMemexItemsQueryKey, variables, pageTypeForGroups, pageParamForInitialPage],
          [paginatedMemexItemsQueryKey, variables, pageTypeForSecondaryGroups, pageParamForInitialPage],
          [
            paginatedMemexItemsQueryKey,
            variables,
            {groupId: 'status1Id', secondaryGroupId: 'assignee1Id'},
            pageParamForInitialPage,
          ],
        ]
        const newQueryKeys = newQueriesData.map(q => q[0])
        expect(newQueryKeys).toMatchObject(expectedQueryKeys)

        const staleQueriesData = queryClient.getQueriesData({
          queryKey: [paginatedMemexItemsQueryKey],
          stale: true,
        })
        expect(staleQueriesData).toHaveLength(1)
        const staleQueryKey = staleQueriesData[0][0]
        // Only the top-level groups page type is marked stale.
        // Refreshing this query will also refresh the initial page of secondary groups
        // and initial page of items for each group/secondary-group combination.
        expect(staleQueryKey).toMatchObject([
          paginatedMemexItemsQueryKey,
          variables,
          pageTypeForGroups,
          pageParamForInitialPage,
        ])
        const newPageParamsQueryData = getPageParamsQueryDataForVariables(queryClient, variables)
        const expectedPageParamsQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
          pageParams: [pageParamForInitialPage],
          secondaryGroups: [pageParamForInitialPage],
          groupedItems: {
            'status1Id:assignee1Id': [pageParamForInitialPage],
          },
          groupedItemBatches: [],
        }
        expect(newPageParamsQueryData).toEqual(expectedPageParamsQueryData)
      })
    })
  })
})
