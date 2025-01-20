import {type PageView, RoadmapZoomLevel} from '../../api/view/contracts'
import {applyNoneFallback} from '../../helpers/roadmap-helpers'
import type {ViewIsDirtyStates} from './types'

/**
 * Check whether two arrays of number or strings are the same.
 *
 * Will return `true` when arrays are out of order but contain the same values.
 */
function areArraysDifferent(left: Array<number | string>, right: Array<number | string>) {
  return left.length !== right.length || JSON.stringify(left) !== JSON.stringify(right)
}

function arrayContainDifferentItems(left: Array<number | string>, right: Array<number | string>) {
  return left.length !== right.length || JSON.stringify(left.slice().sort()) !== JSON.stringify(right.slice().sort())
}

/**
 * Compares the server and local state, returning a {@link ViewIsDirtyStates} object
 * for the given states
 *
 * @param serverViewState
 * @param localViewState
 * @returns
 */

export function getViewDirtyStates({
  serverViewState,
  localViewState,
}: {
  serverViewState: PageView
  localViewState: PageView
}): ViewIsDirtyStates {
  const isViewTypeDirty = serverViewState.layout !== localViewState.layout
  const isHorizontalGroupedByDirty = areArraysDifferent(serverViewState.groupBy, localViewState.groupBy)

  const isVerticalGroupedByDirty = areArraysDifferent(
    serverViewState.verticalGroupBy || [],
    localViewState.verticalGroupBy || [],
  )

  const isSortedByDirty =
    serverViewState.sortBy.length !== localViewState.sortBy.length ||
    JSON.stringify(serverViewState.sortBy) !== JSON.stringify(localViewState.sortBy)
  const isFilterDirty = serverViewState.filter?.trim() !== localViewState.filter?.trim()

  const isVisibleFieldsDirty = areArraysDifferent(serverViewState.visibleFields, localViewState.visibleFields)

  const localHideItemsCount = !!localViewState.aggregationSettings?.hideItemsCount
  const serverHideItemsCount = !!serverViewState.aggregationSettings?.hideItemsCount
  const isAggregationSettingsDirty =
    localHideItemsCount !== serverHideItemsCount ||
    areArraysDifferent(localViewState.aggregationSettings?.sum || [], serverViewState.aggregationSettings?.sum || [])

  const isRoadmapDateFieldsDirty = areArraysDifferent(
    applyNoneFallback(localViewState.layoutSettings?.roadmap?.dateFields ?? []),
    applyNoneFallback(serverViewState.layoutSettings?.roadmap?.dateFields ?? []),
  ) // don't flag "None" as dirty for local view if unset on the server

  const isRoadmapMarkerFieldsDirty = arrayContainDifferentItems(
    localViewState.layoutSettings?.roadmap?.markerFields ?? [],
    serverViewState.layoutSettings?.roadmap?.markerFields ?? [],
  )
  // If zoom level has not been set, it defaults to a monthly view
  const isRoadmapZoomLevelDirty =
    (localViewState.layoutSettings?.roadmap?.zoomLevel || RoadmapZoomLevel.Month) !==
    (serverViewState.layoutSettings?.roadmap?.zoomLevel || RoadmapZoomLevel.Month)

  const isSliceByDirty = localViewState.sliceBy?.field !== serverViewState.sliceBy?.field
  const isSliceByFilterDirty = localViewState.sliceBy?.filter !== serverViewState.sliceBy?.filter

  return {
    isViewTypeDirty,
    isHorizontalGroupedByDirty,
    isVerticalGroupedByDirty,
    isSortedByDirty,
    isFilterDirty,
    isVisibleFieldsDirty,
    isAggregationSettingsDirty,
    isRoadmapDateFieldsDirty,
    isRoadmapZoomLevelDirty,
    isRoadmapMarkerFieldsDirty,
    isSliceByDirty,
    isSliceByFilterDirty,
    isViewStateDirty:
      isFilterDirty ||
      isHorizontalGroupedByDirty ||
      isVerticalGroupedByDirty ||
      isSortedByDirty ||
      isViewTypeDirty ||
      isVisibleFieldsDirty ||
      isAggregationSettingsDirty ||
      isRoadmapDateFieldsDirty ||
      isRoadmapZoomLevelDirty ||
      isRoadmapMarkerFieldsDirty ||
      isSliceByDirty ||
      isSliceByFilterDirty,
  }
}
