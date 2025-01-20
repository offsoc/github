import isEqual from 'lodash-es/isEqual'

import type {MemexChartOperation, MemexChartType} from '../../api/charts/contracts/api'
import {
  END_DATE_PARAM,
  FILTER_QUERY_PARAM,
  PERIOD_PARAM,
  START_DATE_PARAM,
  VIEW_TYPE_PARAM,
  X_AXIS_DATASOURCE_COLUMN_PARAM,
  X_AXIS_GROUP_BY_PARAM,
  Y_AXIS_AGGREGATE_COLUMNS_PARAM,
  Y_AXIS_AGGREGATE_OPERATION_PARAM,
} from '../../platform/url'
import type {ChartState} from './use-charts'

export function getDirtyChartState({localVersion, serverVersion}: ChartState) {
  const localConfig = localVersion.configuration
  const serverConfig = serverVersion.configuration

  const isFilterDirty = localConfig.filter.trim() !== serverConfig.filter.trim()
  const isTypeDirty = localConfig.type !== serverConfig.type

  const isXAxisColumnDirty = localConfig.xAxis.dataSource.column !== serverConfig.xAxis.dataSource.column
  const isXAxisSortOrderDirty = localConfig.xAxis.dataSource.sortOrder !== serverConfig.xAxis.dataSource.sortOrder
  const isXAxisGroupByColumnDirty = localConfig.xAxis.groupBy?.column !== serverConfig.xAxis.groupBy?.column
  const isXAxisGroupBySortOrderDirty = localConfig.xAxis.groupBy?.sortOrder !== serverConfig.xAxis.groupBy?.sortOrder
  const isXAxisDirty =
    isXAxisColumnDirty || isXAxisSortOrderDirty || isXAxisGroupByColumnDirty || isXAxisGroupBySortOrderDirty

  const isYAxisAggregateOperationDirty =
    localConfig.yAxis.aggregate.operation !== serverConfig.yAxis.aggregate.operation
  const isYAxisAggregateColumnsDirty = !isEqual(
    localConfig.yAxis.aggregate.columns,
    serverConfig.yAxis.aggregate.columns,
  )
  const isYAxisDirty = isYAxisAggregateOperationDirty || isYAxisAggregateColumnsDirty

  const isPeriodDirty = localConfig.time?.period !== serverConfig.time?.period
  const isStartDateDirty = localConfig.time?.startDate !== serverConfig.time?.startDate
  const isEndDateDirty = localConfig.time?.endDate !== serverConfig.time?.endDate
  const isTimePeriodDirty = isPeriodDirty || isStartDateDirty || isEndDateDirty

  const isConfigurationDirty = isTypeDirty || isXAxisDirty || isYAxisDirty

  return {
    isXAxisColumnDirty,
    isXAxisGroupByColumnDirty,
    isXAxisGroupBySortOrderDirty,
    isXAxisDirty,
    isYAxisAggregateOperationDirty,
    isYAxisAggregateColumnsDirty,
    isFilterDirty,
    isConfigurationDirty,
    isTimePeriodDirty,
    isDirty: isConfigurationDirty || isFilterDirty || isTimePeriodDirty,
  }
}

export function isHistoricalChart(chart: Pick<ChartState, 'localVersion'>) {
  return chart.localVersion.configuration.xAxis.dataSource.column === 'time'
}

export function isDefaultChart(chart: ChartState) {
  return chart.number <= 0
}

export function getParamsForConfigResetToServerState(searchParams: URLSearchParams) {
  const nextParams = new URLSearchParams(searchParams)
  nextParams.delete(VIEW_TYPE_PARAM)
  nextParams.delete(X_AXIS_DATASOURCE_COLUMN_PARAM)
  nextParams.delete(X_AXIS_GROUP_BY_PARAM)
  nextParams.delete(Y_AXIS_AGGREGATE_COLUMNS_PARAM)
  nextParams.delete(Y_AXIS_AGGREGATE_OPERATION_PARAM)
  return nextParams
}

export function getParamsForFullResetToServerState(searchParams: URLSearchParams) {
  const nextParams = new URLSearchParams(searchParams)
  nextParams.delete(FILTER_QUERY_PARAM)
  nextParams.delete(VIEW_TYPE_PARAM)
  nextParams.delete(X_AXIS_DATASOURCE_COLUMN_PARAM)
  nextParams.delete(X_AXIS_GROUP_BY_PARAM)
  nextParams.delete(Y_AXIS_AGGREGATE_COLUMNS_PARAM)
  nextParams.delete(Y_AXIS_AGGREGATE_OPERATION_PARAM)
  nextParams.delete(PERIOD_PARAM)
  nextParams.delete(START_DATE_PARAM)
  nextParams.delete(END_DATE_PARAM)
  return nextParams
}

const CHART_LAYOUTS: {[key in MemexChartType]: key} = {
  bar: 'bar',
  column: 'column',
  line: 'line',
  'stacked-area': 'stacked-area',
  'stacked-bar': 'stacked-bar',
  'stacked-column': 'stacked-column',
}

export function isChartLayout(str: string): str is MemexChartType {
  return str in CHART_LAYOUTS
}

const OPERATIONS: {[key in MemexChartOperation]: key} = {
  sum: 'sum',
  count: 'count',
  max: 'max',
  min: 'min',
  avg: 'avg',
}

export function isAggregateOperation(str: string): str is MemexChartOperation {
  return str in OPERATIONS
}

export function applyMemexChartOperation({
  memexChartOperation,
  values,
}: {
  memexChartOperation: MemexChartOperation
  values: Array<number>
}) {
  switch (memexChartOperation) {
    case 'sum':
      return values.reduce((acc, curr) => acc + curr, 0)
    case 'avg':
      return values.length === 0 ? null : values.reduce((acc, curr) => acc + curr, 0) / values.length
    case 'min':
      return values.length === 0 ? null : Math.min(...values)
    case 'max':
      return values.length === 0 ? null : Math.max(...values)
    default:
      throw new Error(`Unknown memex chart operation: ${memexChartOperation}`)
  }
}
