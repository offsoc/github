export interface DeleteMemexChartRequest {
  chartNumber: number
}

export interface CreateMemexChartRequest {
  chart: Omit<MemexChart, 'number' | 'name'> & {name?: string}
}

export interface UpdateMemexChartRequest {
  chartNumber: number
  chart: Partial<Omit<MemexChart, 'number'>>
}

export interface UpdateMemexChartNameRequest {
  chartNumber: number
  chart: Pick<MemexChart, 'name'>
}

export interface GetMemexChartResponse {
  chart: MemexChart
}

export interface MemexChart {
  // To reduce 'id' vs 'number' bugs, we exclusively rely on
  // a chart's number, which is unique by memex_project.
  number: number
  name: string
  configuration: MemexChartConfiguration
}

/**
 * Memex Insights chart configuration contract.
 * filter: client-side filter string.
 * xAxis dataSource: 'time' implies historical data via Insights query, else grouped by distinct column values.
 * column: all column references are by databaseId. Only columns with discrete, limited values are valid.
 * yAxis aggregate columns: column databaseIds to use when operation != 'count'.
 * time: time period captured when xAxis dataSource == 'time'.
 */
export interface MemexChartConfiguration {
  description?: string
  filter: string
  type: MemexChartType
  xAxis: MemexChartXAxis
  yAxis: MemexChartYAxis
  time?: MemexChartTime
}

export type MemexChartType = 'bar' | 'column' | 'line' | 'stacked-area' | 'stacked-bar' | 'stacked-column'
export const highChartTypes: Record<MemexChartType, string> = {
  bar: 'bar',
  column: 'column',
  line: 'line',
  'stacked-area': 'areaspline',
  'stacked-bar': 'bar',
  'stacked-column': 'column',
}

export const shouldApplyPointPlacement = (chartType: MemexChartType) =>
  chartType === 'line' || chartType === 'stacked-area'

export const isStacked = (chartType: MemexChartType) =>
  chartType === 'stacked-area' || chartType === 'stacked-bar' || chartType === 'stacked-column'

export type MemexChartOperation = 'count' | 'sum' | 'avg' | 'min' | 'max'
type MemexChartSortOrder = 'asc' | 'desc'

export interface MemexChartXAxis {
  dataSource: MemexChartXAxisDataSource
  groupBy?: MemexChartXAxisGroupBy
}

export interface MemexChartXAxisDataSource {
  column: 'time' | number
  sortOrder?: MemexChartSortOrder
}

interface MemexChartXAxisGroupBy {
  column: number
  sortOrder?: MemexChartSortOrder
}

export interface MemexChartYAxis {
  aggregate: MemexChartYAxisAggregate
}

export interface MemexChartYAxisAggregate {
  operation: MemexChartOperation
  columns?: Array<number>
  sortOrder?: MemexChartSortOrder
}

export interface MemexChartTime {
  period: MemexChartTimePeriod
  startDate?: string
  endDate?: string
}

export const MEMEX_CHART_TIME_PERIODS = ['2W', '1M', '3M', 'max', 'custom'] as const

export type MemexChartTimePeriod = (typeof MEMEX_CHART_TIME_PERIODS)[number]

export const DEFAULT_CHART_TIME_PERIOD: MemexChartTimePeriod = '2W'
