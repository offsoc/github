import type {GroupMetadata} from '../../../../client/api/memex-items/paginated-views'
import {
  buildMemexGroupsQueryKey,
  buildMemexSecondaryGroupsQueryKey,
  type GroupId,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import {
  type MemexGroupsPageQueryData,
  pageParamForInitialPage,
  type PaginatedGroupQueryData,
  type PaginatedMemexItemsQueryVariables,
} from '../../../../client/state-providers/memex-items/queries/types'
import {
  buildGroupValuesFromQueryData,
  getQueryDataForMemexGroupsPage,
  getQueryDataForMemexSecondaryGroupsPage,
  setQueryDataForMemexGroupsPage,
  setQueryDataForMemexSecondaryGroupsPage,
  updateGroupMetadata,
  updateGroupPosition,
} from '../../../../client/state-providers/memex-items/query-client-api/memex-groups'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {activateQueryByQueryKey, initQueryClient} from './helpers'

describe('query-client-api Memex groups', () => {
  describe('getQueryDataForMemexGroupsPage', () => {
    it('returns data for a page of multiple groups from query client', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}
      const expectedPageData: MemexGroupsPageQueryData = {
        groups: [
          {groupId: 'group1', groupValue: 'group1Name'},
          {groupId: 'group2', groupValue: 'group2Name'},
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }

      const queryKey = buildMemexGroupsQueryKey(variables, pageParamForInitialPage)
      queryClient.setQueryData(queryKey, expectedPageData)

      const returnedPageData = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage)
      expect(returnedPageData).toEqual(expectedPageData)
    })
  })

  describe('setQueryDataForMemexGroupsPage', () => {
    it('updates data for a page of multiple groups in query client', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}
      const expectedPageData: MemexGroupsPageQueryData = {
        groups: [
          {groupId: 'group1', groupValue: 'group1Name'},
          {groupId: 'group2', groupValue: 'group2Name'},
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }

      setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage, expectedPageData)

      const returnedPageData = queryClient.getQueryData(buildMemexGroupsQueryKey(variables, pageParamForInitialPage))
      expect(returnedPageData).toEqual(expectedPageData)
    })
  })

  describe('getQueryDataForMemexSecondaryGroupsPage', () => {
    it('returns data for a page of multiple groups from query client', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}
      const expectedPageData: MemexGroupsPageQueryData = {
        groups: [
          {groupId: 'group1', groupValue: 'group1Name'},
          {groupId: 'group2', groupValue: 'group2Name'},
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }

      const queryKey = buildMemexSecondaryGroupsQueryKey(variables, pageParamForInitialPage)
      queryClient.setQueryData(queryKey, expectedPageData)

      const returnedPageData = getQueryDataForMemexSecondaryGroupsPage(queryClient, variables, pageParamForInitialPage)
      expect(returnedPageData).toEqual(expectedPageData)
    })
  })

  describe('setQueryDataForMemexSecondaryGroupsPage', () => {
    it('updates data for a page of multiple secondary groups in query client', () => {
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}
      const expectedPageData: MemexGroupsPageQueryData = {
        groups: [
          {groupId: 'secondaryGroup1', groupValue: 'secondaryGroup1Name'},
          {groupId: 'secondaryGroup2', groupValue: 'secondaryGroup2Name'},
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }

      setQueryDataForMemexSecondaryGroupsPage(queryClient, variables, pageParamForInitialPage, expectedPageData)

      const returnedPageData = queryClient.getQueryData(
        buildMemexSecondaryGroupsQueryKey(variables, pageParamForInitialPage),
      )
      expect(returnedPageData).toEqual(expectedPageData)
    })
  })

  describe('buildGroupValuesFromQueryData', () => {
    it('builds an object based on groups and only considers active queries', () => {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])
      const queryClient = initQueryClient()

      const inactiveVariables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Assignees'}
      const inactiveQueryKey = buildMemexGroupsQueryKey(inactiveVariables, {
        after: 'firstPageEndCursor',
      })
      const inactivePageData: MemexGroupsPageQueryData = {
        groups: [
          {groupId: 'group1', groupValue: 'Inactive Group 1'},
          {groupId: 'group2', groupValue: 'Inactive Group 2'},
          {groupId: 'group3', groupValue: 'Inactive Group 3'},
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }
      queryClient.setQueryData(inactiveQueryKey, inactivePageData)

      const activeVariables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}
      const activePageData: MemexGroupsPageQueryData = {
        groups: [
          {groupId: 'group1', groupValue: 'Active Group 1'},
          {groupId: 'group2', groupValue: 'Active Group 2'},
          {groupId: 'group4', groupValue: 'Active Group 4'},
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }
      const activeQueryKey = buildMemexGroupsQueryKey(activeVariables, pageParamForInitialPage)
      queryClient.setQueryData(activeQueryKey, activePageData)
      activateQueryByQueryKey(queryClient, activeQueryKey)

      const groupValues = buildGroupValuesFromQueryData(queryClient)
      expect(groupValues['group1']).toBe('Active Group 1')
      expect(groupValues['group2']).toBe('Active Group 2')
      expect(groupValues['group3']).not.toBeDefined()
      expect(groupValues['group4']).toBe('Active Group 4')
      expect(Object.keys(groupValues)).toHaveLength(3)
    })
  })

  describe('updateGroupMetadata', () => {
    it('updates group with new data in queryClient', () => {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_server_group_order'])
      const queryClient = initQueryClient()

      const newGroupMetadata = {
        id: 'group1',
        color: 'RED',
        name: 'New Group Name',
        nameHtml: 'New Group Name',
        description: 'New Description',
        descriptionHtml: 'New Description',
      }

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}

      const initialPageData: MemexGroupsPageQueryData = {
        groups: [
          {
            groupId: 'serverGroupId1',
            groupValue: 'Group 1',
            groupMetadata: {
              id: 'group1',
              color: 'RED',
              name: 'Group 1',
              nameHtml: 'Group 1',
              description: '',
              descriptionHtml: '',
            },
          },
          {
            groupId: 'serverGroupId2',
            groupValue: 'Group 2',
            groupMetadata: {
              id: 'group2',
              color: 'BLUE',
              name: 'Group 2',
              nameHtml: '',
              description: '',
              descriptionHtml: '',
            },
          },
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }
      const expectedUpdatedGroup = {
        ...initialPageData.groups[0],
        groupValue: newGroupMetadata.name,
        groupMetadata: newGroupMetadata,
      }

      const queryKey = buildMemexGroupsQueryKey(variables, pageParamForInitialPage)
      queryClient.setQueryData(queryKey, initialPageData)
      activateQueryByQueryKey(queryClient, queryKey)

      updateGroupMetadata(queryClient, newGroupMetadata as GroupMetadata, newGroupMetadata.name)

      const updatedData = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage)
      expect(updatedData?.groups[0]).toEqual(expectedUpdatedGroup)
      expect(updatedData?.groups[1]).toEqual(initialPageData.groups[1])
    })

    it('does not updates group with new data due to group not existing', () => {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_server_group_order'])
      const queryClient = initQueryClient()

      const newGroupMetadata = {
        id: 'doesNotExist',
        color: 'RED',
        name: 'New Group Name',
        nameHtml: 'New Group Name',
        description: 'New Description',
        descriptionHtml: 'New Description',
      }

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}

      const intitialPageData: MemexGroupsPageQueryData = {
        groups: [
          {
            groupId: 'serverGroupId1',
            groupValue: 'group1',
            groupMetadata: {
              id: 'group1',
              color: 'RED',
              name: 'Group 1',
              nameHtml: 'Group 1',
              description: '',
              descriptionHtml: '',
            },
          },
          {
            groupId: 'serverGroupId2',
            groupValue: 'group2',
            groupMetadata: {
              id: 'group2',
              color: 'BLUE',
              name: 'Group 2',
              nameHtml: '',
              description: '',
              descriptionHtml: '',
            },
          },
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }

      const queryKey = buildMemexGroupsQueryKey(variables, pageParamForInitialPage)
      queryClient.setQueryData(queryKey, intitialPageData)
      activateQueryByQueryKey(queryClient, queryKey)

      updateGroupMetadata(queryClient, newGroupMetadata as GroupMetadata, newGroupMetadata.name)

      const returnedData = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage)
      expect(returnedData).toBe(intitialPageData)
    })
  })

  describe('updateGroupPosition', () => {
    it('moves group to new position', () => {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_server_group_order'])
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}

      const initialPageData: MemexGroupsPageQueryData = {
        groups: [
          {
            groupId: 'serverGroupId1',
            groupValue: 'Group 1',
            groupMetadata: {
              id: 'group1',
              color: 'RED',
              name: 'Group 1',
              nameHtml: 'Group 1',
              description: '',
              descriptionHtml: '',
            },
          },
          {
            groupId: 'serverGroupId2',
            groupValue: 'Group 2',
            groupMetadata: {
              id: 'group2',
              color: 'BLUE',
              name: 'Group 2',
              nameHtml: '',
              description: '',
              descriptionHtml: '',
            },
          },
          {
            groupId: 'serverGroupId3',
            groupValue: 'group3',
            groupMetadata: {
              id: 'group3',
              color: 'PURPLE',
              name: 'Group 3',
              nameHtml: '',
              description: '',
              descriptionHtml: '',
            },
          },
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }

      const expectedUpdatedGroups = [initialPageData.groups[1], initialPageData.groups[0], initialPageData.groups[2]]

      const queryKey = buildMemexGroupsQueryKey(variables, pageParamForInitialPage)
      queryClient.setQueryData(queryKey, initialPageData)
      activateQueryByQueryKey(queryClient, queryKey)

      updateGroupPosition(
        queryClient,
        initialPageData.groups[0].groupMetadata as GroupMetadata,
        initialPageData.groups[2].groupMetadata?.id as GroupId,
        false,
      )

      const returnedData = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage)
      expect(returnedData?.groups).toStrictEqual(expectedUpdatedGroups)
    })

    it('moves group to new position at the end of the list of options', () => {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_server_group_order'])
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}

      const initialPageData: MemexGroupsPageQueryData = {
        groups: [
          {
            groupId: 'serverGroupId1',
            groupValue: 'Group 1',
            groupMetadata: {
              id: 'group1',
              color: 'RED',
              name: 'Group 1',
              nameHtml: 'Group 1',
              description: '',
              descriptionHtml: '',
            },
          },
          {
            groupId: 'serverGroupId2',
            groupValue: 'Group 2',
            groupMetadata: {
              id: 'group2',
              color: 'BLUE',
              name: 'Group 2',
              nameHtml: '',
              description: '',
              descriptionHtml: '',
            },
          },
          {
            groupId: 'serverGroupId3',
            groupValue: 'group3',
            groupMetadata: {
              id: 'group3',
              color: 'PURPLE',
              name: 'Group 3',
              nameHtml: '',
              description: '',
              descriptionHtml: '',
            },
          },
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }

      const expectedUpdatedGroups = [initialPageData.groups[1], initialPageData.groups[2], initialPageData.groups[0]]

      const queryKey = buildMemexGroupsQueryKey(variables, pageParamForInitialPage)
      queryClient.setQueryData(queryKey, initialPageData)
      activateQueryByQueryKey(queryClient, queryKey)

      updateGroupPosition(
        queryClient,
        initialPageData.groups[0].groupMetadata as GroupMetadata,
        initialPageData.groups[2].groupMetadata?.id as GroupId,
        true,
      )

      const returnedData = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage)
      expect(returnedData?.groups).toStrictEqual(expectedUpdatedGroups)
    })

    it('moves group to new position between different pages', () => {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_server_group_order'])
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}

      const group1: PaginatedGroupQueryData = {
        groupId: 'serverGroupId1',
        groupValue: 'Group 1',
        groupMetadata: {
          id: 'group1',
          color: 'RED',
          name: 'Group 1',
          nameHtml: 'Group 1',
          description: '',
          descriptionHtml: '',
        },
      }

      const group2: PaginatedGroupQueryData = {
        groupId: 'serverGroupId2',
        groupValue: 'Group 2',
        groupMetadata: {
          id: 'group2',
          color: 'BLUE',
          name: 'Group 2',
          nameHtml: '',
          description: '',
          descriptionHtml: '',
        },
      }

      const group3: PaginatedGroupQueryData = {
        groupId: 'serverGroupId3',
        groupValue: 'group3',
        groupMetadata: {
          id: 'group3',
          color: 'PURPLE',
          name: 'Group 3',
          nameHtml: '',
          description: '',
          descriptionHtml: '',
        },
      }

      const initialPageData: MemexGroupsPageQueryData = {
        groups: [group1, group2],
        pageInfo: {hasNextPage: true, hasPreviousPage: false, endCursor: 'endCursorForSecondPageOfGroup2'},
      }

      const secondPageData: MemexGroupsPageQueryData = {
        groups: [group3],
        pageInfo: {hasNextPage: false, hasPreviousPage: true, startCursor: 'endCursorForSecondPageOfGroup2'},
      }

      const queryKey = buildMemexGroupsQueryKey(variables, pageParamForInitialPage)
      const secondPageQueryKey = buildMemexGroupsQueryKey(variables, {after: 'endCursorForSecondPageOfGroup2'})
      queryClient.setQueryData(queryKey, initialPageData)
      queryClient.setQueryData(secondPageQueryKey, secondPageData)
      activateQueryByQueryKey(queryClient, queryKey)
      activateQueryByQueryKey(queryClient, secondPageQueryKey)

      updateGroupPosition(
        queryClient,
        group1.groupMetadata as GroupMetadata,
        group3.groupMetadata?.id as GroupId,
        false,
      )

      const expectedFirstPageGroup = [group2]
      const expectedSecondPageGroup = [group1, group3]

      const returnedFirstPageData = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage)
      expect(returnedFirstPageData?.groups).toStrictEqual(expectedFirstPageGroup)

      const returnedSecondPageData = getQueryDataForMemexGroupsPage(queryClient, variables, {
        after: 'endCursorForSecondPageOfGroup2',
      })
      expect(returnedSecondPageData?.groups).toStrictEqual(expectedSecondPageGroup)
    })

    it('does not update if group could not be found', () => {
      seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_server_group_order'])
      const queryClient = initQueryClient()

      const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}

      const groupMetadata = {
        id: 'doesNotExist',
        color: 'RED',
        name: 'New Group Name',
        nameHtml: 'New Group Name',
        description: 'New Description',
        descriptionHtml: 'New Description',
      }

      const initialPageData: MemexGroupsPageQueryData = {
        groups: [
          {
            groupId: 'serverGroupId1',
            groupValue: 'Group 1',
            groupMetadata: {
              id: 'group1',
              color: 'RED',
              name: 'Group 1',
              nameHtml: 'Group 1',
              description: '',
              descriptionHtml: '',
            },
          },
          {
            groupId: 'serverGroupId2',
            groupValue: 'Group 2',
            groupMetadata: {
              id: 'group2',
              color: 'BLUE',
              name: 'Group 2',
              nameHtml: '',
              description: '',
              descriptionHtml: '',
            },
          },
          {
            groupId: 'serverGroupId3',
            groupValue: 'group3',
            groupMetadata: {
              id: 'group3',
              color: 'PURPLE',
              name: 'Group 3',
              nameHtml: '',
              description: '',
              descriptionHtml: '',
            },
          },
        ],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
      }

      const queryKey = buildMemexGroupsQueryKey(variables, pageParamForInitialPage)
      queryClient.setQueryData(queryKey, initialPageData)
      activateQueryByQueryKey(queryClient, queryKey)

      updateGroupPosition(
        queryClient,
        groupMetadata as GroupMetadata,
        initialPageData.groups[2].groupMetadata?.id as GroupId,
        true,
      )

      const returnedData = getQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage)
      expect(returnedData).toBe(initialPageData)
    })
  })

  it('uses secondary groups if they exist', () => {
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])
    const queryClient = initQueryClient()

    const variables: PaginatedMemexItemsQueryVariables = {horizontalGroupedByColumnId: 'Status'}
    const groupsPageData: MemexGroupsPageQueryData = {
      groups: [
        {groupId: 'group1', groupValue: 'Group 1'},
        {groupId: 'group2', groupValue: 'Group 2'},
      ],
      pageInfo: {hasNextPage: false, hasPreviousPage: false},
    }
    const groupsQueryKey = buildMemexGroupsQueryKey(variables, pageParamForInitialPage)
    queryClient.setQueryData(groupsQueryKey, groupsPageData)
    activateQueryByQueryKey(queryClient, groupsQueryKey)

    const secondaryGroupsPageData: MemexGroupsPageQueryData = {
      groups: [
        {groupId: 'secondaryGroup1', groupValue: 'Secondary Group 1'},
        {groupId: 'secondaryGroup2', groupValue: 'Secondary Group 2'},
      ],
      pageInfo: {hasNextPage: false, hasPreviousPage: false},
    }
    const secondaryGroupsQueryKey = buildMemexSecondaryGroupsQueryKey(variables, pageParamForInitialPage)
    queryClient.setQueryData(secondaryGroupsQueryKey, secondaryGroupsPageData)
    activateQueryByQueryKey(queryClient, secondaryGroupsQueryKey)

    const groupValues = buildGroupValuesFromQueryData(queryClient)
    expect(groupValues['group1']).toBe('Group 1')
    expect(groupValues['group2']).toBe('Group 2')
    expect(groupValues['secondaryGroup1']).toBe('Secondary Group 1')
    expect(groupValues['secondaryGroup2']).toBe('Secondary Group 2')
    expect(Object.keys(groupValues)).toHaveLength(4)
  })
})
