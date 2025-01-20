import type {
  GroupedPageParamsQueryData,
  GroupedWithSecondaryGroupsPageParamsQueryData,
  MemexGroupsPageQueryData,
  MemexPageQueryData,
  PageParamsQueryData,
} from './types'

export function isQueryDataGrouped(queryData: MemexPageQueryData): queryData is MemexGroupsPageQueryData {
  return 'groups' in queryData
}

export function isPageParamsDataGrouped(
  pageParamsData: PageParamsQueryData,
): pageParamsData is GroupedPageParamsQueryData {
  return 'groupedItems' in pageParamsData
}

export function isPageParamsDataGroupedWithSecondaryGroups(
  pageParamsData: PageParamsQueryData,
): pageParamsData is GroupedWithSecondaryGroupsPageParamsQueryData {
  return 'secondaryGroups' in pageParamsData
}
