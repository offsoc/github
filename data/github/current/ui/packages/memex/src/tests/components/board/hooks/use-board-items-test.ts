import {renderHook} from '@testing-library/react'

import type {User} from '../../../../client/api/common-contracts'
import {formatGroupsFromServer} from '../../../../client/components/board/hooks/use-board-items'
import {createColumnModel} from '../../../../client/models/column-model'
import {MissingVerticalGroupId} from '../../../../client/models/vertical-group'
import {usePaginatedMemexItemsQuery} from '../../../../client/state-providers/memex-items/queries/use-paginated-memex-items-query'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {buildSystemColumns} from '../../../factories/columns/system-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {
  mockUseGetFieldIdsFromFilter,
  mockUseLoadRequiredFieldsForViewsAndCurrentView,
} from '../../../mocks/hooks/use-load-required-fields'
import {
  buildGroupedItemsResponse,
  buildGroupedItemsResponseWithSecondaryGroups,
} from '../../../state-providers/memex-items/query-client-api/helpers'
import {TestAppContainer} from '../../../test-app-wrapper'

describe('formatGroupsFromServer without swimlanes', () => {
  // Prevent open handle errors, otherwise we'd have to make sure that
  // we define column values for all of the items created with the issueFactory
  beforeAll(() => {
    mockUseGetFieldIdsFromFilter()
    mockUseLoadRequiredFieldsForViewsAndCurrentView()
  })

  it('should create a group for each entry in groupedItemQueries', () => {
    const systemColumns = buildSystemColumns()
    const statusColumn = systemColumns.find(c => c.id === 'Status')
    const statusDatabaseId = statusColumn?.databaseId || 0
    seedJSONIsland('memex-columns-data', systemColumns)
    seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId], visibleFields: []})])
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

    const issues = [issueFactory.build(), issueFactory.build(), issueFactory.build()]

    const group1Metadata = statusColumn?.settings?.options?.[0]
    const group2Metadata = statusColumn?.settings?.options?.[1]

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponse({
        groups: [
          {groupId: 'noValue', groupValue: '_noValue', items: [issues[0]], groupMetadata: undefined},
          {groupId: 'group1', groupValue: 'Group 1', items: [issues[1]], groupMetadata: group1Metadata},
          {groupId: 'group2', groupValue: 'Group 2', items: [issues[2]], groupMetadata: group2Metadata},
        ],
      }),
    )

    const {result: usePaginatedMemexItemsQueryResult} = renderHook(() => usePaginatedMemexItemsQuery(), {
      wrapper: TestAppContainer,
    })

    const {allItemsByVerticalGroup: formattedGroups} = formatGroupsFromServer(
      usePaginatedMemexItemsQueryResult.current.queriesForGroups,
      usePaginatedMemexItemsQueryResult.current.queriesForSecondaryGroups,
      usePaginatedMemexItemsQueryResult.current.groupedItemQueries,
      usePaginatedMemexItemsQueryResult.current.groupsById,
      undefined,
      false,
    )

    expect(Object.keys(formattedGroups)).toHaveLength(3)
    const noValueGroup = formattedGroups[MissingVerticalGroupId]
    expect(noValueGroup.groupId).toBe('noValue')
    expect(noValueGroup.totalCount).toBe(1)
    expect(noValueGroup.items).toHaveLength(1)
    expect(noValueGroup.items[0].id).toBe(issues[0].id)

    const group1 = formattedGroups[group1Metadata?.id || '']
    expect(group1.groupId).toBe('group1')
    expect(group1.totalCount).toBe(1)
    expect(group1.items).toHaveLength(1)
    expect(group1.items[0].id).toBe(issues[1].id)

    const group2 = formattedGroups[group2Metadata?.id || '']
    expect(group2.groupId).toBe('group2')
    expect(group2.totalCount).toBe(1)
    expect(group2.items).toHaveLength(1)
    expect(group2.items[0].id).toBe(issues[2].id)
  })

  it('should create a group for each entry in groupedItemQueries using the useServerGroupId', () => {
    const systemColumns = buildSystemColumns()
    const statusColumn = systemColumns.find(c => c.id === 'Status')
    const statusDatabaseId = statusColumn?.databaseId || 0
    seedJSONIsland('memex-columns-data', systemColumns)
    seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId], visibleFields: []})])
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

    const issues = [issueFactory.build(), issueFactory.build(), issueFactory.build()]

    const group1Metadata = statusColumn?.settings?.options?.[0]
    const group2Metadata = statusColumn?.settings?.options?.[1]

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponse({
        groups: [
          {groupId: 'noValue', groupValue: '_noValue', items: [issues[0]], groupMetadata: undefined},
          {groupId: 'group1', groupValue: 'Group 1', items: [issues[1]], groupMetadata: group1Metadata},
          {groupId: 'group2', groupValue: 'Group 2', items: [issues[2]], groupMetadata: group2Metadata},
        ],
      }),
    )

    const {result: usePaginatedMemexItemsQueryResult} = renderHook(() => usePaginatedMemexItemsQuery(), {
      wrapper: TestAppContainer,
    })

    const {allItemsByVerticalGroup: formattedGroups} = formatGroupsFromServer(
      usePaginatedMemexItemsQueryResult.current.queriesForGroups,
      usePaginatedMemexItemsQueryResult.current.queriesForSecondaryGroups,
      usePaginatedMemexItemsQueryResult.current.groupedItemQueries,
      usePaginatedMemexItemsQueryResult.current.groupsById,
      undefined,
      true,
    )

    expect(Object.keys(formattedGroups)).toHaveLength(3)
    const noValueGroup = formattedGroups[MissingVerticalGroupId]
    expect(noValueGroup.groupId).toBe('noValue')
    expect(noValueGroup.totalCount).toBe(1)
    expect(noValueGroup.items).toHaveLength(1)
    expect(noValueGroup.items[0].id).toBe(issues[0].id)

    const group1 = formattedGroups['group1']
    expect(group1.groupId).toBe('group1')
    expect(group1.totalCount).toBe(1)
    expect(group1.items).toHaveLength(1)
    expect(group1.items[0].id).toBe(issues[1].id)

    const group2 = formattedGroups['group2']
    expect(group2.groupId).toBe('group2')
    expect(group2.totalCount).toBe(1)
    expect(group2.items).toHaveLength(1)
    expect(group2.items[0].id).toBe(issues[2].id)
  })
})

describe('formatGroupsFromServer with swimlanes', () => {
  // Prevent open handle errors, otherwise we'd have to make sure that
  // we define column values for all of the items created with the issueFactory
  beforeAll(() => {
    mockUseGetFieldIdsFromFilter()
    mockUseLoadRequiredFieldsForViewsAndCurrentView()
  })

  it('creates horizontal groups and allItemsByVerticalGroup', () => {
    const systemColumns = buildSystemColumns()
    const statusColumn = systemColumns.find(c => c.id === 'Status')
    const statusDatabaseId = statusColumn?.databaseId || 0
    const assigneesColumn = systemColumns.find(c => c.id === 'Assignees')
    const assigneesDatabaseId = assigneesColumn?.databaseId || 0
    seedJSONIsland('memex-columns-data', systemColumns)
    seedJSONIsland('memex-views', [
      viewFactory.build({groupBy: [statusDatabaseId], verticalGroupBy: [assigneesDatabaseId], visibleFields: []}),
    ])
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_swimlanes'])

    const issues = [
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
    ]

    const group1Metadata = statusColumn?.settings?.options?.[0]
    const group2Metadata = statusColumn?.settings?.options?.[1]

    const secondaryGroup1Metadata: User = {
      avatarUrl: '',
      global_relay_id: '',
      id: 1,
      isSpammy: false,
      login: 'user1',
      name: 'User 1',
    }

    const secondaryGroup2Metadata: User = {
      avatarUrl: '',
      global_relay_id: '',
      id: 2,
      isSpammy: false,
      login: 'user2',
      name: 'User 2',
    }

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            groupId: 'noValuePrimary',
            groupValue: '_noValue',
            nestedItems: [
              {secondaryGroupId: 'noValueSecondary', items: [issues[0]]},
              {secondaryGroupId: 'secondaryGroup1', items: [issues[1]]},
              {secondaryGroupId: 'secondaryGroup2', items: [issues[2]]},
            ],
            groupMetadata: undefined,
          },
          {
            groupId: 'group1',
            groupValue: 'Group 1',
            nestedItems: [
              {secondaryGroupId: 'noValueSecondary', items: [issues[3]]},
              {secondaryGroupId: 'secondaryGroup1', items: [issues[4]]},
              {secondaryGroupId: 'secondaryGroup2', items: [issues[5]]},
            ],
            groupMetadata: group1Metadata,
          },
          {
            groupId: 'group2',
            groupValue: 'Group 2',
            nestedItems: [
              {secondaryGroupId: 'noValueSecondary', items: [issues[6]]},
              {secondaryGroupId: 'secondaryGroup1', items: [issues[7]]},
              {secondaryGroupId: 'secondaryGroup2', items: [issues[8]]},
            ],
            groupMetadata: group2Metadata,
          },
        ],
        secondaryGroups: [
          {
            groupId: 'noValueSecondary',
            groupValue: '_noValue',
          },
          {
            groupId: 'secondaryGroup1',
            groupValue: 'Secondary Group 1',
            groupMetadata: secondaryGroup1Metadata,
          },
          {
            groupId: 'secondaryGroup2',
            groupValue: 'Secondary Group 2',
            groupMetadata: secondaryGroup2Metadata,
          },
        ],
      }),
    )

    const {result: usePaginatedMemexItemsQueryResult} = renderHook(() => usePaginatedMemexItemsQuery(), {
      wrapper: TestAppContainer,
    })

    const {allItemsByVerticalGroup, horizontalGroups} = formatGroupsFromServer(
      usePaginatedMemexItemsQueryResult.current.queriesForGroups,
      usePaginatedMemexItemsQueryResult.current.queriesForSecondaryGroups,
      usePaginatedMemexItemsQueryResult.current.groupedItemQueries,
      usePaginatedMemexItemsQueryResult.current.groupsById,
      createColumnModel(assigneesColumn!),
      false,
    )

    expect(Object.keys(allItemsByVerticalGroup)).toHaveLength(3)
    const noValuePrimaryGroup = allItemsByVerticalGroup[MissingVerticalGroupId]
    expect(noValuePrimaryGroup.groupId).toBe('noValuePrimary')
    expect(noValuePrimaryGroup.totalCount).toBe(3)
    expect(noValuePrimaryGroup.items).toHaveLength(3)
    expect(noValuePrimaryGroup.items[0].id).toBe(issues[0].id)
    expect(noValuePrimaryGroup.items[1].id).toBe(issues[1].id)
    expect(noValuePrimaryGroup.items[2].id).toBe(issues[2].id)

    const group1 = allItemsByVerticalGroup[group1Metadata?.id || '']
    expect(group1.groupId).toBe('group1')
    expect(group1.totalCount).toBe(3)
    expect(group1.items).toHaveLength(3)
    expect(group1.items[0].id).toBe(issues[3].id)
    expect(group1.items[1].id).toBe(issues[4].id)
    expect(group1.items[2].id).toBe(issues[5].id)

    const group2 = allItemsByVerticalGroup[group2Metadata?.id || '']
    expect(group2.groupId).toBe('group2')
    expect(group2.totalCount).toBe(3)
    expect(group2.items).toHaveLength(3)
    expect(group2.items[0].id).toBe(issues[6].id)
    expect(group2.items[1].id).toBe(issues[7].id)
    expect(group2.items[2].id).toBe(issues[8].id)

    expect(horizontalGroups).toHaveLength(3)

    const noValueSecondaryGroup = horizontalGroups[0]
    expect(noValueSecondaryGroup.isCollapsed).toBeFalsy()
    expect(noValueSecondaryGroup.value).toBe('_noValue')
    expect(noValueSecondaryGroup.rows).toHaveLength(3)
    expect(noValueSecondaryGroup.rows[0].id).toBe(issues[0].id)
    expect(noValueSecondaryGroup.rows[1].id).toBe(issues[3].id)
    expect(noValueSecondaryGroup.rows[2].id).toBe(issues[6].id)
    expect(noValueSecondaryGroup.sourceObject.kind).toBe('empty')
    expect(Object.keys(noValueSecondaryGroup.itemsByVerticalGroup)).toHaveLength(3)
    expect(noValueSecondaryGroup.itemsByVerticalGroup[MissingVerticalGroupId].items[0].id).toBe(issues[0].id)
    expect(noValueSecondaryGroup.itemsByVerticalGroup[group1Metadata?.id || ''].items[0].id).toBe(issues[3].id)
    expect(noValueSecondaryGroup.itemsByVerticalGroup[group2Metadata?.id || ''].items[0].id).toBe(issues[6].id)

    const secondaryGroup1 = horizontalGroups[1]
    expect(secondaryGroup1.isCollapsed).toBeFalsy()
    expect(secondaryGroup1.value).toBe('Secondary Group 1')
    expect(secondaryGroup1.rows).toHaveLength(3)
    expect(secondaryGroup1.rows[0].id).toBe(issues[1].id)
    expect(secondaryGroup1.rows[1].id).toBe(issues[4].id)
    expect(secondaryGroup1.rows[2].id).toBe(issues[7].id)
    expect(secondaryGroup1.sourceObject.kind).toBe('group')
    expect(secondaryGroup1.sourceObject.value).toEqual([secondaryGroup1Metadata])
    expect(Object.keys(secondaryGroup1.itemsByVerticalGroup)).toHaveLength(3)
    expect(secondaryGroup1.itemsByVerticalGroup[MissingVerticalGroupId].items[0].id).toBe(issues[1].id)
    expect(secondaryGroup1.itemsByVerticalGroup[group1Metadata?.id || ''].items[0].id).toBe(issues[4].id)
    expect(secondaryGroup1.itemsByVerticalGroup[group2Metadata?.id || ''].items[0].id).toBe(issues[7].id)

    const secondaryGroup2 = horizontalGroups[2]
    expect(secondaryGroup2.isCollapsed).toBeFalsy()
    expect(secondaryGroup2.value).toBe('Secondary Group 2')
    expect(secondaryGroup2.rows).toHaveLength(3)
    expect(secondaryGroup2.rows[0].id).toBe(issues[2].id)
    expect(secondaryGroup2.rows[1].id).toBe(issues[5].id)
    expect(secondaryGroup2.rows[2].id).toBe(issues[8].id)
    expect(secondaryGroup2.sourceObject.kind).toBe('group')
    expect(secondaryGroup2.sourceObject.value).toEqual([secondaryGroup2Metadata])
    expect(Object.keys(secondaryGroup2.itemsByVerticalGroup)).toHaveLength(3)
    expect(secondaryGroup2.itemsByVerticalGroup[MissingVerticalGroupId].items[0].id).toBe(issues[2].id)
    expect(secondaryGroup2.itemsByVerticalGroup[group1Metadata?.id || ''].items[0].id).toBe(issues[5].id)
    expect(secondaryGroup2.itemsByVerticalGroup[group2Metadata?.id || ''].items[0].id).toBe(issues[8].id)
  })

  it('creates horizontal groups and allItemsByVerticalGroup using the useServerGroupId', () => {
    const systemColumns = buildSystemColumns()
    const statusColumn = systemColumns.find(c => c.id === 'Status')
    const statusDatabaseId = statusColumn?.databaseId || 0
    const assigneesColumn = systemColumns.find(c => c.id === 'Assignees')
    const assigneesDatabaseId = assigneesColumn?.databaseId || 0
    seedJSONIsland('memex-columns-data', systemColumns)
    seedJSONIsland('memex-views', [
      viewFactory.build({groupBy: [statusDatabaseId], verticalGroupBy: [assigneesDatabaseId], visibleFields: []}),
    ])
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits', 'memex_mwl_swimlanes'])

    const issues = [
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
      issueFactory.build(),
    ]

    const group1Metadata = statusColumn?.settings?.options?.[0]
    const group2Metadata = statusColumn?.settings?.options?.[1]

    const secondaryGroup1Metadata: User = {
      avatarUrl: '',
      global_relay_id: '',
      id: 1,
      isSpammy: false,
      login: 'user1',
      name: 'User 1',
    }

    const secondaryGroup2Metadata: User = {
      avatarUrl: '',
      global_relay_id: '',
      id: 2,
      isSpammy: false,
      login: 'user2',
      name: 'User 2',
    }

    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponseWithSecondaryGroups({
        groups: [
          {
            groupId: 'noValuePrimary',
            groupValue: '_noValue',
            nestedItems: [
              {secondaryGroupId: 'noValueSecondary', items: [issues[0]]},
              {secondaryGroupId: 'secondaryGroup1', items: [issues[1]]},
              {secondaryGroupId: 'secondaryGroup2', items: [issues[2]]},
            ],
            groupMetadata: undefined,
          },
          {
            groupId: 'group1',
            groupValue: 'Group 1',
            nestedItems: [
              {secondaryGroupId: 'noValueSecondary', items: [issues[3]]},
              {secondaryGroupId: 'secondaryGroup1', items: [issues[4]]},
              {secondaryGroupId: 'secondaryGroup2', items: [issues[5]]},
            ],
            groupMetadata: group1Metadata,
          },
          {
            groupId: 'group2',
            groupValue: 'Group 2',
            nestedItems: [
              {secondaryGroupId: 'noValueSecondary', items: [issues[6]]},
              {secondaryGroupId: 'secondaryGroup1', items: [issues[7]]},
              {secondaryGroupId: 'secondaryGroup2', items: [issues[8]]},
            ],
            groupMetadata: group2Metadata,
          },
        ],
        secondaryGroups: [
          {
            groupId: 'noValueSecondary',
            groupValue: '_noValue',
          },
          {
            groupId: 'secondaryGroup1',
            groupValue: 'Secondary Group 1',
            groupMetadata: secondaryGroup1Metadata,
          },
          {
            groupId: 'secondaryGroup2',
            groupValue: 'Secondary Group 2',
            groupMetadata: secondaryGroup2Metadata,
          },
        ],
      }),
    )

    const {result: usePaginatedMemexItemsQueryResult} = renderHook(() => usePaginatedMemexItemsQuery(), {
      wrapper: TestAppContainer,
    })

    const {allItemsByVerticalGroup, horizontalGroups} = formatGroupsFromServer(
      usePaginatedMemexItemsQueryResult.current.queriesForGroups,
      usePaginatedMemexItemsQueryResult.current.queriesForSecondaryGroups,
      usePaginatedMemexItemsQueryResult.current.groupedItemQueries,
      usePaginatedMemexItemsQueryResult.current.groupsById,
      createColumnModel(assigneesColumn!),
      true,
    )

    expect(Object.keys(allItemsByVerticalGroup)).toHaveLength(3)
    const noValuePrimaryGroup = allItemsByVerticalGroup[MissingVerticalGroupId]
    expect(noValuePrimaryGroup.groupId).toBe('noValuePrimary')
    expect(noValuePrimaryGroup.totalCount).toBe(3)
    expect(noValuePrimaryGroup.items).toHaveLength(3)
    expect(noValuePrimaryGroup.items[0].id).toBe(issues[0].id)
    expect(noValuePrimaryGroup.items[1].id).toBe(issues[1].id)
    expect(noValuePrimaryGroup.items[2].id).toBe(issues[2].id)

    const group1 = allItemsByVerticalGroup['group1']
    expect(group1.groupId).toBe('group1')
    expect(group1.totalCount).toBe(3)
    expect(group1.items).toHaveLength(3)
    expect(group1.items[0].id).toBe(issues[3].id)
    expect(group1.items[1].id).toBe(issues[4].id)
    expect(group1.items[2].id).toBe(issues[5].id)

    const group2 = allItemsByVerticalGroup['group2']
    expect(group2.groupId).toBe('group2')
    expect(group2.totalCount).toBe(3)
    expect(group2.items).toHaveLength(3)
    expect(group2.items[0].id).toBe(issues[6].id)
    expect(group2.items[1].id).toBe(issues[7].id)
    expect(group2.items[2].id).toBe(issues[8].id)

    expect(horizontalGroups).toHaveLength(3)

    const noValueSecondaryGroup = horizontalGroups[0]
    expect(noValueSecondaryGroup.isCollapsed).toBeFalsy()
    expect(noValueSecondaryGroup.value).toBe('_noValue')
    expect(noValueSecondaryGroup.rows).toHaveLength(3)
    expect(noValueSecondaryGroup.rows[0].id).toBe(issues[0].id)
    expect(noValueSecondaryGroup.rows[1].id).toBe(issues[3].id)
    expect(noValueSecondaryGroup.rows[2].id).toBe(issues[6].id)
    expect(noValueSecondaryGroup.sourceObject.kind).toBe('empty')
    expect(Object.keys(noValueSecondaryGroup.itemsByVerticalGroup)).toHaveLength(3)
    expect(noValueSecondaryGroup.itemsByVerticalGroup[MissingVerticalGroupId].items[0].id).toBe(issues[0].id)
    expect(noValueSecondaryGroup.itemsByVerticalGroup['group1'].items[0].id).toBe(issues[3].id)
    expect(noValueSecondaryGroup.itemsByVerticalGroup['group2'].items[0].id).toBe(issues[6].id)

    const secondaryGroup1 = horizontalGroups[1]
    expect(secondaryGroup1.isCollapsed).toBeFalsy()
    expect(secondaryGroup1.value).toBe('Secondary Group 1')
    expect(secondaryGroup1.rows).toHaveLength(3)
    expect(secondaryGroup1.rows[0].id).toBe(issues[1].id)
    expect(secondaryGroup1.rows[1].id).toBe(issues[4].id)
    expect(secondaryGroup1.rows[2].id).toBe(issues[7].id)
    expect(secondaryGroup1.sourceObject.kind).toBe('group')
    expect(secondaryGroup1.sourceObject.value).toEqual([secondaryGroup1Metadata])
    expect(Object.keys(secondaryGroup1.itemsByVerticalGroup)).toHaveLength(3)
    expect(secondaryGroup1.itemsByVerticalGroup[MissingVerticalGroupId].items[0].id).toBe(issues[1].id)
    expect(secondaryGroup1.itemsByVerticalGroup['group1'].items[0].id).toBe(issues[4].id)
    expect(secondaryGroup1.itemsByVerticalGroup['group2'].items[0].id).toBe(issues[7].id)

    const secondaryGroup2 = horizontalGroups[2]
    expect(secondaryGroup2.isCollapsed).toBeFalsy()
    expect(secondaryGroup2.value).toBe('Secondary Group 2')
    expect(secondaryGroup2.rows).toHaveLength(3)
    expect(secondaryGroup2.rows[0].id).toBe(issues[2].id)
    expect(secondaryGroup2.rows[1].id).toBe(issues[5].id)
    expect(secondaryGroup2.rows[2].id).toBe(issues[8].id)
    expect(secondaryGroup2.sourceObject.kind).toBe('group')
    expect(secondaryGroup2.sourceObject.value).toEqual([secondaryGroup2Metadata])
    expect(Object.keys(secondaryGroup2.itemsByVerticalGroup)).toHaveLength(3)
    expect(secondaryGroup2.itemsByVerticalGroup[MissingVerticalGroupId].items[0].id).toBe(issues[2].id)
    expect(secondaryGroup2.itemsByVerticalGroup['group1'].items[0].id).toBe(issues[5].id)
    expect(secondaryGroup2.itemsByVerticalGroup['group2'].items[0].id).toBe(issues[8].id)
  })
})
