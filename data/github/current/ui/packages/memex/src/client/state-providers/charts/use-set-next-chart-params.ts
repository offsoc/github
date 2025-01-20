import isEqual from 'lodash-es/isEqual'
import {useCallback, useMemo} from 'react'

import type {MemexChartTime, MemexChartType, MemexChartXAxis, MemexChartYAxis} from '../../api/charts/contracts/api'
import {useInsightsEnabledFeatures} from '../../pages/insights/hooks/use-insights-features'
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
import {useSearchParams} from '../../router'
import type {ChartState} from './use-charts'

function updateFilterParam(searchParams: URLSearchParams, newFilterQuery: string, oldFilterQuery: string) {
  if (newFilterQuery !== oldFilterQuery) {
    searchParams.set(FILTER_QUERY_PARAM, newFilterQuery)
  } else {
    searchParams.delete(FILTER_QUERY_PARAM)
  }
}

function updateTypeParam(searchParams: URLSearchParams, newType: MemexChartType, oldType: MemexChartType) {
  if (newType === oldType) {
    searchParams.delete(VIEW_TYPE_PARAM)
  } else {
    searchParams.set(VIEW_TYPE_PARAM, newType)
  }
}

function updateXAxisParams(searchParams: URLSearchParams, newXAxis: MemexChartXAxis, oldXAxis: MemexChartXAxis) {
  if (isEqual(newXAxis, oldXAxis)) {
    searchParams.delete(X_AXIS_DATASOURCE_COLUMN_PARAM)
    searchParams.delete(X_AXIS_GROUP_BY_PARAM)
  } else {
    searchParams.set(X_AXIS_DATASOURCE_COLUMN_PARAM, `${newXAxis.dataSource.column}`)
    searchParams.set(X_AXIS_GROUP_BY_PARAM, newXAxis.groupBy ? `${newXAxis.groupBy.column}` : '')
  }
}

function updateYAxisParams(searchParams: URLSearchParams, newYAxis: MemexChartYAxis, oldYAxis: MemexChartYAxis) {
  if (isEqual(newYAxis, oldYAxis)) {
    searchParams.delete(Y_AXIS_AGGREGATE_OPERATION_PARAM)
    searchParams.delete(Y_AXIS_AGGREGATE_COLUMNS_PARAM)
  } else {
    searchParams.set(Y_AXIS_AGGREGATE_OPERATION_PARAM, newYAxis.aggregate.operation)
    searchParams.set(
      Y_AXIS_AGGREGATE_COLUMNS_PARAM,
      newYAxis.aggregate.columns ? newYAxis.aggregate.columns.join(',') : '',
    )
  }
}

function updateTimeParams(searchParams: URLSearchParams, newTime?: MemexChartTime, oldTime?: MemexChartTime) {
  if (!newTime || isEqual(newTime, oldTime)) {
    searchParams.delete(PERIOD_PARAM)
    searchParams.delete(START_DATE_PARAM)
    searchParams.delete(END_DATE_PARAM)
  } else if (newTime.period === 'custom') {
    searchParams.set(PERIOD_PARAM, newTime.period)
    searchParams.set(START_DATE_PARAM, newTime.startDate || '')
    searchParams.set(END_DATE_PARAM, newTime.endDate || '')
  } else {
    searchParams.set(PERIOD_PARAM, newTime.period)
    searchParams.delete(START_DATE_PARAM)
    searchParams.delete(END_DATE_PARAM)
  }
}

/**
 * Given a chart state, construct a set of search params that
 * should exist when navigating to that chart
 */
export function useGetChartLinkParameters() {
  const {hasUnlimitedSavedCharts} = useInsightsEnabledFeatures()

  const getChartLinkParameters = useCallback(
    (chart: ChartState) => {
      const localChartConfig = chart.localVersion.configuration
      const previousChartConfig = chart.serverVersion.configuration
      const nextParams = new URLSearchParams()
      if (hasUnlimitedSavedCharts) {
        updateTypeParam(nextParams, localChartConfig.type, previousChartConfig.type)
        updateXAxisParams(nextParams, localChartConfig.xAxis, previousChartConfig.xAxis)
        updateYAxisParams(nextParams, localChartConfig.yAxis, previousChartConfig.yAxis)
      }
      updateFilterParam(nextParams, localChartConfig.filter, previousChartConfig.filter)
      updateTimeParams(nextParams, localChartConfig.time, previousChartConfig.time)

      return nextParams
    },
    [hasUnlimitedSavedCharts],
  )
  return {getChartLinkParameters}
}

function useGetNextChartParams() {
  const [searchParams] = useSearchParams()
  const {hasUnlimitedSavedCharts} = useInsightsEnabledFeatures()

  /**
   * When receiving a partial update for a chart, we want to update the
   * the bits of search parameters that are relevant to the charts changes
   */
  const getNextSearchParamsForConfigurationUpdate = useCallback(
    (nextChartConfig: Partial<ChartState['localVersion']['configuration']>, previousChart: ChartState) => {
      const previousChartConfig = previousChart.serverVersion.configuration
      const nextParams = new URLSearchParams(searchParams)

      // To prevent users from simply bookmarking various transient chart configurations,
      // we don't update the URL if they don't have unlimited saved charts (except for filter and time).
      if (hasUnlimitedSavedCharts) {
        if (nextChartConfig.type) {
          updateTypeParam(nextParams, nextChartConfig.type, previousChartConfig.type)
        }

        if (nextChartConfig.xAxis) {
          updateXAxisParams(nextParams, nextChartConfig.xAxis, previousChartConfig.xAxis)
        }

        if (nextChartConfig.yAxis) {
          updateYAxisParams(nextParams, nextChartConfig.yAxis, previousChartConfig.yAxis)
        }
      }

      if (typeof nextChartConfig.filter === 'string') {
        updateFilterParam(nextParams, nextChartConfig.filter, previousChartConfig.filter)
      }

      updateTimeParams(nextParams, nextChartConfig.time, previousChartConfig.time)

      return nextParams
    },
    [hasUnlimitedSavedCharts, searchParams],
  )

  return {getNextSearchParamsForConfigurationUpdate}
}
/**
 * Given a partial chart and a current chart, update the URL to reflect the new chart
 * config as a change set from the current chart config, and the current params
 */
export function useSetNextChartParams(chart: ChartState) {
  const [searchParams, setSearchParams] = useSearchParams()
  const {getNextSearchParamsForConfigurationUpdate} = useGetNextChartParams()

  const setNextChartParams = useCallback(
    (
      nextChartConfig: Partial<ChartState['localVersion']['configuration']>,
      {replace = false}: {replace?: boolean} = {},
    ) => {
      const nextParams = getNextSearchParamsForConfigurationUpdate(nextChartConfig, chart)
      if (searchParams.toString() === nextParams.toString()) return
      setSearchParams(nextParams, {replace})
    },
    [getNextSearchParamsForConfigurationUpdate, chart, searchParams, setSearchParams],
  )

  return useMemo(
    () => ({
      setNextChartParams,
    }),

    [setNextChartParams],
  )
}
