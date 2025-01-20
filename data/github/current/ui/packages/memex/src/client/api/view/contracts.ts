export const ViewTypeParam = {
  Table: 'table_layout',
  Board: 'board_layout',
  List: 'list_layout',
  Roadmap: 'roadmap_layout',
} as const
export type ViewTypeParam = ObjectValues<typeof ViewTypeParam>
/**
 * These fields should not be sent to the backend when attempting to update a
 * view.
 */
type DefaultOmittedKeysForView = 'id' | 'number' | 'createdAt' | 'updatedAt' | 'priority'

export type FieldOperation = 'sum'

export type AggregationSettings = {
  hideItemsCount?: boolean
  sum: Array<number>
}

export const getDefaultAggregationSettings = () => ({
  hideItemsCount: false,
  sum: [],
})

export const DefaultOmitPropertiesForView: Array<DefaultOmittedKeysForView> = [
  'id',
  'number',
  'createdAt',
  'updatedAt',
  'priority',
]

export type SortDirection = 'asc' | 'desc'

export type ViewSort = [columnDatabaseId: number, direction: SortDirection]

export type ViewSorts = ReadonlyArray<ViewSort>

export interface PageView {
  id: number
  number: number
  name: string
  priority: number | null
  groupBy: Array<number>
  verticalGroupBy: Array<number>
  sortBy: ViewSorts
  visibleFields: Array<number>
  filter: string | null
  layout: ViewTypeParam
  aggregationSettings: AggregationSettings | null
  createdAt: string
  updatedAt: string
  layoutSettings: LayoutSettings
  sliceBy: SliceBy | null
  sliceValue: string | null
}

interface PageViewParams
  extends Omit<PageView, 'id' | 'number' | 'filter' | 'createdAt' | 'updatedAt' | 'priority' | 'sliceValue'> {
  filter: string
  id?: never
  number?: never
  createdAt?: never
  updatedAt?: never
  priority?: never
  previousMemexProjectViewId?: number | string
  sliceValue?: string | null
}

export interface PageViewCreateRequest {
  view: Partial<PageViewParams>
}

export interface PageViewUpdateRequest {
  viewNumber: number
  view: PageViewParams
}

export interface PageViewDeleteRequest {
  viewNumber: number
}

export interface PageViewCreateResponse {
  view: PageView
}

export type PageViewUpdateResponse = PageViewCreateResponse

export type LayoutSettings = {
  table?: TableLayoutSettings
  board?: BoardLayoutSettings
  roadmap?: RoadmapLayoutSettings
}
export type ColumnWidths = Record<string, number>
export type ColumnLimits = Readonly<{
  [columnDatabaseId: number]: Readonly<{
    [optionId: string]: number | undefined
  }>
}>

type BoardLayoutSettings = Readonly<{
  columnLimits?: ColumnLimits
}>
export type TableLayoutSettings = {
  columnWidths?: ColumnWidths
}

export const RoadmapDateFieldNone = 'none'
export type RoadmapDateFieldNone = typeof RoadmapDateFieldNone

export const RoadmapZoomLevel = {
  Month: 'month',
  Quarter: 'quarter',
  Year: 'year',
} as const
export type RoadmapZoomLevel = ObjectValues<typeof RoadmapZoomLevel>
export type RoadmapLayoutSettings = {
  dateFields?: Array<number | RoadmapDateFieldNone>
  markerFields?: Array<number>
  zoomLevel?: RoadmapZoomLevel
  columnWidths?: ColumnWidths
}

export type SliceBy = {
  field?: number
  filter?: string
  panelWidth?: number
}
export const sliceValue = 'sliceValue'
