import type {Iteration} from '../../client/api/columns/contracts/iteration'
import {type MemexColumn, MemexColumnDataType} from '../../client/api/columns/contracts/memex-column'
import type {ExtendedRepository, Label, Milestone} from '../../client/api/common-contracts'
import type {MemexItem} from '../../client/api/memex-items/contracts'
import type {
  GroupedMemexItems,
  GroupMetadata,
  PageInfo,
  PaginatedGroups,
  PaginatedMemexItemsData,
  PaginatedTotalCount,
  SliceData,
} from '../../client/api/memex-items/paginated-views'
import {groupItems, type GroupItemsResult} from '../../client/features/grouping/group-items'
import {buildGroupingConfiguration} from '../../client/features/grouping/grouping-metadata-configurations'
import type {FieldGrouping} from '../../client/features/grouping/types'
import {getAllIterations} from '../../client/helpers/iterations'
import {parseIsoDateStringToDate} from '../../client/helpers/parsing'
import {type ColumnModel, createColumnModel} from '../../client/models/column-model'
import {createMemexItemModel, type MemexItemModel} from '../../client/models/memex-item-model'

/**
 * Given a full set of nodes, slice them according to the pagination parameters and build a PageInfo object.
 * This functionality can be used for pagination of both items and groups and is called when we are forming
 * the initial data seeded in the JSON island as well as responding to a request for more paginated data.
 */
export function sliceNodesAndBuildPageInfo<T>(
  allNodes: Array<T>,
  after: string | undefined,
  before: string | undefined,
  first: number,
): {nodes: Array<T>; pageInfo: PageInfo; totalCount: PaginatedTotalCount} {
  // the server expects a cursor, but we mock with an index
  let startIndex = 0
  let endIndex = first

  if (after) {
    startIndex = parseInt(after, 10) + 1
    endIndex = startIndex + first
  } else if (before) {
    endIndex = parseInt(before, 10)
    startIndex = Math.max(endIndex - first, 0)
  }

  const slicedNodes = allNodes.slice(startIndex, endIndex)

  return {
    nodes: slicedNodes,
    pageInfo: {
      startCursor: startIndex.toString(),
      endCursor: (startIndex + slicedNodes.length - 1).toString(),
      hasNextPage: startIndex + slicedNodes.length < allNodes.length,
      hasPreviousPage: startIndex > 0,
    },
    totalCount: {
      value: allNodes.length,
      isApproximate: false,
    },
  }
}

const groupsPerPage = 10
const initialNodesPerGroup = 35
const nextPageNodesPerGroup = 100

type BuildPaginatedGroupsParameters = {
  ungroupedItems: Array<MemexItem>
  field: MemexColumn
  secondaryField?: MemexColumn
  slices: Array<SliceData> | undefined
  before?: string
  after?: string
  secondaryAfter?: string
  groupedByGroupValue?: string
  groupedBySecondaryGroupValue?: string
}

/**
 * Given a set of ungrouped items, group them according to the column type and paginate them according to the
 * pagination parameters. This functionality is called when we are forming the initial data seeded in the JSON
 * as well as when responding to a request for more paginated, grouped data.
 *
 * If `slices` are provided, they will be passed through to the response.
 *
 * If a groupedByGroupValue, we will return the next page of items for that group. If no groupedByGroupValue is passed,
 * then we will return the next (or first) page of groups, along with the first page of items for each group.
 */
export function buildPaginatedGroups({
  ungroupedItems,
  field,
  secondaryField,
  slices,
  before,
  after,
  secondaryAfter,
  groupedByGroupValue,
  groupedBySecondaryGroupValue,
}: BuildPaginatedGroupsParameters): PaginatedMemexItemsData {
  if (!secondaryField) {
    // Group all items by the column
    const allGroupsAndAllItems = buildGroupsOfItems(ungroupedItems, field)

    if (groupedByGroupValue != null) {
      // We want to get the next page of items for the group with the given id, so find the group and return the
      // correct page of items for that group, based on the before/after parametrers.
      const group = allGroupsAndAllItems.find(g => g.groupValue === groupedByGroupValue)
      if (group) {
        return sliceNodesAndBuildPageInfo(group.items.nodes, after, before, nextPageNodesPerGroup)
      }
    }

    // We want to get a page of groups - either we're requesting the first page of groups or building the JSON island,
    // or we have an after parameter and we want the next page of groups. In any case, we need to slice the groups
    // by our pagination parameters.
    const {nodes: pageOfGroups, pageInfo} = sliceNodesAndBuildPageInfo(
      allGroupsAndAllItems,
      after,
      before,
      groupsPerPage,
    )

    // Once we have the correct page of groups, we need to slice the items for each group, returning the first page
    // of items for that group.
    const groups = pageOfGroups.map(group => ({
      ...group,
      items: sliceNodesAndBuildPageInfo(group.items.nodes, undefined, undefined, initialNodesPerGroup),
      totalCount: {
        value: group.items.nodes.length,
        isApproximate: false,
      },
    }))

    const groupedItems = pageOfGroups.map(group => {
      const {totalCount, ...nodesAndPageInfo} = sliceNodesAndBuildPageInfo(
        group.items.nodes,
        undefined,
        undefined,
        initialNodesPerGroup,
      )
      return {...nodesAndPageInfo, groupId: group.groupId}
    })
    return {
      groups: {nodes: groups.map(({items, ...restOfGroup}) => restOfGroup), pageInfo},
      secondaryGroups: null,
      groupedItems,
      slices,
      totalCount: {
        value: ungroupedItems.length,
        isApproximate: false,
      },
    }
  } else {
    // If we've gotten to this point, then we have a `field` and `secondaryField` defined.
    // We currently support two types of requests for this scenario:
    // 1. No `after` / `before` parameters and no `groupValue` or `secondaryGroupValue` parameters
    // 2. Both a `groupValue` _and_ a `secondaryGroupValue` parameter
    // This means we don't yet support pagination of primary or secondary groups, as we're still
    // iterating on what the contract should be there.
    const groupedBySecondaryGroups = buildGroupsOfItems(ungroupedItems, secondaryField)

    if (groupedByGroupValue && groupedBySecondaryGroupValue) {
      // We're looking to get more _items_ for a particular primary/secondary group value combination
      const secondaryGroupedItemsForValue =
        groupedBySecondaryGroups.find(g => g.groupValue === groupedBySecondaryGroupValue)?.items.nodes || []
      const intersectionGroups = buildGroupsOfItems(secondaryGroupedItemsForValue, field)
      const allItemsForGroupAndSecondaryGroupIntersection =
        intersectionGroups.find(g => g.groupValue === groupedByGroupValue)?.items.nodes || []
      return sliceNodesAndBuildPageInfo(
        allItemsForGroupAndSecondaryGroupIntersection,
        after,
        before,
        nextPageNodesPerGroup,
      )
    }

    // We're looking to get an initial page of groups, secondaryGroups, and groupedItems
    // Currently we're ignoring any `after` / `before` parameter sent here.

    const groupedByPrimaryGroup = buildGroupsOfItems(ungroupedItems, field)

    // Get the first 10 primary groups
    const {nodes: pageOfPrimaryGroups, pageInfo: primaryGroupsPageInfo} = sliceNodesAndBuildPageInfo(
      groupedByPrimaryGroup,
      after,
      undefined,
      10,
    )

    // Get the first 5 secondary groups
    const {nodes: pageOfSecondaryGroups, pageInfo: secondaryGroupsPageInfo} = sliceNodesAndBuildPageInfo(
      groupedBySecondaryGroups,
      secondaryAfter,
      undefined,
      5,
    )

    const groupedItems: Array<GroupedMemexItems<MemexItem>> = []

    // Build up our groupedItems, where each set of grouped items
    // has a `groupId` and `secondaryGroupId`.

    // Start by looking at the 5 secondary groups that we care about
    for (const secondaryGroup of pageOfSecondaryGroups) {
      // For each of these, group them by the primary column
      const intersectionGroups = buildGroupsOfItems(secondaryGroup.items.nodes, field)

      // For each primary column that we care about,
      // find the items in the intersection of the primary and secondary group
      for (const primaryGroup of pageOfPrimaryGroups) {
        const itemsInIntersection = intersectionGroups.find(g => g.groupId === primaryGroup.groupId)?.items.nodes || []

        // Return the group ids and first 10 items within that intersection, along with the pagination info to get more
        // items for this intersection of groups.
        const nodesAndPageInfo = sliceNodesAndBuildPageInfo(itemsInIntersection, undefined, undefined, 10)
        if (nodesAndPageInfo.nodes.length) {
          groupedItems.push({
            groupId: primaryGroup.groupId,
            secondaryGroupId: secondaryGroup.groupId,
            ...nodesAndPageInfo,
          })
        }
      }
    }

    // Transform the groups and secondary groups into the correct shape for the response, without the items
    // and with a total count and `pageInfo`
    const groups: PaginatedGroups = {
      nodes: pageOfPrimaryGroups.map(({items, ...restOfGroup}) => ({
        ...restOfGroup,
        totalCount: {
          value: items.nodes.length,
          isApproximate: false,
        },
      })),
      pageInfo: primaryGroupsPageInfo,
    }
    const secondaryGroups: PaginatedGroups = {
      nodes: pageOfSecondaryGroups.map(({items, ...restOfGroup}) => ({
        ...restOfGroup,
        totalCount: {
          value: items.nodes.length,
          isApproximate: false,
        },
      })),
      pageInfo: secondaryGroupsPageInfo,
    }

    const totalCount: PaginatedTotalCount = {
      value: ungroupedItems.length,
      isApproximate: false,
    }

    return {
      groups,
      secondaryGroups,
      slices,
      groupedItems,
      totalCount,
    }
  }
}

/**
 * Groups the items by the values in the column provided and returns an array of slice data
 * containing an id, value and count
 */
export function buildSlices(items: Array<MemexItem>, column: MemexColumn): Array<SliceData> {
  const groups = buildGroupsOfItems(items, column)
  return groups.map(g => ({
    sliceId: g.groupId,
    sliceValue: g.groupValue,
    sliceMetadata: g.groupMetadata,
    totalCount: {isApproximate: false, value: g.items.nodes.length},
  }))
}

function buildGroupsOfItems(items: Array<MemexItem>, column: MemexColumn) {
  const columnModel = createColumnModel(column)

  const modelsAndItems = items.map(item => {
    return {model: createMemexItemModel(item), item, id: item.id}
  })

  // Look up a grouping configuration for the column type to pass to `groupItems`.
  // We use the table's client side grouping behavior, as it is more exhaustive than the board's.
  const config = buildGroupingConfiguration(
    (item: {model: MemexItemModel; item: MemexItem; id: number}) => item.model.columns,
    {
      // useDistinctAssigneesGrouping: true will more closely match server grouping behavior for Assignees
      useDistinctAssigneesGrouping: true,
    },
  )
  const groupingConfiguration = config[columnModel.dataType]

  if (!groupingConfiguration) {
    return []
  }

  const groupedData = groupItems(
    modelsAndItems,
    columnModel,
    groupingConfiguration.getGroupingMetadata,
    groupingConfiguration.getAllGroupMetadata,
  )

  return groupedData.map(result => ({
    groupId: buildGroupId(result.value, columnModel.databaseId),
    groupValue: buildGroupValue(columnModel, result),
    groupMetadata: buildGroupMetadata(columnModel, result.sourceObject),
    items: {
      nodes: result.rows.map(item => item.item),
    },
  }))
}

function buildGroupId(groupValue: string, columnId: number) {
  const stringified = JSON.stringify({groupValue, columnId})
  const encoded = window.btoa(stringified)
  // To match how `urlsafe_decode64` is used on the server,
  // Replace all `+`s with `-`s and all `/`s with `_`s.
  const urlSafe = encoded.replaceAll(/\+/g, '-').replaceAll(/\//g, '_')
  return urlSafe
}

function buildGroupValue(
  columnModel: ColumnModel,
  result: GroupItemsResult<{model: MemexItemModel; item: MemexItem; id: number}>,
) {
  if (result.value === 'undefined') {
    return '_noValue'
  }

  switch (columnModel.dataType) {
    case MemexColumnDataType.SingleSelect: {
      // The server grouping implementation passes the option name as the group value, so we need to look up the
      // option name from the option id.
      const optionById = columnModel.settings.options.find(option => option.id === result.value)
      return optionById ? optionById.name : result.value
    }
    case MemexColumnDataType.Iteration: {
      // The server grouping implementation passes the iteration name as the group value, so we need to look up the
      // iteration name from the iteration id.
      const iterationById = getAllIterations(columnModel).find(iteration => iteration.id === result.value)
      return iterationById ? iterationById.title : result.value
    }
    case MemexColumnDataType.Date: {
      // The server grouping implementation passes the milliseconds for a date as the group value, so we need to
      // convert the date to a number of milliseconds.
      const dateObject = parseIsoDateStringToDate(result.value)
      return dateObject ? dateObject.valueOf().toString() : result.value
    }
    default:
      return result.value
  }
}
function buildGroupMetadata(columnModel: ColumnModel, sourceObject: FieldGrouping): undefined | GroupMetadata {
  switch (columnModel.dataType) {
    case MemexColumnDataType.Assignees: {
      if (Array.isArray(sourceObject.value)) {
        return sourceObject.value[0]
      }
      return undefined
    }
    case MemexColumnDataType.SingleSelect: {
      if ('value' in sourceObject && 'option' in sourceObject.value) {
        return sourceObject.value.option
      }
      return undefined
    }
    case MemexColumnDataType.Iteration: {
      return sourceObject.value as Iteration
    }
    case MemexColumnDataType.Labels: {
      return sourceObject.value as Label
    }
    case MemexColumnDataType.Milestone: {
      return sourceObject.value as Milestone
    }
    case MemexColumnDataType.Repository: {
      return sourceObject.value as ExtendedRepository
    }
    default:
      return undefined
  }
}
