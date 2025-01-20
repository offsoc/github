import {renderHook, waitFor} from '@testing-library/react'

import {SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import {
  buildGroupedItemBatchQueryKey,
  buildGroupedMemexItemsQueryKey,
  buildMemexGroupsQueryKey,
  buildMemexSecondaryGroupsQueryKey,
  buildUngroupedMemexItemsQueryKey,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import type {
  GroupedWithSecondaryGroupsPageParamsQueryData,
  PageParamsQueryData,
  PaginatedMemexItemsQueryVariables,
} from '../../../../client/state-providers/memex-items/queries/types'
import {pageParamForInitialPage} from '../../../../client/state-providers/memex-items/queries/types'
import {usePaginatedMemexItemsActiveQueries} from '../../../../client/state-providers/memex-items/queries/use-paginated-memex-items-active-queries'
import {setPageParamsQueryDataForVariables} from '../../../../client/state-providers/memex-items/query-client-api/page-params'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {stubGetPaginatedItems} from '../../../mocks/api/memex-items'
import {createColumnsStableContext} from '../../../mocks/state-providers/columns-stable-context'
import {createTestQueryClient} from '../../../test-app-wrapper'
import {createWrapperWithContexts} from '../../../wrapper-utils'

const mockUpdateLoadedColumns = jest.fn()
jest.mock('../../../../client/state-providers/columns/use-update-loaded-columns', () => ({
  useUpdateLoadedColumns: () => ({
    updateLoadedColumns: mockUpdateLoadedColumns,
  }),
}))

describe('usePaginatedMemexItemsActiveQueries', () => {
  it('reads from page params query data for ungrouped items', () => {
    const queryClient = createTestQueryClient()

    const variables: PaginatedMemexItemsQueryVariables = {}

    const activeQueryData: PageParamsQueryData = {
      pageParams: [pageParamForInitialPage, {after: 'firstPageEndCursor'}, {after: 'secondPageEndCursor'}],
    }

    setPageParamsQueryDataForVariables(queryClient, variables, activeQueryData)

    const {result} = renderHook(() => usePaginatedMemexItemsActiveQueries(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
        ColumnsStable: createColumnsStableContext(),
      }),
    })

    const {queries, queryKeys} = result.current
    const expectedQueryKeys = [
      buildUngroupedMemexItemsQueryKey(variables, pageParamForInitialPage),
      buildUngroupedMemexItemsQueryKey(variables, {after: 'firstPageEndCursor'}),
      buildUngroupedMemexItemsQueryKey(variables, {after: 'secondPageEndCursor'}),
    ]

    expect(queries).toHaveLength(3)
    expect(queryKeys).toEqual(expectedQueryKeys)
  })

  it('reads from page params query data for grouped items', () => {
    const queryClient = createTestQueryClient()

    const variables: PaginatedMemexItemsQueryVariables = {}

    const activeQueryData: PageParamsQueryData = {
      pageParams: [pageParamForInitialPage, {after: 'firstPageOfGroupsEndCursor'}],
      groupedItems: {Todo: [pageParamForInitialPage, {after: 'firstPageEndCursor'}], Done: [pageParamForInitialPage]},
    }

    setPageParamsQueryDataForVariables(queryClient, variables, activeQueryData)

    const {result} = renderHook(() => usePaginatedMemexItemsActiveQueries(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
        ColumnsStable: createColumnsStableContext(),
      }),
    })

    const {queries, queryKeys} = result.current
    const expectedQueryKeys = [
      buildGroupedMemexItemsQueryKey(variables, {groupId: 'Todo'}, pageParamForInitialPage),
      buildGroupedMemexItemsQueryKey(variables, {groupId: 'Todo'}, {after: 'firstPageEndCursor'}),
      buildGroupedMemexItemsQueryKey(variables, {groupId: 'Done'}, pageParamForInitialPage),
      buildMemexGroupsQueryKey(variables, pageParamForInitialPage),
      buildMemexGroupsQueryKey(variables, {after: 'firstPageOfGroupsEndCursor'}),
    ]

    expect(queries).toHaveLength(5)
    expect(queryKeys).toEqual(expectedQueryKeys)
  })

  it('reads from page params query data for grouped items with secondary groups', () => {
    const queryClient = createTestQueryClient()

    const variables: PaginatedMemexItemsQueryVariables = {}

    const activeQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
      pageParams: [pageParamForInitialPage, {after: 'firstPageOfGroupsEndCursor'}],
      groupedItems: {Todo: [pageParamForInitialPage, {after: 'firstPageEndCursor'}], Done: [pageParamForInitialPage]},
      secondaryGroups: [pageParamForInitialPage, {after: 'firstPageOfSecondaryGroupsEndCursor'}],
      groupedItemBatches: [],
    }

    setPageParamsQueryDataForVariables(queryClient, variables, activeQueryData)

    const {result} = renderHook(() => usePaginatedMemexItemsActiveQueries(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
        ColumnsStable: createColumnsStableContext(),
      }),
    })

    const {queries, queryKeys, groupedItemBatchesQueries, groupedItemBatchesQueryKeys} = result.current
    const expectedQueryKeys = [
      buildGroupedMemexItemsQueryKey(variables, {groupId: 'Todo'}, pageParamForInitialPage),
      buildGroupedMemexItemsQueryKey(variables, {groupId: 'Todo'}, {after: 'firstPageEndCursor'}),
      buildGroupedMemexItemsQueryKey(variables, {groupId: 'Done'}, pageParamForInitialPage),
      buildMemexGroupsQueryKey(variables, pageParamForInitialPage),
      buildMemexGroupsQueryKey(variables, {after: 'firstPageOfGroupsEndCursor'}),
      buildMemexSecondaryGroupsQueryKey(variables, pageParamForInitialPage),
      buildMemexSecondaryGroupsQueryKey(variables, {after: 'firstPageOfSecondaryGroupsEndCursor'}),
    ]

    expect(queries).toHaveLength(7)
    expect(queryKeys).toEqual(expectedQueryKeys)
    expect(groupedItemBatchesQueries).toHaveLength(0)
    expect(groupedItemBatchesQueryKeys).toEqual([])
  })

  it('reads from page params query data for grouped items with secondary groups and grouped item batches', () => {
    seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
    const queryClient = createTestQueryClient()

    const variables: PaginatedMemexItemsQueryVariables = {}

    const activeQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
      pageParams: [pageParamForInitialPage, {after: 'groupsCursor'}],
      secondaryGroups: [pageParamForInitialPage, {after: 'secondaryGroupsCursor'}],
      groupedItems: {'primary1:secondary1': [pageParamForInitialPage, {after: 'groupedItemsCursor'}]},
      groupedItemBatches: [{after: 'groupsCursor', secondaryAfter: 'secondaryGroupsCursor'}],
    }

    setPageParamsQueryDataForVariables(queryClient, variables, activeQueryData)

    const {result} = renderHook(() => usePaginatedMemexItemsActiveQueries(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
        ColumnsStable: createColumnsStableContext(),
      }),
    })

    const {queries, queryKeys, groupedItemBatchesQueries, groupedItemBatchesQueryKeys} = result.current
    const expectedQueryKeys = [
      buildGroupedMemexItemsQueryKey(
        variables,
        {groupId: 'primary1', secondaryGroupId: 'secondary1'},
        pageParamForInitialPage,
      ),
      buildGroupedMemexItemsQueryKey(
        variables,
        {groupId: 'primary1', secondaryGroupId: 'secondary1'},
        {after: 'groupedItemsCursor'},
      ),
      buildMemexGroupsQueryKey(variables, pageParamForInitialPage),
      buildMemexGroupsQueryKey(variables, {after: 'groupsCursor'}),
      buildMemexSecondaryGroupsQueryKey(variables, pageParamForInitialPage),
      buildMemexSecondaryGroupsQueryKey(variables, {after: 'secondaryGroupsCursor'}),
    ]

    const expectedGroupedItemBatchesQueryKeys = [
      buildGroupedItemBatchQueryKey(variables, {after: 'groupsCursor', secondaryAfter: 'secondaryGroupsCursor'}),
    ]

    expect(queries).toHaveLength(6)
    expect(queryKeys).toEqual(expectedQueryKeys)
    expect(groupedItemBatchesQueries).toHaveLength(1)
    expect(groupedItemBatchesQueryKeys).toEqual(expectedGroupedItemBatchesQueryKeys)
  })

  it('initializes grouped page params query data for a grouped view', () => {
    const queryClient = createTestQueryClient()

    // Seed pageParams query data for an initial ungrouped view read from the JSON island
    const activeQueryData: PageParamsQueryData = {pageParams: [pageParamForInitialPage]}
    const initialUngroupedVariables = {q: 'is:pr'}
    setPageParamsQueryDataForVariables(queryClient, initialUngroupedVariables, activeQueryData)

    // Switch to a new view grouped view.
    // The client can determine whether a view is grouped by the presence of
    // `horizontalGroupedByColumnId` or `verticalGroupedByColumnId` in the variables.
    const newGroupedVariables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}

    const {result} = renderHook(() => usePaginatedMemexItemsActiveQueries(newGroupedVariables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
        ColumnsStable: createColumnsStableContext(),
      }),
    })

    // If the view is grouped, we expect a query key with a grouped pageType
    const {queries, queryKeys} = result.current
    const expectedQueryKeys = [buildMemexGroupsQueryKey(newGroupedVariables, pageParamForInitialPage)]

    expect(queries).toHaveLength(1)
    expect(queryKeys).toEqual(expectedQueryKeys)
  })

  it('marks fieldIds as loaded when response is received', async () => {
    const items = [issueFactory.build()]
    const mockRequest = stubGetPaginatedItems({
      nodes: items,
      pageInfo: {
        startCursor: 'fake-start',
        endCursor: 'fake-end',
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: {
        value: items.length,
        isApproximate: false,
      },
    })
    const queryClient = createTestQueryClient()

    // Some variables with fieldIds
    const variables = {q: 'is:pr', fieldIds: [10, 20, 30, SystemColumnId.Status]}
    setPageParamsQueryDataForVariables(queryClient, variables, {pageParams: [pageParamForInitialPage]})

    renderHook(() => usePaginatedMemexItemsActiveQueries(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
        ColumnsStable: createColumnsStableContext({
          loadedFieldIdsRef: {current: new Set([SystemColumnId.Status])},
        }),
      }),
    })
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    expect(variables.fieldIds).toHaveLength(4)
    // One less than fieldIds because SystemColumnId.Status is already loaded
    expect(mockUpdateLoadedColumns).toHaveBeenCalledTimes(3)
  })
})
