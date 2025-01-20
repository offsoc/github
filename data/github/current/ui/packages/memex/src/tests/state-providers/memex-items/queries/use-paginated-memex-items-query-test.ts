import type {QueryKey} from '@tanstack/react-query'
import {renderHook, waitFor} from '@testing-library/react'

import type {
  GetPaginatedItemsResponse,
  PaginatedItemsData,
  PaginatedMemexItemsData,
} from '../../../../client/api/memex-items/paginated-views'
import {
  buildGroupedMemexItemsQueryKey,
  buildMemexGroupsQueryKey,
  buildMemexSecondaryGroupsQueryKey,
  buildUngroupedMemexItemsQueryKey,
  getPageTypeFromQueryKey,
  isPageTypeForGroupedItems,
  type PageTypeForGroupedItems,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import {
  pageParamForInitialPage,
  type PaginatedMemexItemsQueryVariables,
} from '../../../../client/state-providers/memex-items/queries/types'
import {usePaginatedMemexItemsQuery} from '../../../../client/state-providers/memex-items/queries/use-paginated-memex-items-query'
import {invalidateInactiveInitialQueries} from '../../../../client/state-providers/memex-items/query-client-api/page-params'
import type {GetRequestType} from '../../../../mocks/msw-responders'
import {get_getPaginatedItems} from '../../../../mocks/msw-responders/memex-items'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {buildSystemColumns} from '../../../factories/columns/system-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {stubGetPaginatedItems} from '../../../mocks/api/memex-items'
import {
  mockUseGetFieldIdsFromFilter,
  mockUseLoadRequiredFieldsForViewsAndCurrentView,
} from '../../../mocks/hooks/use-load-required-fields'
import {mswServer} from '../../../msw-server'
import {TestAppContainer} from '../../../test-app-wrapper'
import {buildGroupedItemsResponse, buildGroupedItemsResponseWithSecondaryGroups} from '../query-client-api/helpers'

jest.mock('../../../../client/state-providers/memex-items/query-client-api/page-params', () => {
  const originalModule = jest.requireActual(
    '../../../../client/state-providers/memex-items/query-client-api/page-params',
  )
  return {
    __esModule: true,
    ...originalModule,
    invalidateInactiveInitialQueries: jest.fn(),
  }
})

function buildResponseWithNoNextPage(grouped = false): PaginatedMemexItemsData {
  const items = [issueFactory.build(), issueFactory.build()]
  if (grouped) {
    return buildGroupedItemsResponse({
      groups: [
        {
          groupId: 'group3',
          groupValue: 'Group 3',
          items,
        },
      ],
    })
  }
  return {
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
  }
}

const mockResponseWithNoNextPage = (grouped = false) => {
  const response = buildResponseWithNoNextPage(grouped)
  return stubGetPaginatedItems(response)
}

const mockResponseOfSecondaryGroupsWithNoNextPage = () => {
  const items = [issueFactory.build(), issueFactory.build()]
  const response = buildGroupedItemsResponseWithSecondaryGroups({
    groups: [
      {
        groupId: 'group1',
        groupValue: 'Group 1',
        nestedItems: [{secondaryGroupId: 'secondaryGroup3', items: [items[0]]}],
      },
      {
        groupId: 'group2',
        groupValue: 'Group 2',
        nestedItems: [{secondaryGroupId: 'secondaryGroup3', items: [items[1]]}],
      },
    ],
    secondaryGroups: [
      {
        groupId: 'secondaryGroup3',
      },
    ],
    pageInfoForGroups: {
      hasNextPage: true,
      hasPreviousPage: false,
    },
    pageInfoForSecondaryGroups: {
      hasNextPage: false,
      hasPreviousPage: true,
    },
  })

  return stubGetPaginatedItems(response)
}

const mockResponseOfGroupsWithNoNextPage = () => {
  const items = [issueFactory.build(), issueFactory.build()]
  const response = buildGroupedItemsResponseWithSecondaryGroups({
    groups: [
      {
        groupId: 'group3',
        groupValue: 'Group 3',
        nestedItems: [
          {secondaryGroupId: 'secondaryGroup1', items: [items[0]]},
          {secondaryGroupId: 'secondaryGroup2', items: [items[1]]},
        ],
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
    pageInfoForGroups: {
      hasNextPage: false,
      hasPreviousPage: true,
    },
    pageInfoForSecondaryGroups: {
      hasNextPage: true,
      hasPreviousPage: false,
      endCursor: 'endCursorForFirstPageofSecondaryGroups',
    },
  })

  return stubGetPaginatedItems(response)
}

const mockResponseOfGroupedItemsBatch = () => {
  const items = [issueFactory.build()]
  const response = buildGroupedItemsResponseWithSecondaryGroups({
    groups: [
      {
        groupId: 'group3',
        groupValue: 'Group 3',
        nestedItems: [{secondaryGroupId: 'secondaryGroup3', items: [items[0]]}],
      },
    ],
    secondaryGroups: [
      {
        groupId: 'secondaryGroup3',
      },
    ],
  })

  return stubGetPaginatedItems(response)
}

describe(`usePaginatedMemexItemsQuery`, () => {
  // Prevent open handle errors, otherwise we'd have to make sure that
  // we define column values for all of the items created with the issueFactory
  beforeAll(() => {
    mockUseGetFieldIdsFromFilter()
    mockUseLoadRequiredFieldsForViewsAndCurrentView()
  })

  it('returns queries, queryKeys and page data for ungrouped memex items', () => {
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const issues = [issueFactory.build(), issueFactory.build()]
    const expectedVariables: PaginatedMemexItemsQueryVariables = {q: '', sortedBy: []}

    seedJSONIsland('memex-paginated-items-data', {
      nodes: issues,
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {value: issues.length, isApproximate: false},
    })

    const {result} = renderHook(() => usePaginatedMemexItemsQuery(), {
      wrapper: TestAppContainer,
    })

    const expectedQueryKeysForItems: Array<QueryKey> = [
      buildUngroupedMemexItemsQueryKey(expectedVariables, pageParamForInitialPage),
    ]

    expect(result.current.queriesForItems).toHaveLength(1)
    expect(result.current.queryKeysForItems).toEqual(expectedQueryKeysForItems)
    expect(result.current.queriesForGroups).toHaveLength(0)
    expect(result.current.queryKeysForGroups).toHaveLength(0)
    expect(result.current.groupsById).toEqual({})
    expect(result.current.groupedItemQueries).toEqual({})

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].nodes).toHaveLength(2)
    expect(result.current.data[0].nodes[0].id).toEqual(issues[0].id)
    expect(result.current.data[0].nodes[1].id).toEqual(issues[1].id)
  })

  it('returns queries, queryKeys and page data for grouped memex items', () => {
    const systemColumns = buildSystemColumns()
    const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
    seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
    seedJSONIsland('memex-columns-data', systemColumns)
    seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])

    const issues = [issueFactory.build(), issueFactory.build()]
    const expectedVariables: PaginatedMemexItemsQueryVariables = {
      q: '',
      sortedBy: [],
      horizontalGroupedByColumnId: 'Status',
    }

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponse({
        groups: [
          {groupId: 'group1', groupValue: 'Group 1', items: [issues[0]]},
          {groupId: 'group2', groupValue: 'Group 2', items: [issues[1]]},
        ],
      }),
    )

    const {result} = renderHook(() => usePaginatedMemexItemsQuery(), {
      wrapper: TestAppContainer,
    })

    const expectedQueryKeysForItems: Array<QueryKey> = [
      buildGroupedMemexItemsQueryKey(expectedVariables, {groupId: 'group1'}, pageParamForInitialPage),
      buildGroupedMemexItemsQueryKey(expectedVariables, {groupId: 'group2'}, pageParamForInitialPage),
    ]

    const expectedQueryKeysForGroups: Array<QueryKey> = [
      buildMemexGroupsQueryKey(expectedVariables, pageParamForInitialPage),
    ]

    expect(result.current.queriesForItems).toHaveLength(2)
    expect(result.current.queryKeysForItems).toEqual(expectedQueryKeysForItems)
    expect(result.current.queriesForGroups).toHaveLength(1)
    expect(Object.keys(result.current.groupsById)).toHaveLength(2)
    expect(result.current.queryKeysForGroups).toEqual(expectedQueryKeysForGroups)
    expect(result.current.queriesForSecondaryGroups).toHaveLength(0)
    expect(result.current.queryKeysForSecondaryGroups).toEqual([])
    expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(2) // 2 groups

    const group1QueriesById = result.current.groupedItemQueries['group1']
    expect(result.current.groupsById['group1'].groupValue).toEqual('Group 1')
    expect(group1QueriesById).toHaveLength(1) // 1 Page of data for the group
    expect(group1QueriesById[0]).toEqual(result.current.queriesForItems[0])

    const group2QueriesById = result.current.groupedItemQueries['group2']
    expect(result.current.groupsById['group2'].groupValue).toEqual('Group 2')
    expect(group2QueriesById).toHaveLength(1) // 1 Page of data for the group
    expect(group2QueriesById[0]).toEqual(result.current.queriesForItems[1])

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data[0].nodes).toHaveLength(1)
    expect(result.current.data[0].nodes[0].id).toEqual(issues[0].id)
    expect(result.current.data[1].nodes[0].id).toEqual(issues[1].id)
  })

  it('returns queries, queryKeys and page data for grouped memex items with secondary groups', () => {
    const systemColumns = buildSystemColumns()
    const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
    seedJSONIsland('memex-enabled-features', ['memex_mwl_swimlanes'])
    seedJSONIsland('memex-columns-data', systemColumns)
    seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])

    const issues = [issueFactory.build(), issueFactory.build(), issueFactory.build(), issueFactory.build()]
    const expectedVariables: PaginatedMemexItemsQueryVariables = {
      q: '',
      sortedBy: [],
      horizontalGroupedByColumnId: 'Status',
    }

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            groupId: 'group1',
            groupValue: 'Group 1',
            nestedItems: [
              {secondaryGroupId: 'secondaryGroup1', items: [issues[0]]},
              {secondaryGroupId: 'secondaryGroup2', items: [issues[1]]},
            ],
          },
          {
            groupId: 'group2',
            groupValue: 'Group 2',
            nestedItems: [
              {secondaryGroupId: 'secondaryGroup1', items: [issues[2]]},
              {secondaryGroupId: 'secondaryGroup2', items: [issues[3]]},
            ],
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
      }),
    )

    const {result} = renderHook(() => usePaginatedMemexItemsQuery(), {
      wrapper: TestAppContainer,
    })

    const expectedQueryKeysForItems: Array<QueryKey> = [
      buildGroupedMemexItemsQueryKey(
        expectedVariables,
        {groupId: 'group1', secondaryGroupId: 'secondaryGroup1'},
        pageParamForInitialPage,
      ),
      buildGroupedMemexItemsQueryKey(
        expectedVariables,
        {groupId: 'group1', secondaryGroupId: 'secondaryGroup2'},
        pageParamForInitialPage,
      ),
      buildGroupedMemexItemsQueryKey(
        expectedVariables,
        {groupId: 'group2', secondaryGroupId: 'secondaryGroup1'},
        pageParamForInitialPage,
      ),
      buildGroupedMemexItemsQueryKey(
        expectedVariables,
        {groupId: 'group2', secondaryGroupId: 'secondaryGroup2'},
        pageParamForInitialPage,
      ),
    ]

    const expectedQueryKeysForGroups: Array<QueryKey> = [
      buildMemexGroupsQueryKey(expectedVariables, pageParamForInitialPage),
    ]

    const expectedQueryKeysForSecondaryGroups: Array<QueryKey> = [
      buildMemexSecondaryGroupsQueryKey(expectedVariables, pageParamForInitialPage),
    ]

    expect(result.current.queriesForItems).toHaveLength(4)
    expect(result.current.queryKeysForItems).toEqual(expectedQueryKeysForItems)
    expect(result.current.queriesForGroups).toHaveLength(1)
    expect(Object.keys(result.current.groupsById)).toHaveLength(4)
    expect(result.current.queryKeysForGroups).toEqual(expectedQueryKeysForGroups)
    expect(result.current.queriesForSecondaryGroups).toHaveLength(1)
    expect(result.current.queryKeysForSecondaryGroups).toEqual(expectedQueryKeysForSecondaryGroups)

    expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(8)
    const group1 = result.current.groupedItemQueries['group1']
    expect(group1).toHaveLength(2)
    expect(group1[0].data?.nodes).toHaveLength(1)
    expect(group1[0].data?.nodes[0].id).toBe(issues[0].id)
    expect(group1[1].data?.nodes).toHaveLength(1)
    expect(group1[1].data?.nodes[0].id).toBe(issues[1].id)

    const group2 = result.current.groupedItemQueries['group2']
    expect(group2).toHaveLength(2)
    expect(group2[0].data?.nodes).toHaveLength(1)
    expect(group2[0].data?.nodes[0].id).toBe(issues[2].id)
    expect(group2[1].data?.nodes).toHaveLength(1)
    expect(group2[1].data?.nodes[0].id).toBe(issues[3].id)

    const secondaryGroup1 = result.current.groupedItemQueries['secondaryGroup1']
    expect(secondaryGroup1).toHaveLength(2)
    expect(secondaryGroup1[0].data?.nodes).toHaveLength(1)
    expect(secondaryGroup1[0].data?.nodes[0].id).toBe(issues[0].id)
    expect(secondaryGroup1[1].data?.nodes).toHaveLength(1)
    expect(secondaryGroup1[1].data?.nodes[0].id).toBe(issues[2].id)

    const secondaryGroup2 = result.current.groupedItemQueries['secondaryGroup2']
    expect(secondaryGroup2).toHaveLength(2)
    expect(secondaryGroup2[0].data?.nodes).toHaveLength(1)
    expect(secondaryGroup2[0].data?.nodes[0].id).toBe(issues[1].id)
    expect(secondaryGroup2[1].data?.nodes).toHaveLength(1)
    expect(secondaryGroup2[1].data?.nodes[0].id).toBe(issues[3].id)

    const group1SecondaryGroup1 = result.current.groupedItemQueries['group1:secondaryGroup1']
    expect(group1SecondaryGroup1).toHaveLength(1)
    expect(group1SecondaryGroup1[0].data?.nodes).toHaveLength(1)
    expect(group1SecondaryGroup1[0].data?.nodes[0].id).toBe(issues[0].id)

    const group1SecondaryGroup2 = result.current.groupedItemQueries['group1:secondaryGroup2']
    expect(group1SecondaryGroup2).toHaveLength(1)
    expect(group1SecondaryGroup2[0].data?.nodes).toHaveLength(1)
    expect(group1SecondaryGroup2[0].data?.nodes[0].id).toBe(issues[1].id)

    const group2SecondaryGroup1 = result.current.groupedItemQueries['group2:secondaryGroup1']
    expect(group2SecondaryGroup1).toHaveLength(1)
    expect(group2SecondaryGroup1[0].data?.nodes).toHaveLength(1)
    expect(group2SecondaryGroup1[0].data?.nodes[0].id).toBe(issues[2].id)

    const group2SecondaryGroup2 = result.current.groupedItemQueries['group2:secondaryGroup2']
    expect(group2SecondaryGroup2).toHaveLength(1)
    expect(group2SecondaryGroup2[0].data?.nodes).toHaveLength(1)
    expect(group2SecondaryGroup2[0].data?.nodes[0].id).toBe(issues[3].id)

    expect(result.current.data).toHaveLength(4)
    expect(result.current.data[0].nodes).toHaveLength(1)
    expect(result.current.data[0].nodes[0].id).toEqual(issues[0].id)
    expect(result.current.data[1].nodes).toHaveLength(1)
    expect(result.current.data[1].nodes[0].id).toEqual(issues[1].id)
    expect(result.current.data[2].nodes).toHaveLength(1)
    expect(result.current.data[2].nodes[0].id).toEqual(issues[2].id)
    expect(result.current.data[3].nodes).toHaveLength(1)
    expect(result.current.data[3].nodes[0].id).toEqual(issues[3].id)
  })

  describe('pagination', () => {
    it('hasNextPage is false for ungrouped data with no items', () => {
      seedJSONIsland('memex-columns-data', buildSystemColumns())
      seedJSONIsland('memex-paginated-items-data', {
        nodes: [],
        pageInfo: {hasNextPage: false, hasPreviousPage: false, endCursor: 'endCursorForFirstPageofGroups'},
        totalCount: {value: 0, isApproximate: false},
      })

      const {result} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      expect(result.current.hasNextPage).toBeFalsy()
    })

    it('hasNextPage is false for grouped data with no items', () => {
      const systemColumns = buildSystemColumns()
      const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
      seedJSONIsland('memex-columns-data', systemColumns)
      seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])

      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponse({
          groups: [],
        }),
      )

      const {result} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      expect(result.current.hasNextPage).toBeFalsy()
    })

    it('fetchNextPage of ungrouped items updates queries and query keys', async () => {
      seedJSONIsland('memex-columns-data', buildSystemColumns())

      const issues = [issueFactory.build(), issueFactory.build()]
      const expectedVariables: PaginatedMemexItemsQueryVariables = {q: '', sortedBy: []}

      seedJSONIsland('memex-paginated-items-data', {
        nodes: issues,
        pageInfo: {hasNextPage: true, hasPreviousPage: false, endCursor: 'endCursorForFirstPage'},
        totalCount: {value: issues.length, isApproximate: false},
      })

      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const expectedQueryKeysForItemsAfterFetchingNextPage: Array<QueryKey> = [
        buildUngroupedMemexItemsQueryKey(expectedVariables, pageParamForInitialPage),
        buildUngroupedMemexItemsQueryKey(expectedVariables, {after: 'endCursorForFirstPage'}),
      ]

      expect(result.current.queriesForItems).toHaveLength(1)
      expect(result.current.hasNextPage).toBeTruthy()
      expect(result.current.isFetchingNextPage).toBeFalsy()

      const mockRequest = mockResponseWithNoNextPage()

      result.current.fetchNextPage()

      rerender()

      // After starting the process of fetching the next page, the queries array
      // should be updated with a new query object, and the isFetchingNextPage value
      // should be true

      expect(result.current.queriesForItems).toHaveLength(2)
      expect(result.current.isFetchingNextPage).toBeTruthy()
      expect(result.current.queriesForItems[1].data).toBeUndefined()

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalled()
      })

      rerender()

      // Once the request resolves, isFetchingNextPage should switch back to false
      // and the data should be updated in the second page query object

      expect(result.current.queriesForItems).toHaveLength(2)
      expect(result.current.isFetchingNextPage).toBeFalsy()
      expect(result.current.queriesForItems[1].data?.nodes).toHaveLength(2)

      expect(result.current.queryKeysForItems).toEqual(expectedQueryKeysForItemsAfterFetchingNextPage)
    })

    it('fetchNextPage of groups updates queries and query keys', async () => {
      const systemColumns = buildSystemColumns()
      const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
      seedJSONIsland('memex-columns-data', systemColumns)
      seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])

      const issues = [issueFactory.build(), issueFactory.build()]
      const expectedVariables: PaginatedMemexItemsQueryVariables = {
        q: '',
        sortedBy: [],
        horizontalGroupedByColumnId: 'Status',
      }

      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponse({
          groups: [
            {
              groupId: 'group1',
              groupValue: 'Group 1',
              items: [issues[0]],
              pageInfoForItemsInGroup: {
                hasNextPage: true,
                hasPreviousPage: false,
                endCursor: 'endCursorForFirstPageGroup1',
              },
            },
            {groupId: 'group2', groupValue: 'Group 2', items: [issues[1]]},
          ],
          pageInfoForGroups: {
            hasNextPage: true,
            hasPreviousPage: false,
            endCursor: 'endCursorForFirstPageofGroups',
          },
        }),
      )

      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const expectedQueryKeysForGroupsAfterFetchingNextPage: Array<QueryKey> = [
        buildMemexGroupsQueryKey(expectedVariables, pageParamForInitialPage),
        buildMemexGroupsQueryKey(expectedVariables, {
          after: 'endCursorForFirstPageofGroups',
        }),
      ]

      expect(result.current.queriesForGroups).toHaveLength(1)
      expect(Object.keys(result.current.groupsById)).toHaveLength(2)
      expect(result.current.hasNextPage).toBeTruthy()
      expect(result.current.isFetchingNextPage).toBeFalsy()
      expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(2) // 2 groups

      const mockRequest = mockResponseWithNoNextPage(true)

      result.current.fetchNextPage()

      rerender()

      // After starting the process of fetching the next page, the queries array
      // should be updated with a new query object, and the isFetchingNextPage value
      // should be true

      expect(result.current.queriesForGroups).toHaveLength(2)
      expect(result.current.isFetchingNextPage).toBeTruthy()
      expect(result.current.queriesForGroups[0].data?.groups).toHaveLength(2)
      expect(result.current.queriesForGroups[1].data).toBeUndefined()
      expect(Object.keys(result.current.groupsById)).toHaveLength(2)
      expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(2) // 2 groups

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalled()
      })

      rerender()

      // Once the request resolves, isFetchingNextPage should switch back to false
      // and the data should be updated in the second page query object

      expect(result.current.queriesForGroups).toHaveLength(2)
      expect(result.current.isFetchingNextPage).toBeFalsy()
      expect(result.current.queriesForGroups[1].data?.groups).toHaveLength(1)
      expect(Object.keys(result.current.groupsById)).toHaveLength(3)
      expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(3) // 3 groups
      // The query that is added to 'group3' should be the 3rd query of items
      expect(result.current.groupedItemQueries['group3'][0]).toEqual(result.current.queriesForItems[2])

      expect(expectedQueryKeysForGroupsAfterFetchingNextPage).toEqual(result.current.queryKeysForGroups)
    })

    it('fetchNextPage of secondary groups updates queries and query keys', async () => {
      const systemColumns = buildSystemColumns()
      const statusColumn = systemColumns.find(c => c.id === 'Status')
      const statusDatabaseId = statusColumn?.databaseId || 0
      const assigneesColumn = systemColumns.find(c => c.id === 'Assignees')
      const assigneesDatabaseId = assigneesColumn?.databaseId || 0
      seedJSONIsland('memex-columns-data', systemColumns)
      seedJSONIsland('memex-views', [
        viewFactory.build({
          groupBy: [assigneesDatabaseId],
          verticalGroupBy: [statusDatabaseId],
          visibleFields: [],
          layout: 'board_layout',
        }),
      ])
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_swimlanes'])

      const issues = [issueFactory.build(), issueFactory.build(), issueFactory.build(), issueFactory.build()]
      const expectedVariables: PaginatedMemexItemsQueryVariables = {
        q: '',
        sortedBy: [],
        horizontalGroupedByColumnId: 'Assignees',
        verticalGroupedByColumnId: 'Status',
      }

      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponseWithSecondaryGroups({
          groups: [
            {
              groupId: 'group1',
              groupValue: 'Group 1',
              nestedItems: [
                {secondaryGroupId: 'secondaryGroup1', items: [issues[0]]},
                {secondaryGroupId: 'secondaryGroup2', items: [issues[1]]},
              ],
            },
            {
              groupId: 'group2',
              groupValue: 'Group 2',
              nestedItems: [
                {secondaryGroupId: 'secondaryGroup1', items: [issues[2]]},
                {secondaryGroupId: 'secondaryGroup2', items: [issues[3]]},
              ],
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
          pageInfoForSecondaryGroups: {
            hasNextPage: true,
            hasPreviousPage: false,
            endCursor: 'endCursorForFirstPageofSecondaryGroups',
          },
        }),
      )

      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const expectedQueryKeysForGroupsAfterFetchingNextPage: Array<QueryKey> = [
        buildMemexGroupsQueryKey(expectedVariables, pageParamForInitialPage),
      ]

      const expectedQueryKeysForSecondaryGroupsAfterFetchingNextPage: Array<QueryKey> = [
        buildMemexSecondaryGroupsQueryKey(expectedVariables, pageParamForInitialPage),
        buildMemexSecondaryGroupsQueryKey(expectedVariables, {
          after: 'endCursorForFirstPageofSecondaryGroups',
        }),
      ]

      expect(result.current.queriesForGroups).toHaveLength(1)
      expect(result.current.queriesForSecondaryGroups).toHaveLength(1)
      expect(Object.keys(result.current.groupsById)).toHaveLength(4)
      expect(result.current.hasNextPage).toBeFalsy()
      expect(result.current.isFetchingNextPage).toBeFalsy()
      expect(result.current.hasNextPageForSecondaryGroups).toBeTruthy()
      expect(result.current.isFetchingNextPageForSecondaryGroups).toBeFalsy()
      expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(8) // 4 cells + 2 groups + 2 secondary groups

      const mockRequest = mockResponseOfSecondaryGroupsWithNoNextPage()

      result.current.fetchNextPageForSecondaryGroups()

      rerender()

      // After starting the process of fetching the next page, the queries array
      // should be updated with a new query object, and the isFetchingNextPage value
      // should be true

      expect(result.current.queriesForGroups).toHaveLength(1)
      expect(result.current.queriesForSecondaryGroups).toHaveLength(2)
      expect(result.current.isFetchingNextPageForSecondaryGroups).toBeTruthy()
      expect(result.current.queriesForSecondaryGroups[0].data?.groups).toHaveLength(2)
      expect(result.current.queriesForSecondaryGroups[1].data).toBeUndefined()
      expect(Object.keys(result.current.groupsById)).toHaveLength(4)
      expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(8) // 4 cells + 2 groups + 2 secondary groups

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalled()
      })

      rerender()

      // Once the request resolves, isFetchingNextPage should switch back to false
      // and the data should be updated in the second page query object

      expect(result.current.queriesForGroups).toHaveLength(1)
      expect(result.current.queriesForSecondaryGroups).toHaveLength(2)
      expect(result.current.isFetchingNextPageForSecondaryGroups).toBeFalsy()
      expect(result.current.queriesForSecondaryGroups[1].data?.groups).toHaveLength(1)
      expect(Object.keys(result.current.groupsById)).toHaveLength(5)
      expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(11) // 6 cells + 2 groups + 3 secondary groups
      // The queries that is added to 'secondaryGroup3' should be the 5th and 6th query of items
      expect(result.current.groupedItemQueries['secondaryGroup3'][0]).toEqual(result.current.queriesForItems[4])
      expect(result.current.groupedItemQueries['secondaryGroup3'][1]).toEqual(result.current.queriesForItems[5])

      expect(expectedQueryKeysForGroupsAfterFetchingNextPage).toEqual(result.current.queryKeysForGroups)
      expect(expectedQueryKeysForSecondaryGroupsAfterFetchingNextPage).toEqual(
        result.current.queryKeysForSecondaryGroups,
      )
    })

    it('fetchGroupedItemsBatch updates queries and query keys', async () => {
      const systemColumns = buildSystemColumns()
      const statusColumn = systemColumns.find(c => c.id === 'Status')
      const statusDatabaseId = statusColumn?.databaseId || 0
      const assigneesColumn = systemColumns.find(c => c.id === 'Assignees')
      const assigneesDatabaseId = assigneesColumn?.databaseId || 0
      seedJSONIsland('memex-columns-data', systemColumns)
      seedJSONIsland('memex-views', [
        viewFactory.build({
          groupBy: [assigneesDatabaseId],
          verticalGroupBy: [statusDatabaseId],
          visibleFields: [],
          layout: 'board_layout',
        }),
      ])
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_swimlanes'])

      const issues = [issueFactory.build(), issueFactory.build(), issueFactory.build(), issueFactory.build()]
      const expectedVariables: PaginatedMemexItemsQueryVariables = {
        q: '',
        sortedBy: [],
        horizontalGroupedByColumnId: 'Assignees',
        verticalGroupedByColumnId: 'Status',
      }

      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponseWithSecondaryGroups({
          groups: [
            {
              groupId: 'group1',
              groupValue: 'Group 1',
              nestedItems: [
                {secondaryGroupId: 'secondaryGroup1', items: [issues[0]]},
                {secondaryGroupId: 'secondaryGroup2', items: [issues[1]]},
              ],
            },
            {
              groupId: 'group2',
              groupValue: 'Group 2',
              nestedItems: [
                {secondaryGroupId: 'secondaryGroup1', items: [issues[2]]},
                {secondaryGroupId: 'secondaryGroup2', items: [issues[3]]},
              ],
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
          pageInfoForGroups: {
            hasNextPage: true,
            hasPreviousPage: false,
            endCursor: 'endCursorForFirstPageofGroups',
          },
          pageInfoForSecondaryGroups: {
            hasNextPage: true,
            hasPreviousPage: false,
            endCursor: 'endCursorForFirstPageofSecondaryGroups',
          },
        }),
      )

      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const mockRequestForGroups = mockResponseOfGroupsWithNoNextPage()

      result.current.fetchNextPage()

      rerender()

      await waitFor(() => {
        expect(mockRequestForGroups).toHaveBeenCalled()
      })

      const mockRequestForSecondaryGroups = mockResponseOfSecondaryGroupsWithNoNextPage()

      result.current.fetchNextPageForSecondaryGroups()

      await waitFor(() => {
        expect(mockRequestForSecondaryGroups).toHaveBeenCalled()
      })

      rerender()

      const expectedQueryKeysForGroupsAfterFetchingNextPage: Array<QueryKey> = [
        buildMemexGroupsQueryKey(expectedVariables, pageParamForInitialPage),
        buildMemexGroupsQueryKey(expectedVariables, {
          after: 'endCursorForFirstPageofGroups',
        }),
      ]

      const expectedQueryKeysForSecondaryGroupsAfterFetchingNextPage: Array<QueryKey> = [
        buildMemexSecondaryGroupsQueryKey(expectedVariables, pageParamForInitialPage),
        buildMemexSecondaryGroupsQueryKey(expectedVariables, {
          after: 'endCursorForFirstPageofSecondaryGroups',
        }),
      ]

      const pageTypesForExpectedGroupedItems: Array<PageTypeForGroupedItems> = [
        {groupId: 'group1', secondaryGroupId: 'secondaryGroup1'},
        {groupId: 'group1', secondaryGroupId: 'secondaryGroup2'},
        {groupId: 'group2', secondaryGroupId: 'secondaryGroup1'},
        {groupId: 'group2', secondaryGroupId: 'secondaryGroup2'},
        {groupId: 'group3', secondaryGroupId: 'secondaryGroup1'},
        {groupId: 'group3', secondaryGroupId: 'secondaryGroup2'},
        {groupId: 'group1', secondaryGroupId: 'secondaryGroup3'},
        {groupId: 'group2', secondaryGroupId: 'secondaryGroup3'},
      ]

      const expectedQueryKeysForGroupedItemsAfterFetchingGroups: Array<QueryKey> = pageTypesForExpectedGroupedItems.map(
        pageType => buildGroupedMemexItemsQueryKey(expectedVariables, pageType, pageParamForInitialPage),
      )

      expect(result.current.queryKeysForGroups).toEqual(expectedQueryKeysForGroupsAfterFetchingNextPage)
      expect(result.current.queryKeysForSecondaryGroups).toEqual(
        expectedQueryKeysForSecondaryGroupsAfterFetchingNextPage,
      )
      expect(result.current.queryKeysForItems).toEqual(expectedQueryKeysForGroupedItemsAfterFetchingGroups)

      expect(result.current.hasDataForGroupedItemsBatch('group3', 'secondaryGroup3')).toBeFalsy()
      expect(result.current.isFetchingGroupedItemsBatch('group3', 'secondaryGroup3')).toBeFalsy()

      const mockRequestForGroupedItemsBatch = mockResponseOfGroupedItemsBatch()

      result.current.fetchGroupedItemsBatch('group3', 'secondaryGroup3')

      rerender()

      expect(result.current.hasDataForGroupedItemsBatch('group3', 'secondaryGroup3')).toBeTruthy()
      expect(result.current.isFetchingGroupedItemsBatch('group3', 'secondaryGroup3')).toBeTruthy()

      await waitFor(() => {
        expect(mockRequestForGroupedItemsBatch).toHaveBeenCalled()
      })

      rerender()

      const newPageTypesForExpectedGroupedItems = [
        ...pageTypesForExpectedGroupedItems,
        {groupId: 'group3', secondaryGroupId: 'secondaryGroup3'},
      ]

      const expectedQueryKeysForGroupedItemsAfterFetchingGroupedItemsBatch: Array<QueryKey> =
        newPageTypesForExpectedGroupedItems.map(pageType =>
          buildGroupedMemexItemsQueryKey(expectedVariables, pageType, pageParamForInitialPage),
        )

      expect(result.current.queryKeysForGroups).toEqual(expectedQueryKeysForGroupsAfterFetchingNextPage)
      expect(result.current.queryKeysForSecondaryGroups).toEqual(
        expectedQueryKeysForSecondaryGroupsAfterFetchingNextPage,
      )
      expect(result.current.queryKeysForItems).toEqual(expectedQueryKeysForGroupedItemsAfterFetchingGroupedItemsBatch)

      expect(result.current.hasDataForGroupedItemsBatch('group3', 'secondaryGroup3')).toBeTruthy()
      expect(result.current.isFetchingGroupedItemsBatch('group3', 'secondaryGroup3')).toBeFalsy()
    })

    it('fetchNextPageForGroupedItems updates queries and query keys', async () => {
      const systemColumns = buildSystemColumns()
      const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
      seedJSONIsland('memex-columns-data', systemColumns)
      seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

      const issues = [issueFactory.build(), issueFactory.build()]
      const expectedVariables: PaginatedMemexItemsQueryVariables = {
        q: '',
        sortedBy: [],
        horizontalGroupedByColumnId: 'Status',
      }

      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponse({
          groups: [
            {
              groupId: 'group1',
              groupValue: 'Group 1',
              items: [issues[0]],
              pageInfoForItemsInGroup: {
                hasNextPage: true,
                hasPreviousPage: false,
                endCursor: 'endCursorForFirstPage',
              },
            },
            {groupId: 'group2', groupValue: 'Group 2', items: [issues[1]]},
          ],
        }),
      )

      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const expectedQueryKeysForItemsAfterFetchingNextPage: Array<QueryKey> = [
        buildGroupedMemexItemsQueryKey(expectedVariables, {groupId: 'group1'}, pageParamForInitialPage),
        buildGroupedMemexItemsQueryKey(
          expectedVariables,
          {groupId: 'group1'},
          {
            after: 'endCursorForFirstPage',
          },
        ),
        buildGroupedMemexItemsQueryKey(expectedVariables, {groupId: 'group2'}, pageParamForInitialPage),
      ]

      // The first group has `hasNextPage: true`, while the second group has `hasNextPage: false`.
      expect(result.current.queriesForItems).toHaveLength(2)
      expect(result.current.hasNextPageForGroupedItems({groupId: 'group1'})).toBeTruthy()
      expect(result.current.hasNextPageForGroupedItems({groupId: 'group2'})).toBeFalsy()
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group1'})).toBeFalsy()
      expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(2) // 2 groups
      expect(result.current.groupedItemQueries['group1']).toHaveLength(1) // 1 Page of data for the group

      const mockRequest = mockResponseWithNoNextPage()

      result.current.fetchNextPageForGroupedItems({groupId: 'group1'})

      rerender()

      // After starting the process of fetching the next page, the queries array
      // should be updated with a new query object (the new second element in the array),
      // and the isFetchingNextPageForGroupedItems value should be true.

      expect(result.current.queriesForItems).toHaveLength(3)
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group1'})).toBeTruthy()
      expect(result.current.queriesForItems[1].data).toBeUndefined()
      expect(result.current.groupedItemQueries['group1']).toHaveLength(2) // 2 Pages of data for the group
      expect(result.current.groupedItemQueries['group1'][1]).toEqual(result.current.queriesForItems[1])

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalled()
      })

      rerender()

      // Once the request resolves, isFetchingNextPageForGroupedItems should switch back to false
      // and the data should be updated in the second page query object

      expect(result.current.queriesForItems).toHaveLength(3)
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group1'})).toBeFalsy()
      expect(result.current.hasNextPageForGroupedItems({groupId: 'group1'})).toBeFalsy()
      expect(result.current.hasNextPageForGroupedItems({groupId: 'group2'})).toBeFalsy()
      expect(result.current.queriesForItems[1].data?.nodes).toHaveLength(2)

      expect(result.current.queryKeysForItems).toEqual(expectedQueryKeysForItemsAfterFetchingNextPage)
    })

    it('fetchNextPageForGroupedItems can make simultaneous requests', async () => {
      const systemColumns = buildSystemColumns()
      const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
      seedJSONIsland('memex-columns-data', systemColumns)
      seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

      const issues = [issueFactory.build(), issueFactory.build()]
      const expectedVariables: PaginatedMemexItemsQueryVariables = {
        q: '',
        sortedBy: [],
        horizontalGroupedByColumnId: 'Status',
      }

      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponse({
          groups: [
            {
              groupId: 'group1',
              groupValue: 'Group 1',
              items: [issues[0]],
              pageInfoForItemsInGroup: {
                hasNextPage: true,
                hasPreviousPage: false,
                endCursor: 'endCursorForFirstPageOfGroup1',
              },
            },
            {
              groupId: 'group2',
              groupValue: 'Group 2',
              items: [issues[1]],
              pageInfoForItemsInGroup: {
                hasNextPage: true,
                hasPreviousPage: false,
                endCursor: 'endCursorForFirstPageOfGroup2',
              },
            },
          ],
        }),
      )

      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const expectedQueryKeysForItemsAfterFetchingNextPage: Array<QueryKey> = [
        buildGroupedMemexItemsQueryKey(expectedVariables, {groupId: 'group1'}, pageParamForInitialPage),
        buildGroupedMemexItemsQueryKey(
          expectedVariables,
          {groupId: 'group1'},
          {
            after: 'endCursorForFirstPageOfGroup1',
          },
        ),
        buildGroupedMemexItemsQueryKey(expectedVariables, {groupId: 'group2'}, pageParamForInitialPage),
        buildGroupedMemexItemsQueryKey(
          expectedVariables,
          {groupId: 'group2'},
          {
            after: 'endCursorForFirstPageOfGroup2',
          },
        ),
      ]

      // Both groups have `hasNextPage: true`
      expect(result.current.queriesForItems).toHaveLength(2)
      expect(result.current.hasNextPageForGroupedItems({groupId: 'group1'})).toBeTruthy()
      expect(result.current.hasNextPageForGroupedItems({groupId: 'group2'})).toBeTruthy()
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group1'})).toBeFalsy()
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group2'})).toBeFalsy()
      expect(Object.keys(result.current.groupedItemQueries)).toHaveLength(2) // 2 groups
      expect(result.current.groupedItemQueries['group1']).toHaveLength(1) // 1 Page of data for the group
      expect(result.current.groupedItemQueries['group2']).toHaveLength(1) // 1 Page of data for the group

      const mockRequest = mockResponseWithNoNextPage()

      result.current.fetchNextPageForGroupedItems({groupId: 'group1'})
      result.current.fetchNextPageForGroupedItems({groupId: 'group2'})

      rerender()

      // After starting the process of fetching the next page, the queries array
      // should be updated with a new query object (the new second element in the array),
      // and the isFetchingNextPageForGroupedItems value should be true.

      // expect(result.current.queriesForItems).toHaveLength(4)
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group1'})).toBeTruthy()
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group2'})).toBeTruthy()
      expect(result.current.queriesForItems[1].data).toBeUndefined()
      expect(result.current.queriesForItems[3].data).toBeUndefined()
      expect(result.current.groupedItemQueries['group1']).toHaveLength(2) // 2 Pages of data for the group
      expect(result.current.groupedItemQueries['group2']).toHaveLength(2) // 2 Pages of data for the group
      expect(result.current.groupedItemQueries['group1'][1]).toEqual(result.current.queriesForItems[1])
      expect(result.current.groupedItemQueries['group2'][1]).toEqual(result.current.queriesForItems[3])

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(2)
      })

      rerender()

      // Once the request resolves, isFetchingNextPageForGroupedItems should switch back to false
      // and the data should be updated in the second page query object

      expect(result.current.queriesForItems).toHaveLength(4)
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group1'})).toBeFalsy()
      expect(result.current.isFetchingNextPageForGroupedItems({groupId: 'group2'})).toBeFalsy()
      expect(result.current.hasNextPageForGroupedItems({groupId: 'group1'})).toBeFalsy()
      expect(result.current.hasNextPageForGroupedItems({groupId: 'group2'})).toBeFalsy()
      expect(result.current.queriesForItems[1].data?.nodes).toHaveLength(2)
      expect(result.current.queriesForItems[3].data?.nodes).toHaveLength(2)

      expect(result.current.queryKeysForItems).toEqual(expectedQueryKeysForItemsAfterFetchingNextPage)
    })

    it('fetchNextPageForGroupedItems uses the correct endCursor for multiple requests', async () => {
      const systemColumns = buildSystemColumns()
      const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
      seedJSONIsland('memex-columns-data', systemColumns)
      seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

      const issues = [issueFactory.build(), issueFactory.build(), issueFactory.build(), issueFactory.build()]

      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponse({
          groups: [
            {
              groupId: 'group1',
              groupValue: 'Group 1',
              items: [issues[0]],
              pageInfoForItemsInGroup: {
                hasNextPage: true,
                hasPreviousPage: false,
                endCursor: 'endCursorForFirstPageOfGroup1',
              },
            },
            {
              groupId: 'group2',
              groupValue: 'Group 2',
              items: [issues[1]],
              pageInfoForItemsInGroup: {
                hasNextPage: true,
                hasPreviousPage: false,
                endCursor: 'endCursorForFirstPageOfGroup2',
              },
            },
          ],
        }),
      )

      const {result} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const firstResponse: GetPaginatedItemsResponse = {
        nodes: [issues[2]],
        pageInfo: {hasNextPage: true, hasPreviousPage: false, endCursor: 'endCursorForSecondPageOfGroup2'},
        totalCount: {value: 2, isApproximate: false},
      }

      const secondResponse: GetPaginatedItemsResponse = {
        nodes: [issues[3]],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
        totalCount: {value: 2, isApproximate: false},
      }

      const mockRequest = jest.fn<GetPaginatedItemsResponse, [GetRequestType]>()
      let afterParam: string | null = null
      const handler = get_getPaginatedItems((body, req) => {
        mockRequest(body)
        const response = afterParam == null ? firstResponse : secondResponse
        afterParam = new URL(req.url).searchParams.get('after')
        return Promise.resolve(response)
      })
      mswServer.use(handler)

      result.current.fetchNextPageForGroupedItems({groupId: 'group2'})

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      // Verify that the first request used the correct endCursor from the JSON island
      expect(afterParam).toEqual('endCursorForFirstPageOfGroup2')

      result.current.fetchNextPageForGroupedItems({groupId: 'group2'})

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(2)
      })

      // Verify that the second request used the correct endCursor from the response of the first request
      expect(afterParam).toEqual('endCursorForSecondPageOfGroup2')
    })
  })

  describe('invalidateAllQueries', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('properly invalidates queries and causes refetch when there is only one page', async () => {
      seedJSONIsland('memex-columns-data', buildSystemColumns())

      // seed a single page of issues
      const issues = [issueFactory.build(), issueFactory.build()]
      seedJSONIsland('memex-paginated-items-data', {
        nodes: issues,
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
        totalCount: {value: issues.length, isApproximate: false},
      })
      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      // refetch all
      const mockRefetchRequest = mockResponseWithNoNextPage()
      await expect(result.current.invalidateAllQueries()).resolves.toBeUndefined()

      // the created placeholder should have the same total count as the original data
      rerender()
      // query keys themselves are arrays, so we check that the item in the page param index is the placeholder param
      expect(result.current.queryKeysForItems[1][3]).toEqual('next_placeholder')
      expect(result.current.totalCount.value).toEqual(issues.length)

      await waitFor(() => {
        expect(mockRefetchRequest).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(result.current.queriesForItems).toHaveLength(1)
      })
    })

    it('properly invalidates queries and causes refetches for multiple ungrouped pages', async () => {
      seedJSONIsland('memex-columns-data', buildSystemColumns())
      const firstPage: GetPaginatedItemsResponse = {
        nodes: [issueFactory.build(), issueFactory.build()],
        pageInfo: {hasNextPage: true, hasPreviousPage: false, endCursor: 'endCursorForFirstPage'},
        totalCount: {value: 6, isApproximate: false},
      }
      const secondPage: GetPaginatedItemsResponse = {
        nodes: [issueFactory.build(), issueFactory.build()],
        pageInfo: {hasNextPage: true, hasPreviousPage: false, endCursor: 'endCursorForSecondPage'},
        totalCount: {value: 6, isApproximate: false},
      }
      const thirdPage: GetPaginatedItemsResponse = {
        nodes: [issueFactory.build(), issueFactory.build()],
        pageInfo: {hasNextPage: true, hasPreviousPage: false, endCursor: 'endCursorForThirdPage'},
        totalCount: {value: 6, isApproximate: false},
      }
      seedJSONIsland('memex-paginated-items-data', firstPage)
      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const mockRequest = jest.fn<GetPaginatedItemsResponse, [GetRequestType]>()
      const responses: Record<string, GetPaginatedItemsResponse> = {
        firstPage,
        endCursorForFirstPage: secondPage,
        endCursorForSecondPage: thirdPage,
        newendCursorForFirstPage: secondPage,
        newendCursorForSecondPage: thirdPage,
      }
      const afterParams: Array<null | string> = []
      const handler = get_getPaginatedItems((body, req) => {
        mockRequest(body)
        const afterParam: null | string = new URL(req.url).searchParams.get('after')
        afterParams.push(afterParam)
        const response = responses[afterParam || 'firstPage'] as PaginatedItemsData
        if (afterParams.length > 2) {
          response.pageInfo.endCursor = `new${response.pageInfo.endCursor}`
        }
        return Promise.resolve(response)
      })
      mswServer.use(handler)

      result.current.fetchNextPage()
      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })
      result.current.fetchNextPage()
      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(2)
      })
      // Capture the original end cursors
      const originalAfterParams = afterParams.slice()
      // invalidate all queries
      await expect(result.current.invalidateAllQueries()).resolves.toBeUndefined()

      // the created placeholder should have the same total count as the original data
      rerender()
      // query keys themselves are arrays, so we check that the item in the page param index is the placeholder param
      expect(result.current.queryKeysForItems[1][3]).toEqual('next_placeholder')
      expect(result.current.totalCount.value).toEqual(6)

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(5) // 2 previous calls + 3 refreshes
      })
      await waitFor(() => {
        expect(result.current.queriesForItems).toHaveLength(3)
      })
      const lastKey = result.current.queryKeysForItems[result.current.queryKeysForItems.length - 1]
      // the last key should no longer be the placeholder
      expect(lastKey[3]).not.toEqual('next_placeholder')
      expect(afterParams).toEqual([
        ...originalAfterParams,
        null,
        'newendCursorForFirstPage',
        'newendCursorForSecondPage',
      ])
    })

    it('properly invalidates queries and causes refetches for multiple grouped pages', async () => {
      const systemColumns = buildSystemColumns()
      const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
      seedJSONIsland('memex-columns-data', systemColumns)
      seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

      const group1SecondPage: GetPaginatedItemsResponse = {
        nodes: [issueFactory.build(), issueFactory.build()],
        pageInfo: {hasNextPage: true, hasPreviousPage: false, endCursor: 'group1SecondPageEndCursor'},
        totalCount: {value: 6, isApproximate: false},
      }

      const firstPage: GetPaginatedItemsResponse = buildGroupedItemsResponse({
        groups: [
          {
            groupId: 'group1',
            groupValue: 'Group 1',
            items: [issueFactory.build(), issueFactory.build()],
            pageInfoForItemsInGroup: {
              hasNextPage: true,
              hasPreviousPage: false,
              endCursor: 'group1FirstPageEndCursor',
            },
            totalCountOfItemsInGroup: {value: 6, isApproximate: false},
          },
        ],
        pageInfoForGroups: {hasNextPage: true, hasPreviousPage: false, endCursor: 'firstPageEndCursor'},
        totalCount: {value: 16, isApproximate: false},
      })

      const secondPage: GetPaginatedItemsResponse = buildGroupedItemsResponse({
        groups: [
          {
            groupId: 'group2',
            groupValue: 'Group 2',
            items: [issueFactory.build(), issueFactory.build()],
            pageInfoForItemsInGroup: {
              hasNextPage: true,
              hasPreviousPage: false,
              endCursor: 'group2FirstPageEndCursor',
            },
            totalCountOfItemsInGroup: {value: 10, isApproximate: false},
          },
        ],
        pageInfoForGroups: {hasNextPage: true, hasPreviousPage: false, endCursor: 'secondPageEndCursor'},
        totalCount: {value: 16, isApproximate: false},
      })

      seedJSONIsland('memex-paginated-items-data', firstPage)
      const {result, rerender} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      const mockRequest = jest.fn<GetPaginatedItemsResponse, [GetRequestType]>()
      const responses: Record<string, GetPaginatedItemsResponse> = {
        firstPage,
        firstPageEndCursor: secondPage,
        newfirstPageEndCursor: secondPage,
        group1FirstPageEndCursor: group1SecondPage,
        newgroup1FirstPageEndCursor: group1SecondPage,
      }
      const afterParams: Array<null | string> = []
      const handler = get_getPaginatedItems((body, req) => {
        mockRequest(body)
        const afterParam: null | string = new URL(req.url).searchParams.get('after')
        afterParams.push(afterParam)
        const response = responses[afterParam || 'firstPage']
        if (afterParams.length > 2) {
          if ('pageInfo' in response) {
            response.pageInfo.endCursor = `new${response.pageInfo.endCursor}`
          } else {
            response.groups.pageInfo.endCursor = `new${response.groups.pageInfo.endCursor}`
            response.groupedItems[0].pageInfo.endCursor = `new${response.groupedItems[0].pageInfo.endCursor}`
          }
        }
        return Promise.resolve(response)
      })
      mswServer.use(handler)

      result.current.fetchNextPage()
      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })
      result.current.fetchNextPageForGroupedItems({groupId: 'group1'})
      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(2)
      })
      // Capture the original end cursors
      const originalAfterParams = afterParams.slice()
      // invalidate all queries

      await expect(result.current.invalidateAllQueries()).resolves.toBeUndefined()

      // ensure that we persist the total count for each group in our placeholders
      rerender()
      // query keys themselves are arrays, so we check that the item in the page param index is the placeholder param
      const itemQueryKeys = result.current.queryKeysForItems
      expect(itemQueryKeys[0][3]).toEqual('next_placeholder')
      const firstQueryKeyPageType = getPageTypeFromQueryKey(itemQueryKeys[0])
      const secondQueryKeyPageType = getPageTypeFromQueryKey(itemQueryKeys[1])
      const firstGroupIdKey = isPageTypeForGroupedItems(firstQueryKeyPageType) ? firstQueryKeyPageType.groupId : ''
      const secondGroupIdKey = isPageTypeForGroupedItems(secondQueryKeyPageType) ? secondQueryKeyPageType.groupId : ''

      expect(result.current.groupsById[firstGroupIdKey].totalCount.value).toEqual(6)
      expect(itemQueryKeys[1][3]).toEqual('next_placeholder')
      expect(result.current.groupsById[secondGroupIdKey].totalCount.value).toEqual(10)
      // check that the total counts for groups are persisted as well
      expect(result.current.queryKeysForGroups[1][3]).toEqual('next_placeholder')
      // the total count should be persisted to the placeholder
      expect(result.current.totalCount.value).toEqual(16)

      expect(result.current.queriesForGroups).toHaveLength(2) // an initial page & placeholder
      expect(Object.keys(result.current.groupsById)).toHaveLength(2)

      await waitFor(() => {
        // 2 previous calls + 3 refreshes:
        // - first page of groups (includes first page of group1)
        // - second page of group1
        // - second page of groups (includes first page of group2)
        expect(mockRequest).toHaveBeenCalledTimes(5)
      })
      await waitFor(() => {
        const queryKeys = result.current.queryKeysForGroups.concat(result.current.queryKeysForItems)
        const placeholders = queryKeys.filter(key => key[3] === 'next_placeholder')
        // there shouldn't be any placeholders left
        expect(placeholders).toHaveLength(0)
      })
      expect(afterParams).toEqual([
        ...originalAfterParams,
        null, // get first page of groups with first page of group1
        'newgroup1FirstPageEndCursor', // get second page of group1
        'newfirstPageEndCursor', // get second page of groups with first page of group2
      ])
    })

    it('invalidates inactive memex project items queries', async () => {
      seedJSONIsland('memex-columns-data', buildSystemColumns())

      // seed a single page of issues
      const issues = [issueFactory.build(), issueFactory.build()]
      seedJSONIsland('memex-paginated-items-data', {
        nodes: issues,
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
        totalCount: {value: issues.length, isApproximate: false},
      })
      const {result} = renderHook(() => usePaginatedMemexItemsQuery(), {
        wrapper: TestAppContainer,
      })

      mockResponseWithNoNextPage()
      await expect(result.current.invalidateAllQueries()).resolves.toBeUndefined()
      expect(invalidateInactiveInitialQueries).toHaveBeenCalledTimes(1)
    })
  })
})
