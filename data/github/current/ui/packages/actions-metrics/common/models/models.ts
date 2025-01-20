import type {Icon} from '@primer/octicons-react'
import type {DateRangeType, OperatorType, ExportStatus, OrderByDirection, RequestType} from './enums'
export interface Repository {
  name: string
  public: boolean
  url: string
  id: number
}

export interface MetricsItem {
  id: string | number
}

export interface MetricsRunnerItem extends MetricsItem {
  runnerType?: string
  runnerRuntime?: string
}

export interface MetricsViewReadOnly extends Readonly<MetricsView> {}

export interface MetricsView extends MetricsRequest {
  // Be sure to update the DEFAULT_VIEW in metrics service when adding new properties
  org?: string
  totalItems?: number
  virtualOffset: number
  virtualPageSize: number
  startTime: Date
  endTime: Date
}

export interface MetricsRequest {
  // Be sure to update the DEFAULT_VIEW in metrics service when adding new properties
  dateRangeType?: DateRangeType
  filters?: FilterValue[]
  offset: number
  pageSize: number
  orderBy?: OrderBy
  requestType?: RequestType
  tab?: string
  version?: string
}

export interface MetricsResponse<T extends MetricsResponseItem> {
  items: T[]
  date_range_type?: DateRangeType
  offset: number
  org?: string
  page_size: number
  request_type?: RequestType
  total_items: number
  order_by?: OrderBy
  tab?: string
  start_time: Timestamp
  end_time: Timestamp
  version?: string
}

export interface MetricsResponseItem {}

export interface FilterValue {
  key: string
  values: string[]
  display?: string
  order: number
  operator: OperatorType
}

export interface OrderBy {
  field: string
  direction: OrderByDirection
}

export interface StartExportResponse {
  export_id: string
}

export interface ExportStatusResponse {
  download_url: string
  status: ExportStatus
}

export interface MetricsExportRequest extends Omit<MetricsRequest, 'offset'> {
  headers: ColumnHeader[]
}

export interface MetricsExportStatusRequest {
  exportId: string
}

export interface ColumnHeader {
  key: string
  display: string
}

export interface MetricsTab {
  displayValue?: string
  icon: Icon
  value: string
}

export interface ApproximateNumber {
  count: number
  approximate: boolean
}

export interface MetricsPayload {
  // Update this type to reflect the data you place in payload in Rails
  enabled_features?: {[key: string]: boolean}
  paths?: {[key: string]: string}
  org?: string
  scope?: string
}

export interface Timestamp {
  seconds: number
  nanos: number
}

export type Summary = {[key: string]: number}

export interface CardData extends CardHeading {
  metric: string
  value: number
  format?: (value: number) => string
}

export interface CardHeading {
  title: string
  description: string
  format?: (value: number) => string
}
