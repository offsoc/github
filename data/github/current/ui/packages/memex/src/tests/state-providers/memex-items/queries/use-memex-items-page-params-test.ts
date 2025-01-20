import {renderHook} from '@testing-library/react'

import {
  isPageParamsDataGrouped,
  isPageParamsDataGroupedWithSecondaryGroups,
} from '../../../../client/state-providers/memex-items/queries/query-data-helpers'
import {
  buildGroupedMemexItemsQueryKey,
  buildMemexGroupsQueryKey,
  buildMemexSecondaryGroupsQueryKey,
  buildPageParamsQueryKey,
  buildSliceDataQueryKey,
  buildUngroupedMemexItemsQueryKey,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import type {
  GroupedWithSecondaryGroupsPageParamsQueryData,
  MemexGroupsPageQueryData,
  MemexItemsPageQueryData,
  PageParam,
  PageParamsQueryData,
  PaginatedMemexItemsQueryVariables,
  SliceByQueryData,
  SliceByQueryVariables,
} from '../../../../client/state-providers/memex-items/queries/types'
import {pageParamForInitialPage} from '../../../../client/state-providers/memex-items/queries/types'
import {useMemexItemsPageParams} from '../../../../client/state-providers/memex-items/queries/use-memex-items-page-params'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {buildSystemColumns} from '../../../factories/columns/system-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {createTestQueryClient} from '../../../test-app-wrapper'
import {createWrapperWithContexts} from '../../../wrapper-utils'
import {buildGroupedItemsResponse, buildGroupedItemsResponseWithSecondaryGroups} from '../query-client-api/helpers'

describe(`useMemexItemsPageParams`, () => {
  it('exposes getter and setter for page params query data', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]

    seedJSONIsland('memex-paginated-items-data', {
      nodes: issues,
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {value: issues.length, isApproximate: false},
    })

    const variables: PaginatedMemexItemsQueryVariables = {}

    const {result} = renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const initialPageParamsQueryData = queryClient.getQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables))
    expect(result.current.pageParamsQueryData).toEqual(initialPageParamsQueryData)
    const returnedPageParamsQueryData = result.current.getPageParamsQueryData()
    expect(initialPageParamsQueryData).toEqual(returnedPageParamsQueryData)

    const newPageParamsQueryData: PageParamsQueryData = {
      pageParams: [pageParamForInitialPage, {after: 'firstPageEndCursor'}, {after: 'secondPageEndCursor'}],
    }

    result.current.setPageParamsQueryData(newPageParamsQueryData)

    const returnedNewPageParamsQueryData = result.current.getPageParamsQueryData()
    expect(newPageParamsQueryData).toEqual(returnedNewPageParamsQueryData)
  })

  it('initializes page params query data and page data for ungrouped items', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]

    seedJSONIsland('memex-paginated-items-data', {
      nodes: issues,
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {value: issues.length, isApproximate: false},
    })

    const variables: PaginatedMemexItemsQueryVariables = {}

    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryData = queryClient.getQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables))
    expectPageParamsAreEqual(pageParamsQueryData?.pageParams, [pageParamForInitialPage])

    const queryDataForFirstPage = queryClient.getQueryData<MemexItemsPageQueryData>(
      buildUngroupedMemexItemsQueryKey(variables, pageParamForInitialPage),
    )
    expect(queryDataForFirstPage?.nodes.length).toEqual(2)
    expect(queryDataForFirstPage?.nodes[0].id).toEqual(issues[0].id)
    expect(queryDataForFirstPage?.nodes[1].id).toEqual(issues[1].id)
  })

  it('initializes page params query data and page data for grouped items', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponse({
        groups: [
          {
            groupId: 'group1',
            items: [issues[0]],
          },
          {
            groupId: 'group2',
            items: [issues[1]],
          },
        ],
        pageInfoForGroups: {hasNextPage: true, hasPreviousPage: false},
      }),
    )

    const variables: PaginatedMemexItemsQueryVariables = {}

    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryData = queryClient.getQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables))
    const expectedPageParamsQueryData: PageParamsQueryData = {
      groupedItems: {group1: [pageParamForInitialPage], group2: [pageParamForInitialPage]},
      pageParams: [pageParamForInitialPage],
    }
    expect(pageParamsQueryData).toEqual(expectedPageParamsQueryData)

    const queryDataForFirstPageOfFirstGroup = queryClient.getQueryData<MemexItemsPageQueryData>(
      buildGroupedMemexItemsQueryKey(variables, {groupId: 'group1'}, pageParamForInitialPage),
    )
    expect(queryDataForFirstPageOfFirstGroup?.nodes.length).toEqual(1)
    expect(queryDataForFirstPageOfFirstGroup?.nodes[0].id).toEqual(issues[0].id)

    const queryDataForFirstPageOfSecondGroup = queryClient.getQueryData<MemexItemsPageQueryData>(
      buildGroupedMemexItemsQueryKey(variables, {groupId: 'group2'}, pageParamForInitialPage),
    )
    expect(queryDataForFirstPageOfSecondGroup?.nodes.length).toEqual(1)
    expect(queryDataForFirstPageOfSecondGroup?.nodes[0].id).toEqual(issues[1].id)

    const queryDataForFirstPageOfGroupsData = queryClient.getQueryData<MemexGroupsPageQueryData>(
      buildMemexGroupsQueryKey(variables, pageParamForInitialPage),
    )

    expect(queryDataForFirstPageOfGroupsData?.groups.length).toEqual(2)
    expect(queryDataForFirstPageOfGroupsData?.groups[0].groupId).toEqual('group1')
    expect(queryDataForFirstPageOfGroupsData?.groups[1].groupId).toEqual('group2')
    expect(queryDataForFirstPageOfGroupsData?.pageInfo.hasNextPage).toBeTruthy()
  })

  it('initializes page params query data and page data for secondary groups', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            groupId: 'group1',
            nestedItems: [{secondaryGroupId: 'secondaryGroup1', items: [issues[0]]}],
          },
          {
            groupId: 'group2',
            nestedItems: [{secondaryGroupId: 'secondaryGroup2', items: [issues[1]]}],
          },
        ],
        secondaryGroups: [
          {
            groupId: 'secondaryGroup1',
          },
          {
            groupId: 'secondaryGroup2',
          },
        ],
        pageInfoForGroups: {hasNextPage: true, hasPreviousPage: false},
      }),
    )

    const variables: PaginatedMemexItemsQueryVariables = {}

    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryData = queryClient.getQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables))
    const expectedPageParamsQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
      groupedItems: {
        'group1:secondaryGroup1': [pageParamForInitialPage],
        'group2:secondaryGroup2': [pageParamForInitialPage],
      },
      pageParams: [pageParamForInitialPage],
      secondaryGroups: [pageParamForInitialPage],
      groupedItemBatches: [],
    }
    expect(pageParamsQueryData).toEqual(expectedPageParamsQueryData)

    const queryDataForFirstPageOfFirstGroup = queryClient.getQueryData<MemexItemsPageQueryData>(
      buildGroupedMemexItemsQueryKey(
        variables,
        {groupId: 'group1', secondaryGroupId: 'secondaryGroup1'},
        pageParamForInitialPage,
      ),
    )
    expect(queryDataForFirstPageOfFirstGroup?.nodes.length).toEqual(1)
    expect(queryDataForFirstPageOfFirstGroup?.nodes[0].id).toEqual(issues[0].id)

    const queryDataForFirstPageOfSecondGroup = queryClient.getQueryData<MemexItemsPageQueryData>(
      buildGroupedMemexItemsQueryKey(
        variables,
        {groupId: 'group2', secondaryGroupId: 'secondaryGroup2'},
        pageParamForInitialPage,
      ),
    )
    expect(queryDataForFirstPageOfSecondGroup?.nodes.length).toEqual(1)
    expect(queryDataForFirstPageOfSecondGroup?.nodes[0].id).toEqual(issues[1].id)

    const queryDataForFirstPageOfGroups = queryClient.getQueryData<MemexGroupsPageQueryData>(
      buildMemexGroupsQueryKey(variables, pageParamForInitialPage),
    )

    expect(queryDataForFirstPageOfGroups?.groups.length).toEqual(2)
    expect(queryDataForFirstPageOfGroups?.groups[0].groupId).toEqual('group1')
    expect(queryDataForFirstPageOfGroups?.groups[1].groupId).toEqual('group2')
    expect(queryDataForFirstPageOfGroups?.pageInfo.hasNextPage).toBeTruthy()

    const queryDataForFirstPageOfSecondaryGroups = queryClient.getQueryData<MemexGroupsPageQueryData>(
      buildMemexSecondaryGroupsQueryKey(variables, pageParamForInitialPage),
    )

    expect(queryDataForFirstPageOfSecondaryGroups?.groups.length).toEqual(2)
    expect(queryDataForFirstPageOfSecondaryGroups?.groups[0].groupId).toEqual('secondaryGroup1')
    expect(queryDataForFirstPageOfSecondaryGroups?.groups[1].groupId).toEqual('secondaryGroup2')
    expect(queryDataForFirstPageOfSecondaryGroups?.pageInfo.hasNextPage).toBeFalsy()
  })

  it('initializes page params query data and page data for ungrouped data with no items', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-columns-data', buildSystemColumns())
    seedJSONIsland('memex-paginated-items-data', {
      nodes: [],
      pageInfo: {hasNextPage: false, hasPreviousPage: false},
      totalCount: {value: 0, isApproximate: false},
    })

    const variables: PaginatedMemexItemsQueryVariables = {}

    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const queryDataForFirstPage = queryClient.getQueryData<MemexItemsPageQueryData>(
      buildUngroupedMemexItemsQueryKey(variables, pageParamForInitialPage),
    )
    expect(queryDataForFirstPage?.nodes.length).toEqual(0)
  })

  it('initializes page params query data and page data for grouped data with no items', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-columns-data', buildSystemColumns())
    seedJSONIsland('memex-paginated-items-data', buildGroupedItemsResponse({groups: []}))

    const variables: PaginatedMemexItemsQueryVariables = {}

    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const queryDataForFirstPageOfFirstGroup = queryClient.getQueryData<MemexGroupsPageQueryData>(
      buildMemexGroupsQueryKey(variables, pageParamForInitialPage),
    )
    expect(queryDataForFirstPageOfFirstGroup?.groups.length).toEqual(0)
  })

  it('when variables change the initial data for the new query has an element in pageParams', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]

    seedJSONIsland('memex-paginated-items-data', {
      nodes: issues,
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {value: issues.length, isApproximate: false},
    })

    const variables: PaginatedMemexItemsQueryVariables = {}
    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryData = queryClient.getQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables))
    expectPageParamsAreEqual(pageParamsQueryData?.pageParams, [pageParamForInitialPage])

    // Call the hook again, but with a new set of variables
    const newVariables: PaginatedMemexItemsQueryVariables = {q: 'Status:Todo'}

    renderHook(() => useMemexItemsPageParams(newVariables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryDataForNewVariables = queryClient.getQueryData<PageParamsQueryData>(
      buildPageParamsQueryKey(newVariables),
    )

    expectPageParamsAreEqual(pageParamsQueryDataForNewVariables?.pageParams, [pageParamForInitialPage])
  })

  it('when variables change with grouping applied, the data we create is grouped', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]

    seedJSONIsland('memex-paginated-items-data', {
      nodes: issues,
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {value: issues.length, isApproximate: false},
    })

    const variables: PaginatedMemexItemsQueryVariables = {}
    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryData = queryClient.getQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables))
    expectPageParamsAreEqual(pageParamsQueryData?.pageParams, [pageParamForInitialPage])

    // Call the hook again, but with a new set of variables
    const newVariables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}

    renderHook(() => useMemexItemsPageParams(newVariables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryDataForNewVariables = queryClient.getQueryData<PageParamsQueryData>(
      buildPageParamsQueryKey(newVariables),
    )

    if (!pageParamsQueryDataForNewVariables || !isPageParamsDataGrouped(pageParamsQueryDataForNewVariables)) {
      throw Error('Expected groups to be in new page params')
    }

    expect(pageParamsQueryDataForNewVariables.groupedItems).toEqual({})
    expectPageParamsAreEqual(pageParamsQueryDataForNewVariables.pageParams, [pageParamForInitialPage])
  })

  it('when variables change with grouping applied in two directions, the data we create has secondary groups', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]

    seedJSONIsland('memex-paginated-items-data', {
      nodes: issues,
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {value: issues.length, isApproximate: false},
    })

    const variables: PaginatedMemexItemsQueryVariables = {}
    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryData = queryClient.getQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables))
    expectPageParamsAreEqual(pageParamsQueryData?.pageParams, [pageParamForInitialPage])

    // Call the hook again, but with a new set of variables, grouped in two directions
    const newVariables: PaginatedMemexItemsQueryVariables = {
      horizontalGroupedByColumnId: 'Status',
      verticalGroupedByColumnId: 'Assignees',
    }

    renderHook(() => useMemexItemsPageParams(newVariables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const pageParamsQueryDataForNewVariables = queryClient.getQueryData<PageParamsQueryData>(
      buildPageParamsQueryKey(newVariables),
    )

    if (
      !pageParamsQueryDataForNewVariables ||
      !isPageParamsDataGroupedWithSecondaryGroups(pageParamsQueryDataForNewVariables)
    ) {
      throw Error('Expected groups and secondary groups to be in new page params')
    }

    expect(pageParamsQueryDataForNewVariables.groupedItems).toEqual({})
    expectPageParamsAreEqual(pageParamsQueryDataForNewVariables.pageParams, [pageParamForInitialPage])
    expectPageParamsAreEqual(pageParamsQueryDataForNewVariables.secondaryGroups, [])
    expectPageParamsAreEqual(pageParamsQueryDataForNewVariables.groupedItemBatches, [])
  })

  it('loads slices data into sliceByData query', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]

    seedJSONIsland('memex-paginated-items-data', {
      nodes: issues,
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {value: issues.length, isApproximate: false},
      slices: [
        {
          sliceId: 'sliceId1',
          sliceValue: 'sliceValue1',
          totalCount: {value: 100, isApproximate: false},
        },
      ],
    })

    const variables: SliceByQueryVariables = {}

    const initialSliceByData = queryClient.getQueryData<SliceByQueryData>(buildSliceDataQueryKey(variables))
    expect(initialSliceByData).not.toBeDefined()

    renderHook(() => useMemexItemsPageParams(variables), {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    const newSliceByData = queryClient.getQueryData<SliceByQueryData>(buildSliceDataQueryKey(variables))
    expect(newSliceByData?.slices).toHaveLength(1)
  })
})

/**
 * We use this helper to wrap the assertion in a `JSON.stringify` when comparing the two arrays.
 * A simple expect(val1).toEqual(val2), doesn't work because we want the assertion to fail
 * when comparing `[]` to `[undefined]`, however it does not.
 * @param val1
 * @param val2
 */
function expectPageParamsAreEqual(val1: Array<PageParam> | undefined, val2: Array<PageParam> | undefined) {
  expect(JSON.stringify(val1)).toEqual(JSON.stringify(val2))
}
