import type {UseQueryResult} from '@tanstack/react-query'
import {useMemo} from 'react'

import type {ColumnData} from '../../../api/columns/contracts/storage'
import {NO_GROUP_VALUE} from '../../../api/memex-items/contracts'
import {useFilteredItems} from '../../../features/filtering/hooks/use-filtered-items'
import {getGroupByFieldId} from '../../../features/grouping/get-group-by-field'
import {getGroupingMetadataFromServerGroupValue} from '../../../features/grouping/get-grouping-metadata'
import {buildGroupingConfiguration} from '../../../features/grouping/grouping-metadata-configurations'
import {useHorizontalGroupedBy} from '../../../features/grouping/hooks/use-horizontal-grouped-by'
import {useVerticalGroups} from '../../../features/grouping/hooks/use-vertical-groups'
import {useSortedItems} from '../../../features/sorting/hooks/use-sorted-items'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useViews} from '../../../hooks/use-views'
import type {ColumnModel} from '../../../models/column-model'
import type {
  GroupedHorizontalGroup,
  HorizontalGroup,
  HorizontalGrouping,
  ItemDataForVerticalColumn,
  ItemsGroupedByVerticalColumn,
} from '../../../models/horizontal-group'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {
  canVerticalGroup,
  MissingVerticalGroupId,
  type VerticalGroup,
  type VerticalGroupItemValue,
} from '../../../models/vertical-group'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {createGroupedItemsId} from '../../../state-providers/memex-items/queries/query-keys'
import type {
  MemexGroupsPageQueryData,
  PaginatedGroupQueryData,
} from '../../../state-providers/memex-items/queries/types'
import {
  type GroupedItemQueries,
  type GroupsById,
  usePaginatedMemexItemsQuery,
} from '../../../state-providers/memex-items/queries/use-paginated-memex-items-query'
import {Resources} from '../../../strings'
import {buildGetGroupedRowsFunctionForBoard} from '../grouping'

const defaultGroupByFieldOptions: Array<VerticalGroup> = []
/**
 * Filters and groups items depending on the current view.
 * Steps:
 * 1. Apply the current filter to the full list of items.
 * 2. If the current view is not grouped, we will fall back to the `Status` field.
 * 3. If the current view is grouped, we will create a list of groups, each with a list of items, based on the vertical grouping field.
 * @returns An array of items grouped by the vertical group they belong to
 */
export function useBoardItems() {
  const {memex_table_without_limits} = useEnabledFeatures()
  if (memex_table_without_limits) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useBoardItemsWithMWLEnabled()
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useBoardItemsWithMWLDisabled()
  }
}

function useBoardItemsWithMWLDisabled() {
  const {filteredItems} = useFilteredItems()
  const {groupedByColumnId, groupByFieldOptions = defaultGroupByFieldOptions} = useVerticalGroups()
  const {groupedByColumn: horizontalGroupedByColumn, collapsedGroups} = useHorizontalGroupedBy()
  const {sortUngroupedItems} = useSortedItems()
  const {missingRequiredColumnData} = useViews()
  const {allColumns} = useAllColumns()
  const compatibleColumns = useMemo(() => allColumns.filter(canVerticalGroup), [allColumns])

  const groupByFieldId = useMemo(
    () => getGroupByFieldId(compatibleColumns, groupedByColumnId),
    [compatibleColumns, groupedByColumnId],
  )

  const groupByField = useMemo(() => allColumns.find(c => c.id === groupByFieldId), [allColumns, groupByFieldId])

  const groupingConfig = useColumnsWithGroupingConfiguration()

  const groupedItems: HorizontalGrouping = useMemo(() => {
    const allItemsByVerticalGroup = Object.fromEntries(
      Object.entries(
        groupItemsByField(filteredItems, groupByFieldId, groupByFieldOptions, missingRequiredColumnData),
      ).map(([fieldValue, items]) => {
        // defining totalCount to align with MWL data shape
        return [fieldValue, {items: sortUngroupedItems(items), totalCount: items.length}] as const
      }),
    )

    if (horizontalGroupedByColumn) {
      const groupConfig = groupingConfig[horizontalGroupedByColumn?.id]

      const horizontalGroups =
        groupConfig
          ?.groupingConfig?.(filteredItems)
          .map(horizontalGroup => {
            const itemsByVerticalGroup = Object.fromEntries(
              Object.entries(
                groupItemsByField(horizontalGroup.rows, groupByFieldId, groupByFieldOptions, missingRequiredColumnData),
              ).map(([fieldValue, items]) => {
                return [fieldValue, {items: sortUngroupedItems(items)}] as const
              }),
            )
            return {
              ...horizontalGroup,
              isCollapsed: collapsedGroups.includes(horizontalGroup.value),
              itemsByVerticalGroup,
            }
          })
          .filter(horizontalGroup => horizontalGroup.rows.length > 0) ?? []

      if (horizontalGroups.length > 0) {
        return {
          isHorizontalGrouped: true as const,
          horizontalGroupedByColumn,
          allItemsByVerticalGroup,
          horizontalGroups,
        }
      }
    }

    return {
      isHorizontalGrouped: false as const,
      allItemsByVerticalGroup,
      horizontalGroups: [
        {
          value: Resources.undefined,
          isCollapsed: false,
          itemsByVerticalGroup: allItemsByVerticalGroup,
          rows: filteredItems,
        },
      ],
    }
  }, [
    horizontalGroupedByColumn,
    filteredItems,
    groupByFieldId,
    groupByFieldOptions,
    missingRequiredColumnData,
    sortUngroupedItems,
    groupingConfig,
    collapsedGroups,
  ])

  return useMemo(() => {
    return {
      groupByFieldOptions,
      groupByFieldId,
      groupByField,
      compatibleColumns,
      filteredItems,
      groupedItems,
    }
  }, [groupByFieldOptions, groupByFieldId, groupByField, compatibleColumns, filteredItems, groupedItems])
}

function useBoardItemsWithMWLEnabled() {
  const {memex_mwl_server_group_order, memex_mwl_swimlanes} = useEnabledFeatures()
  const useServerGroups = memex_mwl_server_group_order
  const {filteredItems} = useFilteredItems()
  const {groupedByColumnId, groupByFieldOptions = defaultGroupByFieldOptions} = useVerticalGroups()
  const {groupedByColumn: horizontalGroupedByColumn, collapsedGroups} = useHorizontalGroupedBy()
  const {allColumns} = useAllColumns()
  const compatibleColumns = useMemo(() => allColumns.filter(canVerticalGroup), [allColumns])

  const groupByFieldId = useMemo(
    () => getGroupByFieldId(compatibleColumns, groupedByColumnId),
    [compatibleColumns, groupedByColumnId],
  )

  const groupByField = useMemo(() => allColumns.find(c => c.id === groupByFieldId), [allColumns, groupByFieldId])

  const {queriesForGroups, queriesForSecondaryGroups, groupedItemQueries, groupsById} = usePaginatedMemexItemsQuery()
  const groupedItems: HorizontalGrouping = useMemo(() => {
    if (memex_mwl_swimlanes && horizontalGroupedByColumn) {
      // we want to render swimlanes for a PWL project
      const {horizontalGroups, allItemsByVerticalGroup} = formatGroupsFromServer(
        queriesForGroups,
        queriesForSecondaryGroups,
        groupedItemQueries,
        groupsById,
        horizontalGroupedByColumn,
        useServerGroups,
      )

      collapseHorizontalGroups(horizontalGroups, collapsedGroups)

      return {
        allItemsByVerticalGroup,
        horizontalGroups,
        isHorizontalGrouped: true,
        horizontalGroupedByColumn,
      }
    }

    const allItemsByVerticalGroup = formatGroupsFromServer(
      queriesForGroups,
      queriesForSecondaryGroups,
      groupedItemQueries,
      groupsById,
      undefined,
      useServerGroups,
    ).allItemsByVerticalGroup

    return {
      isHorizontalGrouped: false as const,
      allItemsByVerticalGroup,
      horizontalGroups: [
        {
          value: Resources.undefined,
          isCollapsed: false,
          itemsByVerticalGroup: allItemsByVerticalGroup,
          rows: filteredItems,
        },
      ],
    }
  }, [
    memex_mwl_swimlanes,
    horizontalGroupedByColumn,
    queriesForGroups,
    queriesForSecondaryGroups,
    groupedItemQueries,
    groupsById,
    useServerGroups,
    filteredItems,
    collapsedGroups,
  ])

  return useMemo(() => {
    return {
      groupByFieldOptions,
      groupByFieldId,
      groupByField,
      compatibleColumns,
      filteredItems,
      groupedItems,
    }
  }, [groupByFieldOptions, groupByFieldId, groupByField, compatibleColumns, filteredItems, groupedItems])
}

/**
 * Utility function that prepares items grouped server-side for use by the Board component.
 * If a horizontal column model is provided, horizontal groups (i.e. swimlanes) will be created as well.
 * @param queriesForGroups an array containing query data for groups
 * @param queriesForSecondaryGroups an array containing query data for secondary groups
 * @param groupedItemQueries queries of items grouped by their group id
 * @param groupsById allows for looking up a group and its total count by a group id
 * @param horizontalColumnModel the column to use for the secondary groups. Needed so that we can look up
 * group metadata for the secondary groups. If undefined, we should not attempt to group
 * the items by the secondary groups.
 * @param useServerGroupId Whether to use the server groupId or the metadata id as the key for the groups
 * @returns an object with two pieces of data.
 * 1. allItemsByVerticalGroup: All of the items on the client grouped by the primary group.
 * 2. horizontalGroups: All of the information needed to render each swimlane, including all of the items
 * in the swimlane, items in the swimlane grouped by each vertical group and group metadata for the swimlane.
 */
export function formatGroupsFromServer(
  queriesForGroups: Array<UseQueryResult<MemexGroupsPageQueryData>>,
  queriesForSecondaryGroups: Array<UseQueryResult<MemexGroupsPageQueryData>>,
  groupedItemQueries: GroupedItemQueries,
  groupsById: GroupsById,
  horizontalColumnModel: ColumnModel | undefined,
  useServerGroupId: boolean,
): {allItemsByVerticalGroup: ItemsGroupedByVerticalColumn; horizontalGroups: Array<GroupedHorizontalGroup>} {
  const allItemsByVerticalGroup: {[x: string]: ItemDataForVerticalColumn} = {}
  const horizontalGroups: Array<GroupedHorizontalGroup> = []

  const allPrimaryGroups = queriesForGroups.flatMap(query => query?.data?.groups || [])

  for (const primaryGroup of allPrimaryGroups) {
    const itemQueries = groupedItemQueries[primaryGroup.groupId]
    const items = itemQueries?.flatMap(q => q.data?.nodes || []) || []

    const groupKey = getGroupKey(primaryGroup, useServerGroupId)

    const group = groupsById[primaryGroup.groupId]
    const totalCount = group?.totalCount.value

    allItemsByVerticalGroup[groupKey] = {items, groupId: primaryGroup.groupId, totalCount}
  }

  if (!horizontalColumnModel) {
    return {allItemsByVerticalGroup, horizontalGroups}
  }

  const allSecondaryGroups = queriesForSecondaryGroups.flatMap(query => query?.data?.groups || [])

  for (const secondaryGroup of allSecondaryGroups) {
    const sourceObject = getGroupingMetadataFromServerGroupValue(
      horizontalColumnModel,
      secondaryGroup.groupValue,
      secondaryGroup.groupMetadata,
    )
    const itemsByVerticalGroup: {[x: string]: ItemDataForVerticalColumn} = {}
    for (const primaryGroup of allPrimaryGroups) {
      const groupedItemsId = createGroupedItemsId({
        groupId: primaryGroup.groupId,
        secondaryGroupId: secondaryGroup.groupId,
      })
      const itemQueries = groupedItemQueries[groupedItemsId]
      const items = itemQueries?.flatMap(q => q.data?.nodes || []) || []

      const groupKey = getGroupKey(primaryGroup, useServerGroupId)

      itemsByVerticalGroup[groupKey] = {items, groupId: primaryGroup.groupId}
    }
    const rows = groupedItemQueries[secondaryGroup.groupId]?.flatMap(q => q.data?.nodes || []) || []
    if (sourceObject) {
      horizontalGroups.push({
        // We use a default value of `false` here, and will set the actual
        // value of the property in the `collapseHorizontalGroups` helper
        isCollapsed: false,
        itemsByVerticalGroup,
        rows,
        sourceObject,
        value: secondaryGroup.groupValue,
        serverGroupId: secondaryGroup.groupId,
      })
    }
  }

  return {allItemsByVerticalGroup, horizontalGroups}
}

/**
 * Helper for determining a key for a group. If we're using a server group id, we'll use the `groupId`
 * directly off the group, otherwise we'll use the id from the group's metadata.
 * @param group The group we want to try to resolve a key for
 * @param useServerGroupId Whether to use the server groupId or the metadata id as the key for the groups
 * @returns a string or number representation of the group's key
 */
function getGroupKey(group: PaginatedGroupQueryData, useServerGroupId: boolean): string | number {
  let groupKey = group.groupMetadata?.id ?? MissingVerticalGroupId
  if (useServerGroupId) {
    // Use MissingVerticalGroupId for the 'no value' group
    // i.e., a group without an associated metadata object.
    // TODO: Remove dependence on MissingVerticalGroupId
    // https://github.com/github/projects-platform/issues/2127
    groupKey = group.groupValue === NO_GROUP_VALUE ? MissingVerticalGroupId : group.groupId
  }
  return groupKey
}

/**
 * Utility function that actually performs the grouping of items, based on their values for the
 * group by field.
 * Currently only supports single-select and iteration fields.
 *
 * @param items Flat, ungrouped list of memex items this method will group
 * @param groupByFieldId The id of the field to group by
 * @param fieldOptions An array of valid groups associated with the field to group by
 * @param missingRequiredColumnData Whether column data has already been loaded from the server
 * @returns A mapping of group ids to arrays of items belonging to that group
 */
function groupItemsByField<TColumnId extends keyof ColumnData>(
  items: Readonly<Array<MemexItemModel>>,
  groupByFieldId: TColumnId,
  fieldOptions: Array<VerticalGroup>,
  missingRequiredColumnData: boolean,
) {
  // Create a map of metadataId -> verticalGroupId
  const verticalGroupIdByMetadataId: {[metadataId: string]: string} = {}
  const itemsByVerticalGroup: {[verticalGroupId: string]: Array<MemexItemModel>} = fieldOptions.reduce(
    (acc, verticalGroup) => {
      // Add to the lookup map for metadataId -> verticalGroupId
      verticalGroupIdByMetadataId[verticalGroup.groupMetadata?.id ?? ''] = verticalGroup.id
      // Initialize an items array for each vertical group
      acc[verticalGroup.id] = []
      return acc
    },
    {} as {[verticalGroupId: string]: Array<MemexItemModel>},
  )

  if (missingRequiredColumnData) return itemsByVerticalGroup

  for (const item of items) {
    const columnValue = getGroupByFieldValueForItem(item.columns, groupByFieldId)
    // Lookup the verticalGroupId using the columnValue's id
    // The columnValue for a field is a partial of the field's VerticalGroupMetadata type
    const verticalGroupId = verticalGroupIdByMetadataId[columnValue?.id ?? '']
    if (verticalGroupId) {
      itemsByVerticalGroup[verticalGroupId]?.push(item)
    }
  }
  return itemsByVerticalGroup
}

function getGroupByFieldValueForItem<TColumnId extends keyof ColumnData>(
  columnData: ColumnData,
  groupByFieldId: TColumnId,
): VerticalGroupItemValue {
  if (groupByFieldId === -1) {
    return undefined
  }
  return columnData[groupByFieldId] as VerticalGroupItemValue
}

const boardGroupingConfig = buildGroupingConfiguration<Readonly<MemexItemModel>>(row => row.columns)
function getColumnBehaviors(columnModel: Pick<ColumnModel, 'dataType'>) {
  return boardGroupingConfig[columnModel.dataType]
}
const useColumnsWithGroupingConfiguration = () => {
  const {allColumns} = useAllColumns()
  const groupConfigurations = useMemo(() => {
    return Object.fromEntries(
      allColumns.map(column => {
        const behaviors = getColumnBehaviors(column)
        return [
          column.id,
          {
            ...column,
            groupingConfig: behaviors ? buildGetGroupedRowsFunctionForBoard(column, behaviors) : undefined,
          },
        ] as const
      }),
    )
  }, [allColumns])

  return groupConfigurations
}

/**
 * Iterate over the horizontal groups and check the value of each group against the list of collapsed groups.
 * If the value is present in that list, update the `isCollapsed` property of the horizontal group to `true`.
 */
function collapseHorizontalGroups(horizontalGroups: Array<HorizontalGroup>, collapsedGroups: Array<string>) {
  for (const horizontalGroup of horizontalGroups) {
    if (collapsedGroups.includes(horizontalGroup.value)) {
      horizontalGroup.isCollapsed = true
    }
  }
}
