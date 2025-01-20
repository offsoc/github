import {getEnabledFeatures} from '../../helpers/feature-flags'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'
import {Resources} from '../../strings'
import {sortAggregatedGroupsByKind} from './group-sorting'
import {createEmptyGroup} from './helpers'
import type {GroupingMetadataWithSource} from './types'

type GetGroupingMetadataType<TItem extends {id: string | number}> = (
  column: ColumnModel,
  item: TItem,
) => Array<GroupingMetadataWithSource> | undefined

type GetAllGroupMetadataType = (
  column: ColumnModel,
  allItems?: Readonly<Array<MemexItemModel>>,
) => Array<GroupingMetadataWithSource> | undefined

export type GroupItemsResult<TItem extends {id: string | number}> = GroupingMetadataWithSource & {rows: Array<TItem>}

/**
 *
 * @param items Flat list of items/rows to group
 * @param columnModel The column model to use for grouping
 * @param getGroupingMetadata a function that will return the grouping metadata for a given item
 * @param getAllGroupMetadata an optional function which contains all groups for a column - used for sorting
 * @param transformItems A optional transformation that can be applied to each item in the group (e.g. adding a group name to the id)
 * @param allItems All items in the project. This is provided so that the grouping
 * can be determined when the column metadata is not enough to build all
 * groups. Assignees and labels use this since all possible assignees and labels
 * are not stored in the column metadata.
 * @returns An array of group metadata alongside the items that belong to each group
 */
export function groupItems<TItem extends {id: string | number}>(
  items: Readonly<Array<TItem>>,
  columnModel: ColumnModel,
  getGroupingMetadata: GetGroupingMetadataType<TItem>,
  getAllGroupMetadata: GetAllGroupMetadataType | undefined,
  transformItems?: (item: TItem, groupName: string) => TItem,
  allItems?: Readonly<Array<MemexItemModel>>,
): Array<GroupItemsResult<TItem>> {
  const allGroups = getAllGroupMetadata && getAllGroupMetadata(columnModel, allItems)
  const itemsByGroupValue = new Map<string, Array<TItem>>()
  const aggregatedGroups = new Array<GroupingMetadataWithSource>()

  // Rather than allowing `undefined` or some sentinel value as a key in in `itemsByGroupValue`,
  // just collect items without a group value separately.
  const itemsWithoutGroupValue = new Array<TItem>()
  const {dataType} = columnModel

  for (const item of items) {
    const groupsMetadata = getGroupingMetadata(columnModel, item)

    if (!groupsMetadata) {
      const itemWithoutGroup = transformItems ? transformItems(item, 'none') : item

      itemsWithoutGroupValue.push(itemWithoutGroup)
      continue
    }

    for (const metadata of groupsMetadata) {
      const {value} = metadata
      if (!allGroups && aggregatedGroups.findIndex(g => g.value === value) === -1) {
        aggregatedGroups.push(metadata)
      }
      const itemWithGroupId = transformItems ? transformItems(item, value) : item

      const groupedRows = itemsByGroupValue.get(value)
      if (!groupedRows) {
        itemsByGroupValue.set(value, [itemWithGroupId])
      } else {
        groupedRows.push(itemWithGroupId)
      }
    }
  }

  // First accumulate groups for each item with a definite group value, which
  // varies currently due to whether group values are available
  let groups: Array<GroupItemsResult<TItem>>

  if (allGroups) {
    // If `allGroups` exists, it already provides the correct order for groups
    groups = allGroups.map(v => ({...v, rows: itemsByGroupValue.get(v.value) ?? []}))
  } else {
    // Otherwise, we must sort the group values to ensure that they appear in
    // ascending order by default.
    const groupValues = sortAggregatedGroupsByKind(dataType, [...aggregatedGroups])

    groups = groupValues.map(g => ({
      ...g,
      rows: itemsByGroupValue.get(g.value) ?? [],
    }))
  }

  const emptyGroup = createEmptyGroup(columnModel)
  if (emptyGroup) {
    // Then tack on a group for the rows without any group value.
    groups.push({
      value: Resources.undefined,
      sourceObject: emptyGroup,
      rows: itemsWithoutGroupValue,
    })
  }

  return groups
}

/**
 *
 * @param items Flat list of items/rows to group
 * @param columnModel The column model to use for grouping
 * @param getGroupingMetadata a function that will return the grouping metadata for a given item
 * @returns An array of group metadata, without items attached as subRows
 */
export function buildGroups<TItem extends {id: string | number}>(
  items: Readonly<Array<TItem>>,
  columnModel: ColumnModel,
  getGroupingMetadata: GetGroupingMetadataType<TItem>,
): Array<GroupingMetadataWithSource> {
  const aggregatedGroups = new Array<GroupingMetadataWithSource>()

  for (const item of items) {
    const groupsMetadata = getGroupingMetadata(columnModel, item)

    if (!groupsMetadata) {
      continue
    }

    for (const metadata of groupsMetadata) {
      const {value} = metadata
      if (aggregatedGroups.findIndex(g => g.value === value) === -1) {
        aggregatedGroups.push(metadata)
      }
    }
  }

  const {memex_table_without_limits} = getEnabledFeatures()

  // When memex_table_without_limits is enabled, we expect items
  // to all belong to the same group.
  if (memex_table_without_limits && aggregatedGroups.length > 0) {
    return aggregatedGroups
  }

  const emptyGroup = createEmptyGroup(columnModel)
  if (emptyGroup) {
    // Then tack on a group for the rows without any group value.
    aggregatedGroups.push({
      value: memex_table_without_limits ? '_noValue' : Resources.undefined,
      sourceObject: emptyGroup,
    })
  }

  return aggregatedGroups
}
