import type {
  AggregationSettings,
  ColumnLimits,
  ColumnWidths,
  PageView,
  RoadmapDateFieldNone,
  RoadmapZoomLevel,
  SortDirection,
} from '../../api/view/contracts'
import type {ViewType} from '../../helpers/view-type'
import type {ColumnModel} from '../../models/column-model'

/**
 * View payload with filter as a string always to avoid
 * needing to ?? '' everywhere
 */
export type NormalizedPageView = Omit<PageView, 'filter' | 'aggregationSettings'> & {
  filter: string
  aggregationSettings: AggregationSettings
}

export type BaseViewState = {
  id: NormalizedPageView['id']
  name: NormalizedPageView['name']
  number: NormalizedPageView['number']
  isDeleted?: boolean
  /**
   * The view state as sent from the server
   */
  serverViewState: NormalizedPageView
  /**
   * The server view state with local changes applied
   */
  localViewState: NormalizedPageView
}

export type ViewsMap = {[viewId: number]: BaseViewState}
export type BaseViewsState = {
  /**
   * A list of available views
   */
  views: ViewsMap
  currentViewNumber: number | undefined
  viewsOrder: Array<number> | undefined
}

export interface LocalSort {
  column: ColumnModel
  direction: SortDirection
}

/**
 * The view state deserialized, replacing ids with
 * {@link ColumnModel} instances
 */
export type LocalViewStateDeserialized = {
  id: number
  number: number
  name: string
  visibleFields: ReadonlyArray<ColumnModel>
  filter: string
  viewType: ViewType
  horizontalGroupByColumns: ReadonlyArray<ColumnModel>
  verticalGroupByColumns: ReadonlyArray<ColumnModel>
  sortByColumnsAndDirections: ReadonlyArray<LocalSort>
  aggregationSettings: {
    hideItemsCount?: boolean
    sum: ReadonlyArray<ColumnModel>
  }
  layoutSettings: {
    board?: {
      columnLimits?: ColumnLimits
    }
    roadmap?: {
      markerFields: ReadonlyArray<ColumnModel>
      dateFields: ReadonlyArray<ColumnModel | RoadmapDateFieldNone>
      zoomLevel?: RoadmapZoomLevel
      columnWidths?: ColumnWidths
    }
    table?: {
      columnWidths?: ColumnWidths
    }
  }
  createdAt: string
  updatedAt: string
  sliceBy: {
    field: ColumnModel | undefined
    filter: string
    panelWidth?: number
  }
  sliceValue: string | null
}

export type CurrentView = BaseViewState & {
  localViewStateDeserialized: LocalViewStateDeserialized
} & ViewIsDirtyStates &
  Pick<NormalizedPageView, 'name' | 'number' | 'id'>

/**
 * Properties that track which portions of the view state is
 * dirty between server and local
 */
export type ViewIsDirtyStates = {
  isViewTypeDirty: boolean
  isHorizontalGroupedByDirty: boolean
  isVerticalGroupedByDirty: boolean
  isSortedByDirty: boolean
  isFilterDirty: boolean
  isVisibleFieldsDirty: boolean
  isViewStateDirty: boolean
  isAggregationSettingsDirty: boolean
  isRoadmapDateFieldsDirty: boolean
  isRoadmapZoomLevelDirty: boolean
  isRoadmapMarkerFieldsDirty: boolean
  isSliceByDirty: boolean
  isSliceByFilterDirty: boolean
}

/**
 * The complete view state object
 */
export type ViewState = BaseViewsState
