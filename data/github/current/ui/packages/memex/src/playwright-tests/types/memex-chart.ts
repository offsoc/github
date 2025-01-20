/**
 * Memex Insights chart configuration contract.
 * filter: client-side filter string.
 * xAxis dataSource: 'time' implies historical data via Insights query, else grouped by distinct column values.
 * column: all column references are by databaseId. Only columns with discrete, limited values are valid.
 * yAxis aggregate columns: column databaseIds to use when operation != 'count'.
 */
export interface MemexChartConfiguration {
  description?: string
  filter: string
  type: MemexChartType
  xAxis: MemexChartXAxis
  yAxis: MemexChartYAxis
}

type MemexChartType = 'bar' | 'column' | 'line' | 'stacked-area' | 'stacked-bar' | 'stacked-column'
type MemexChartOperation = 'count' | 'sum' | 'avg' | 'min' | 'max'
type MemexChartSortOrder = 'asc' | 'desc'

interface MemexChartXAxis {
  dataSource: MemexChartXAxisDataSource
  groupBy?: MemexChartXAxisGroupBy
}

interface MemexChartXAxisDataSource {
  column: 'time' | number
  sortOrder?: MemexChartSortOrder
}

interface MemexChartXAxisGroupBy {
  column: number
  sortOrder?: MemexChartSortOrder
}

interface MemexChartYAxis {
  aggregate: MemexChartYAxisAggregate
}

interface MemexChartYAxisAggregate {
  operation: MemexChartOperation
  columns?: Array<number>
  sortOrder?: MemexChartSortOrder
}
