import {renderHook} from '@testing-library/react'

import type {
  PageInfo,
  PaginatedGroupsAndSecondaryGroupsResponse,
  PaginatedGroupsResponse,
} from '../../../../../client/api/memex-items/paginated-views'
import {createGroupedItemsId} from '../../../../../client/state-providers/memex-items/queries/query-keys'
import {
  type GroupedPageParamsQueryData,
  type GroupedWithSecondaryGroupsPageParamsQueryData,
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PaginatedMemexItemsQueryVariables,
} from '../../../../../client/state-providers/memex-items/queries/types'
import {
  skipFieldIdsPlaceholder,
  useNextPlaceholderQuery,
} from '../../../../../client/state-providers/memex-items/queries/use-next-placeholder-query'
import {
  getQueryDataForMemexGroupsPage,
  getQueryDataForMemexSecondaryGroupsPage,
  setQueryDataForMemexGroupsPage,
  setQueryDataForMemexSecondaryGroupsPage,
} from '../../../../../client/state-providers/memex-items/query-client-api/memex-groups'
import {
  getQueryDataForGroupedItemsPage,
  getQueryDataForMemexItemsPage,
} from '../../../../../client/state-providers/memex-items/query-client-api/memex-items'
import {
  getPageParamsQueryDataForVariables,
  setPageParamsQueryDataForVariables,
} from '../../../../../client/state-providers/memex-items/query-client-api/page-params'
import {seedJSONIsland} from '../../../../../mocks/server/mock-server'
import {buildSystemColumns} from '../../../../factories/columns/system-column-factory'
import {issueFactory} from '../../../../factories/memex-items/issue-factory'
import {createMemexItemModel} from '../../../../mocks/models/memex-item-model'
import {createTestQueryClient} from '../../../../test-app-wrapper'
import {createWrapperWithContexts} from '../../../../wrapper-utils'
import {setGroupedItemsForPage, setMemexItemsForPage} from '../../query-client-api/helpers'

describe('useNextPlaceholderQuery', () => {
  describe('setQueryDataForNextPlaceholder', () => {
    describe('when sourceFieldIds are provided and memex_mwl_limited_field_ids is enabled', () => {
      it('sets up a flat placeholder query without changing the source query', () => {
        seedJSONIsland('memex-enabled-features', ['memex_mwl_limited_field_ids'])
        seedJSONIsland('memex-columns-data', buildSystemColumns())
        const issues = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
        const queryClient = createTestQueryClient()
        const newVariables = {q: 'is:issue', fieldIds: [10, 20, 30]}
        const sourceVariables = {q: 'is:issue', fieldIds: [10, 20]}
        setPageParamsQueryDataForVariables(queryClient, sourceVariables, {
          pageParams: [pageParamForInitialPage, {after: 'cursor'}],
        })
        setMemexItemsForPage(queryClient, sourceVariables, pageParamForInitialPage, [issues[0]])
        setMemexItemsForPage(queryClient, sourceVariables, {after: 'cursor'}, [issues[1]])
        const {result} = renderHook(() => useNextPlaceholderQuery(newVariables, sourceVariables.fieldIds), {
          wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
        })
        result.current.setUpNextPlaceholderQueries()
        const placeholderQueryData = getQueryDataForMemexItemsPage(
          queryClient,
          newVariables,
          pageParamForNextPlaceholder,
        )
        expect(placeholderQueryData?.nodes).toMatchObject(issues)
        const sourcePage1 = getQueryDataForMemexItemsPage(queryClient, sourceVariables, pageParamForInitialPage)
        const sourcePage2 = getQueryDataForMemexItemsPage(queryClient, sourceVariables, {after: 'cursor'})
        expect(sourcePage1?.nodes).toMatchObject([issues[0]])
        expect(sourcePage2?.nodes).toMatchObject([issues[1]])
      })
      it('sets up grouped placeholder queries', () => {
        seedJSONIsland('memex-enabled-features', ['memex_mwl_limited_field_ids'])
        seedJSONIsland('memex-columns-data', buildSystemColumns())
        const issues = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
        const queryClient = createTestQueryClient()
        const newVariables = {groupedByColumnId: 'Status', q: 'is:issue', fieldIds: [10, 20, 30]}
        const sourceVariables = {groupedByColumnId: 'Status', q: 'is:issue', fieldIds: [10, 20]}
        setPageParamsQueryDataForVariables(queryClient, sourceVariables, {
          pageParams: [pageParamForInitialPage, {after: 'cursor'}],
          groupedItems: {group1: [pageParamForInitialPage], group2: [pageParamForInitialPage]},
        })
        setGroupedItemsForPage(queryClient, sourceVariables, {groupId: 'group1'}, pageParamForInitialPage, [issues[0]])
        setGroupedItemsForPage(queryClient, sourceVariables, {groupId: 'group2'}, pageParamForInitialPage, [issues[1]])
        const groups = [
          {groupId: 'group1', groupValue: 'Group 1'},
          {groupId: 'group2', groupValue: 'Group 2'},
        ]
        setQueryDataForMemexGroupsPage(queryClient, sourceVariables, pageParamForInitialPage, {
          groups: [groups[0]],
          pageInfo: {hasNextPage: true, hasPreviousPage: false},
        })
        setQueryDataForMemexGroupsPage(
          queryClient,
          sourceVariables,
          {after: 'cursor'},
          {
            groups: [groups[1]],
            pageInfo: {hasNextPage: false, hasPreviousPage: true},
          },
        )
        const {result} = renderHook(() => useNextPlaceholderQuery(newVariables, sourceVariables.fieldIds), {
          wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
        })
        result.current.setUpNextPlaceholderQueries()
        const groupsPlaceholderQueryData = getQueryDataForMemexGroupsPage(
          queryClient,
          newVariables,
          pageParamForNextPlaceholder,
        )
        expect(groupsPlaceholderQueryData?.groups).toMatchObject(groups)
        const groupedItems1 = getQueryDataForGroupedItemsPage(
          queryClient,
          newVariables,
          {groupId: 'group1'},
          pageParamForNextPlaceholder,
        )
        const groupedItems2 = getQueryDataForGroupedItemsPage(
          queryClient,
          newVariables,
          {groupId: 'group2'},
          pageParamForNextPlaceholder,
        )
        expect(groupedItems1?.nodes).toMatchObject([issues[0]])
        expect(groupedItems2?.nodes).toMatchObject([issues[1]])
      })
      it('sets up a secondary groups placeholder query if necessary', () => {
        seedJSONIsland('memex-enabled-features', ['memex_mwl_limited_field_ids', 'memex_mwl_swimlanes'])
        seedJSONIsland('memex-columns-data', buildSystemColumns())

        const newVariables: PaginatedMemexItemsQueryVariables = {
          verticalGroupedByColumnId: 'Status',
          horizontalGroupedByColumnId: 'Assignees',
          q: 'is:issue',
          fieldIds: [10, 20, 30],
        }
        const sourceVariables = {...newVariables, fieldIds: [10, 20]}

        // Setup some source data in the query cache
        const issues = [createMemexItemModel(issueFactory.build())]
        const queryClient = createTestQueryClient()
        const groupedItemsPageType = {groupId: 'group1', secondaryGroupId: 'secondaryGroup1'}
        const groupedItemsId = createGroupedItemsId(groupedItemsPageType)
        const pageParamsQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
          pageParams: [pageParamForInitialPage],
          groupedItems: {[groupedItemsId]: [pageParamForInitialPage]},
          secondaryGroups: [pageParamForInitialPage],
          groupedItemBatches: [],
        }
        setPageParamsQueryDataForVariables(queryClient, sourceVariables, pageParamsQueryData)
        setGroupedItemsForPage(queryClient, sourceVariables, groupedItemsPageType, pageParamForInitialPage, issues)
        const groups = [{groupId: 'group1', groupValue: 'Group 1'}]
        const secondaryGroups = [{groupId: 'secondaryGroup1', groupValue: 'Secondary Group 1'}]
        setQueryDataForMemexGroupsPage(queryClient, sourceVariables, pageParamForInitialPage, {
          groups,
          pageInfo: {hasNextPage: true, hasPreviousPage: false},
        })
        setQueryDataForMemexSecondaryGroupsPage(queryClient, sourceVariables, pageParamForInitialPage, {
          groups: secondaryGroups,
          pageInfo: {hasNextPage: true, hasPreviousPage: false},
        })

        const {result} = renderHook(() => useNextPlaceholderQuery(newVariables, sourceVariables.fieldIds), {
          wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
        })
        result.current.setUpNextPlaceholderQueries()

        const groupsPlaceholderQueryData = getQueryDataForMemexGroupsPage(
          queryClient,
          newVariables,
          pageParamForNextPlaceholder,
        )
        const secondaryGroupsPlaceholderQueryData = getQueryDataForMemexSecondaryGroupsPage(
          queryClient,
          newVariables,
          pageParamForNextPlaceholder,
        )
        const groupedItems = getQueryDataForGroupedItemsPage(
          queryClient,
          newVariables,
          groupedItemsPageType,
          pageParamForNextPlaceholder,
        )

        expect(groupsPlaceholderQueryData?.groups).toMatchObject(groups)
        expect(secondaryGroupsPlaceholderQueryData?.groups).toMatchObject(secondaryGroups)
        expect(groupedItems?.nodes).toMatchObject(issues)
      })
    })
    describe('when memex_mwl_limited_field_ids is not enabled', () => {
      it('ignores sourceFieldIds', () => {
        seedJSONIsland('memex-columns-data', buildSystemColumns())
        const issues = [issueFactory.build(), issueFactory.build()].map(i => createMemexItemModel(i))
        const queryClient = createTestQueryClient()
        const newVariables = {q: 'is:issue', fieldIds: [10, 20, 30]}
        const sourceVariables = {q: 'is:issue', fieldIds: [10, 20]}
        setPageParamsQueryDataForVariables(queryClient, sourceVariables, {
          pageParams: [pageParamForInitialPage, {after: 'cursor'}],
        })
        setMemexItemsForPage(queryClient, sourceVariables, pageParamForInitialPage, [issues[0]])
        setMemexItemsForPage(queryClient, sourceVariables, {after: 'cursor'}, [issues[1]])
        const {result} = renderHook(() => useNextPlaceholderQuery(newVariables, sourceVariables.fieldIds), {
          wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
        })
        result.current.setUpNextPlaceholderQueries()
        const placeholderQueryData = getQueryDataForMemexItemsPage(
          queryClient,
          newVariables,
          pageParamForNextPlaceholder,
        )
        expect(placeholderQueryData?.nodes).toHaveLength(0)
      })
    })
  })
  describe('skipFieldIdsPlaceholder', () => {
    it('returns true if data for the new variables already exists in the cache', () => {
      const queryClient = createTestQueryClient()
      const newVariables = {q: 'is:issue', fieldIds: [10, 20, 30]}
      const sourceVariables = {q: 'is:issue', fieldIds: [10, 20]}
      setMemexItemsForPage(queryClient, newVariables, pageParamForInitialPage, [
        createMemexItemModel(issueFactory.build()),
      ])
      setPageParamsQueryDataForVariables(queryClient, newVariables, {pageParams: [pageParamForInitialPage]})
      // Source variables have same number of pages of data, so we don't need a placeholder
      setPageParamsQueryDataForVariables(queryClient, sourceVariables, {pageParams: [pageParamForInitialPage]})
      expect(skipFieldIdsPlaceholder(queryClient, newVariables, sourceVariables)).toBe(true)
    })
    it("returns false if there's no data for new variables in the cache", () => {
      const queryClient = createTestQueryClient()
      const newVariables = {q: 'is:issue', fieldIds: [10, 20, 30]}
      const sourceVariables = {q: 'is:issue', fieldIds: [10, 20]}
      setPageParamsQueryDataForVariables(queryClient, sourceVariables, {pageParams: [pageParamForInitialPage]})
      expect(skipFieldIdsPlaceholder(queryClient, newVariables, sourceVariables)).toBe(false)
    })
    it('returns false if there not enough data for new variables in the cache', () => {
      const queryClient = createTestQueryClient()
      const newVariables = {q: 'is:issue', fieldIds: [10, 20, 30]}
      const sourceVariables = {q: 'is:issue', fieldIds: [10, 20]}
      setPageParamsQueryDataForVariables(queryClient, newVariables, {pageParams: [pageParamForInitialPage]})
      // Source variables have more pages of data, so we should use a placeholder
      setPageParamsQueryDataForVariables(queryClient, sourceVariables, {
        pageParams: [pageParamForInitialPage, {after: 'cursor'}],
      })
      expect(skipFieldIdsPlaceholder(queryClient, newVariables, sourceVariables)).toBe(false)
    })
  })
  describe('updateMemexGroupsNextPlaceholderQuery', () => {
    const queryClient = createTestQueryClient()
    const variables: PaginatedMemexItemsQueryVariables = {
      verticalGroupedByColumnId: 'Status',
      q: 'is:issue',
    }
    const swimlaneVariables: PaginatedMemexItemsQueryVariables = {
      ...variables,
      horizontalGroupedByColumnId: 'Assignees',
    }
    it('updates the placeholder page params for groups', () => {
      const originalPageParams: GroupedPageParamsQueryData = {
        pageParams: [pageParamForInitialPage, pageParamForNextPlaceholder],
        groupedItems: {page1Group: [pageParamForNextPlaceholder]},
      }
      setPageParamsQueryDataForVariables(queryClient, variables, originalPageParams)
      const groupsResponse = buildResponse(false)
      const {result} = renderHook(() => useNextPlaceholderQuery(variables, undefined), {
        wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
      })
      result.current.updateMemexGroupsNextPlaceholderQuery(groupsResponse)
      const updatedPageParams = getPageParamsQueryDataForVariables(queryClient, variables)
      // Cleared placeholder page params
      expect(updatedPageParams).toMatchObject({
        pageParams: [pageParamForInitialPage],
        groupedItems: {page1Group: [pageParamForInitialPage]},
      })
    })
    it('updates the placeholder page params for secondary groups', () => {
      seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
      const originalPageParams: GroupedWithSecondaryGroupsPageParamsQueryData = {
        pageParams: [pageParamForInitialPage, pageParamForNextPlaceholder],
        secondaryGroups: [pageParamForNextPlaceholder],
        groupedItems: {['page1Group:page1SecondaryGroup']: [pageParamForNextPlaceholder]},
        groupedItemBatches: [],
      }
      setPageParamsQueryDataForVariables(queryClient, swimlaneVariables, originalPageParams)
      const groupsResponse = buildResponse(false, false)
      const {result} = renderHook(() => useNextPlaceholderQuery(swimlaneVariables, undefined), {
        wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
      })
      result.current.updateMemexGroupsNextPlaceholderQuery(groupsResponse)
      const updatedPageParams = getPageParamsQueryDataForVariables(queryClient, swimlaneVariables)
      // Cleared placeholder page params
      expect(updatedPageParams).toMatchObject({
        pageParams: [pageParamForInitialPage],
        secondaryGroups: [pageParamForInitialPage],
        groupedItems: {['page1Group:page1SecondaryGroup']: [pageParamForInitialPage]},
        groupedItemBatches: [],
      })
    })
    it('does not update pageParams for groups or existing groupedItems when paginating secondary groups', () => {
      seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
      const originalPageParams: GroupedWithSecondaryGroupsPageParamsQueryData = {
        pageParams: [pageParamForInitialPage, {after: 'primaryCursor'}, pageParamForNextPlaceholder],
        secondaryGroups: [pageParamForInitialPage, {after: 'secondaryCursor'}, pageParamForNextPlaceholder],
        groupedItems: {
          'page1Group:page1SecondaryGroup': [
            pageParamForInitialPage,
            {after: 'groupedItemsCursor'},
            pageParamForNextPlaceholder,
          ],
        },
        groupedItemBatches: [],
      }
      setPageParamsQueryDataForVariables(queryClient, swimlaneVariables, originalPageParams)
      const groupsResponse = buildResponse(false, true)
      const {result} = renderHook(() => useNextPlaceholderQuery(swimlaneVariables, undefined), {
        wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
      })
      result.current.updateMemexGroupsNextPlaceholderQuery(groupsResponse)
      const updatedPageParams = getPageParamsQueryDataForVariables(queryClient, swimlaneVariables)
      // Only updated secondaryGroups and added related groupedItems
      expect(updatedPageParams).toMatchObject({
        pageParams: originalPageParams.pageParams,
        groupedItems: {
          ...originalPageParams.groupedItems,
          'page1Group:page2SecondaryGroup': [pageParamForInitialPage],
        },
        secondaryGroups: [pageParamForInitialPage, {after: 'secondaryCursor'}],
        groupedItemBatches: originalPageParams.groupedItemBatches,
      })
    })
    it('does not update pageParams for secondary groups or existing groupedItems when paginating primary groups', () => {
      seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
      const originalPageParams: GroupedWithSecondaryGroupsPageParamsQueryData = {
        pageParams: [pageParamForInitialPage, {after: 'primaryCursor'}, pageParamForNextPlaceholder],
        secondaryGroups: [pageParamForInitialPage, {after: 'secondaryCursor'}, pageParamForNextPlaceholder],
        groupedItems: {
          'page1Group:page1SecondaryGroup': [
            pageParamForInitialPage,
            {after: 'groupedItemsCursor'},
            pageParamForNextPlaceholder,
          ],
        },
        groupedItemBatches: [],
      }
      setPageParamsQueryDataForVariables(queryClient, swimlaneVariables, originalPageParams)
      const groupsResponse = buildResponse(true, false)
      const {result} = renderHook(() => useNextPlaceholderQuery(swimlaneVariables, undefined), {
        wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
      })
      result.current.updateMemexGroupsNextPlaceholderQuery(groupsResponse)
      const updatedPageParams = getPageParamsQueryDataForVariables(
        queryClient,
        swimlaneVariables,
      ) as GroupedWithSecondaryGroupsPageParamsQueryData
      // Only updated primary group pageParams and added related groupedItems
      expect(updatedPageParams).toMatchObject({
        pageParams: [pageParamForInitialPage, {after: 'primaryCursor'}],
        groupedItems: {
          ...originalPageParams.groupedItems,
          'page2Group:page1SecondaryGroup': [pageParamForInitialPage],
        },
        secondaryGroups: originalPageParams.secondaryGroups,
        groupedItemBatches: originalPageParams.groupedItemBatches,
      })
    })
    it('does not update existing page params when deeply paginating batches of groupedItems', () => {
      seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
      const originalPageParams: GroupedWithSecondaryGroupsPageParamsQueryData = {
        pageParams: [pageParamForInitialPage, {after: 'primaryCursor'}, pageParamForNextPlaceholder],
        secondaryGroups: [pageParamForInitialPage, {after: 'secondaryCursor'}, pageParamForNextPlaceholder],
        groupedItems: {
          'page1Group:page1SecondaryGroup': [
            pageParamForInitialPage,
            {after: 'groupedItemsCursor'},
            pageParamForNextPlaceholder,
          ],
        },
        groupedItemBatches: [{after: 'primaryCursor', secondaryAfter: 'secondaryCursor'}],
      }
      setPageParamsQueryDataForVariables(queryClient, swimlaneVariables, originalPageParams)
      const groupsResponse = buildResponse(true, true)
      const {result} = renderHook(() => useNextPlaceholderQuery(swimlaneVariables, undefined), {
        wrapper: createWrapperWithContexts({QueryClient: {queryClient}}),
      })
      result.current.updateMemexGroupsNextPlaceholderQuery(groupsResponse)
      const updatedPageParams = getPageParamsQueryDataForVariables(
        queryClient,
        swimlaneVariables,
      ) as GroupedWithSecondaryGroupsPageParamsQueryData
      // Only added pageParams for related groupedItems
      expect(updatedPageParams).toMatchObject({
        ...originalPageParams,
        groupedItems: {
          ...originalPageParams.groupedItems,
          'page2Group:page2SecondaryGroup': [pageParamForInitialPage],
        },
      })
    })
  })
})
const mockPageInfo = (hasPreviousPage = false): PageInfo => ({
  hasNextPage: !hasPreviousPage,
  hasPreviousPage,
  startCursor: 'startCursor',
  endCursor: 'endCursor',
})
const buildGroup = (groupId: string) => ({
  groupId,
  groupValue: `Group ${groupId}`,
  totalCount: {value: 10, isApproximate: false},
})
const buildResponse = (
  hasPrimaryPreviousPage: boolean,
  hasSecondaryPreviousPage?: boolean,
): PaginatedGroupsResponse | PaginatedGroupsAndSecondaryGroupsResponse => {
  const groupId = hasPrimaryPreviousPage ? 'page2Group' : 'page1Group'
  const groupNodes = [buildGroup(groupId)]
  const response = {
    groups: {
      nodes: groupNodes,
      pageInfo: mockPageInfo(hasPrimaryPreviousPage),
    },
    secondaryGroups: null,
    groupedItems: [
      {
        groupId: groupNodes[0].groupId,
        nodes: [issueFactory.build()],
        pageInfo: mockPageInfo(false),
      },
    ],
    totalCount: {value: 1, isApproximate: false},
  }
  if (hasSecondaryPreviousPage !== undefined) {
    const secondaryGroupId = hasSecondaryPreviousPage ? 'page2SecondaryGroup' : 'page1SecondaryGroup'
    return {
      ...response,
      groupedItems: [{...response.groupedItems[0], secondaryGroupId}],
      secondaryGroups: {
        nodes: [buildGroup(secondaryGroupId)],
        pageInfo: mockPageInfo(hasSecondaryPreviousPage),
      },
    }
  }
  return response
}
