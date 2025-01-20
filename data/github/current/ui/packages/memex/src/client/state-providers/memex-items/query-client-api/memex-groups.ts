import type {QueryClient} from '@tanstack/react-query'

import {NO_GROUP_VALUE} from '../../../api/memex-items/contracts'
import type {GroupMetadata} from '../../../api/memex-items/paginated-views'
import {MissingVerticalGroupId, type VerticalGroup} from '../../../models/vertical-group'
import {isQueryDataGrouped} from '../queries/query-data-helpers'
import {
  buildMemexGroupsQueryKey,
  buildMemexSecondaryGroupsQueryKey,
  type GroupId,
  type MemexGroupsQueryKey,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
} from '../queries/query-keys'
import type {
  MemexGroupsPageQueryData,
  MemexPageQueryData,
  PageParam,
  PaginatedGroupQueryData,
  PaginatedMemexItemsQueryVariables,
} from '../queries/types'
import {getKey} from './helpers'

/**
 * A thin wrapper around getQueryData for getting the memex groups data for a single page/query.
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables used in the query key
 * @param pageParam Page param for the data we're getting to be included in the query key
 */
export function getQueryDataForMemexGroupsPage(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
): MemexGroupsPageQueryData | undefined {
  const queryKey = buildMemexGroupsQueryKey(variables, pageParam)
  return queryClient.getQueryData<MemexGroupsPageQueryData>(queryKey)
}

/**
 * A thin wrapper around setQueryData for setting the memex group data for a single page/query.
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables used in the query key
 * @param pageParam Page param for the data we're setting to be included in the query key
 * @param queryData The new groups data
 */
export function setQueryDataForMemexGroupsPage(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
  queryData: MemexGroupsPageQueryData,
) {
  const queryKey = buildMemexGroupsQueryKey(variables, pageParam)
  queryClient.setQueryData<MemexGroupsPageQueryData>(queryKey, queryData)
}

/**
 * A thin wrapper around getQueryData for getting the memex secondary groups data for a single page/query.
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables used in the query key
 * @param pageParam Page param for the data we're getting to be included in the query key
 */
export function getQueryDataForMemexSecondaryGroupsPage(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
): MemexGroupsPageQueryData | undefined {
  const queryKey = buildMemexSecondaryGroupsQueryKey(variables, pageParam)
  return queryClient.getQueryData<MemexGroupsPageQueryData>(queryKey)
}

/**
 * A thin wrapper around setQueryData for setting the memex secondary group data for a single page/query.
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables used in the query key
 * @param pageParam Page param for the data we're setting to be included in the query key
 * @param queryData The new secondary groups data
 */
export function setQueryDataForMemexSecondaryGroupsPage(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
  queryData: MemexGroupsPageQueryData,
) {
  const queryKey = buildMemexSecondaryGroupsQueryKey(variables, pageParam)
  queryClient.setQueryData<MemexGroupsPageQueryData>(queryKey, queryData)
}

export type GroupIdToGroupValueMap = {[groupId: GroupId]: string}

/**
 * A helper building a map between groupId -> groupValue based on
 * data in the query client
 * @param queryClient
 */
export function buildGroupValuesFromQueryData(queryClient: QueryClient): GroupIdToGroupValueMap {
  const groupValuesMap: GroupIdToGroupValueMap = {}

  const queryKeyWithoutPageParamForGroups = [...getKey(queryClient), pageTypeForGroups]
  const queryKeyWithoutPageParamForSecondaryGroups = [...getKey(queryClient), pageTypeForSecondaryGroups]
  const queryPages = [
    ...queryClient.getQueriesData<MemexPageQueryData>({queryKey: queryKeyWithoutPageParamForGroups}),
    ...queryClient.getQueriesData<MemexPageQueryData>({queryKey: queryKeyWithoutPageParamForSecondaryGroups}),
  ]

  for (const [_queryKey, page] of queryPages) {
    const groups = page && isQueryDataGrouped(page) ? page.groups : []

    for (const group of groups) {
      groupValuesMap[group.groupId] = group.groupValue
    }
  }

  return groupValuesMap
}

/**
 * Helper that finds groupsQueryKey for group
 * @param queryClient
 * @param groupMetadataId metadata id of the group
 * @returns {queryKeyForGroup: MemexGroupsQueryKey, groupId: GroupId}
 */
export function getGroupsQueryKeyForMetadata(
  queryClient: QueryClient,
  groupMetadataId: GroupMetadata['id'],
): {queryKeyForGroup: MemexGroupsQueryKey; groupId: GroupId} | undefined {
  const queryKeyWithoutPageParamForGroups = [...getKey(queryClient), pageTypeForGroups]
  const queryPages = queryClient.getQueriesData<MemexPageQueryData>({queryKey: queryKeyWithoutPageParamForGroups})

  for (const [queryKey, page] of queryPages) {
    const groups = page && isQueryDataGrouped(page) ? page.groups : []
    const group = groups.find(g => g.groupMetadata?.id === groupMetadataId)
    if (group) {
      return {queryKeyForGroup: queryKey as MemexGroupsQueryKey, groupId: group.groupId}
    }
  }
  return undefined
}

/**
 * Helper to find the server-generated groupId for a given verticalGroupId.
 * This is a temporary work-around to accommodate the client's dependence
 * on a hard-coded group id for the 'No Value' group.
 * See: https://github.com/github/projects-platform/issues/2127
 * @param queryClient
 * @param verticalGroupId
 * @returns GroupId or undefined
 */
export function getServerGroupIdForVerticalGroupId(queryClient: QueryClient, verticalGroupId: VerticalGroup['id']) {
  if (verticalGroupId === MissingVerticalGroupId) {
    const queryKeyWithoutPageParamForGroups = [...getKey(queryClient), pageTypeForGroups]
    const queryPages = queryClient.getQueriesData<MemexPageQueryData>({queryKey: queryKeyWithoutPageParamForGroups})
    for (const [_, page] of queryPages) {
      const groups = page && isQueryDataGrouped(page) ? page.groups : []
      const group = groups.find(g => g.groupValue === NO_GROUP_VALUE)
      if (group) {
        return group.groupId
      }
    }
    return undefined
  }
  return verticalGroupId
}

/**
 * Updates a single group within queryClient with new changes (name, color, description)
 * @param queryClient
 * @param newGroupMetadata hash with the updated changes in GroupMetadata structure
 * @param newGroupValue string with the new updated groupValue
 * @returns queryData with the updated group
 */
export function updateGroupMetadata(queryClient: QueryClient, newGroupMetadata: GroupMetadata, newGroupValue: string) {
  const queryKeyAndGroupId = getGroupsQueryKeyForMetadata(queryClient, newGroupMetadata.id)
  if (!queryKeyAndGroupId) {
    return
  }

  const {queryKeyForGroup, groupId} = queryKeyAndGroupId

  queryClient.setQueryData<MemexGroupsPageQueryData>(queryKeyForGroup, oldData => {
    if (!isQueryPageOfGroups(oldData)) {
      return getEmptyGroupDataForPage(oldData)
    }

    const newGroups = oldData.groups.map(group => {
      if (group.groupId === groupId) {
        return {
          ...group,
          groupValue: newGroupValue,
          groupMetadata: newGroupMetadata,
        }
      }
      return group
    })
    return {...oldData, groups: newGroups}
  })
}

/**
 * Updates position of a single group within queryClient
 * @param queryClient
 * @param groupMetadata metadata of the group that will be moved
 * @param anchorMetadataId Metadata.id of an anchor group the moving group should go before or after
 * @param after boolean to indicate if option should go after anchorMetadataId
 * @returns queryData with the group moved into new position
 */
export function updateGroupPosition(
  queryClient: QueryClient,
  groupMetadata: GroupMetadata,
  anchorMetadataId: GroupMetadata['id'],
  after: boolean,
) {
  let originalGroup: PaginatedGroupQueryData | undefined = undefined

  const queryKeyAndGroupId = getGroupsQueryKeyForMetadata(queryClient, groupMetadata.id)
  const overGroupQueryKeyAndGroupId = getGroupsQueryKeyForMetadata(queryClient, anchorMetadataId)
  if (!queryKeyAndGroupId || !overGroupQueryKeyAndGroupId) {
    return
  }

  const {queryKeyForGroup, groupId} = queryKeyAndGroupId
  const {queryKeyForGroup: overGroupQueryKeyForGroup, groupId: overGroupId} = overGroupQueryKeyAndGroupId

  // remove option from queryData
  queryClient.setQueryData<MemexGroupsPageQueryData>(queryKeyForGroup, oldData => {
    if (!isQueryPageOfGroups(oldData)) {
      return getEmptyGroupDataForPage(oldData)
    }

    const groupIndex = oldData?.groups.findIndex(g => g.groupId === groupId)
    if (groupIndex > -1) {
      originalGroup = oldData.groups[groupIndex]
      oldData.groups.splice(groupIndex, 1)
    }

    return {...oldData}
  })

  // re-add option to queryData in new position
  queryClient.setQueryData<MemexGroupsPageQueryData>(overGroupQueryKeyForGroup, oldData => {
    if (!isQueryPageOfGroups(oldData)) {
      return getEmptyGroupDataForPage(oldData)
    }

    const groupIndex = oldData?.groups.findIndex(g => g.groupId === overGroupId)
    if (groupIndex > -1) {
      const addToIndex = after ? groupIndex + 1 : groupIndex
      oldData.groups.splice(addToIndex, 0, originalGroup as PaginatedGroupQueryData)
    }

    return {...oldData}
  })
}

function isQueryPageOfGroups(queryData: MemexPageQueryData | undefined): queryData is MemexGroupsPageQueryData {
  return queryData !== undefined && 'groups' in queryData
}

function getEmptyGroupDataForPage(queryData: MemexGroupsPageQueryData | undefined): MemexGroupsPageQueryData {
  if (!queryData) {
    return {groups: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}}
  }
  return queryData
}
