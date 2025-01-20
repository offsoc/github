import {useEffect} from 'react'

import {
  DEFAULT_CHART_TIME_PERIOD,
  MEMEX_CHART_TIME_PERIODS,
  type MemexChartTime,
  type MemexChartTimePeriod,
} from '../../../api/charts/contracts/api'
import {END_DATE_PARAM, PERIOD_PARAM, START_DATE_PARAM} from '../../../platform/url'
import {useSearchParams} from '../../../router'
import {isHistoricalChart} from '../../../state-providers/charts/chart-helpers'
import {useChartActions} from '../../../state-providers/charts/use-chart-actions'
import type {ChartState} from '../../../state-providers/charts/use-charts'

const getPeriodFromSearchParams = (searchParams: URLSearchParams, time?: MemexChartTime): MemexChartTimePeriod => {
  const period = searchParams.get(PERIOD_PARAM)
  if (period && MEMEX_CHART_TIME_PERIODS.includes(period as MemexChartTimePeriod)) {
    return period as MemexChartTimePeriod
  }
  return time?.period ?? DEFAULT_CHART_TIME_PERIOD
}

const isValidDate = (date?: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  return !!date && dateRegex.test(date)
}

const getValidatedChartTime = (searchParams: URLSearchParams, time?: MemexChartTime): MemexChartTime => {
  const period = getPeriodFromSearchParams(searchParams, time)
  const validatedTime: MemexChartTime = {period}
  if (period === 'custom') {
    const startDate = searchParams.get(START_DATE_PARAM) ?? time?.startDate
    const endDate = searchParams.get(END_DATE_PARAM) ?? time?.endDate
    if (isValidDate(startDate) && isValidDate(endDate)) {
      validatedTime['startDate'] = startDate
      validatedTime['endDate'] = endDate
    } else {
      // If the dates are invalid, fallback to the local configuration
      // or use the default period
      validatedTime.period = time?.period ?? DEFAULT_CHART_TIME_PERIOD
    }
  }
  return validatedTime
}

export function useInsightsTime(chart: Pick<ChartState, 'localVersion' | 'number'>) {
  const isHistorical = isHistoricalChart(chart)
  const [searchParams] = useSearchParams()
  const {time} = chart.localVersion.configuration
  const {period, startDate, endDate} = getValidatedChartTime(searchParams, time)

  const {updateLocalChartConfiguration} = useChartActions()

  useEffect(() => {
    if (isHistorical && period !== 'custom') {
      updateLocalChartConfiguration(chart.number, {time: {period}})
    }
  }, [chart.number, isHistorical, period, updateLocalChartConfiguration])

  useEffect(() => {
    if (isHistorical && !!startDate && !!endDate) {
      updateLocalChartConfiguration(chart.number, {
        time: {
          period: 'custom',
          startDate,
          endDate,
        },
      })
    }
  }, [chart.number, isHistorical, startDate, endDate, updateLocalChartConfiguration])

  return {
    endDate,
    period,
    startDate,
  }
}
