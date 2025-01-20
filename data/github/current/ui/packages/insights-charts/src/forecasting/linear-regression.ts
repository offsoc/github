import SimpleLinearRegression from 'ml-regression-simple-linear'
import type {SeriesData, SeriesDataItem, Datelike} from '../types'

export type InsightsForecastOptions = {
  roundTo?: number
  allowNegative?: boolean
}

export const regression = (x: number[], y: number[]) => {
  return new SimpleLinearRegression(x, y)
}
const isGroupedSeries = (series: SeriesData): boolean => {
  return series[0]?.length === 3
}

export const forecast = (
  series: SeriesData,
  daysInFuture = 5,
  options: InsightsForecastOptions = {},
): {series: SeriesData; forecastStartdate: Datelike} => {
  if (isGroupedSeries(series)) {
    const result: SeriesData = forecastForGroupedTimeSeries(series, daysInFuture, options).map(
      ([date, value, group]: SeriesDataItem) => {
        return [new Date(date).toISOString(), value, group]
      },
    )
    return {series: result, forecastStartdate: result[0]?.[0] as Datelike}
  }
  const result: SeriesData = forecastForTimeSeries(series, daysInFuture, options).map(
    ([date, value]: SeriesDataItem) => {
      return [new Date(date).toISOString(), value]
    },
  )
  return {series: result, forecastStartdate: result[0]?.[0] as Datelike}
}

export const forecastAndAppend = (
  series: SeriesData,
  daysInFuture = 5,
  options: InsightsForecastOptions = {},
): {series: SeriesData; forecastStartdate: Datelike} => {
  const result = forecast(series, daysInFuture, options)
  return {series: series.concat(result.series), forecastStartdate: result.forecastStartdate}
}

const forecastForGroupedTimeSeries = (
  series: SeriesData,
  daysInFuture: number,
  options: InsightsForecastOptions,
): SeriesData => {
  const groupedSeries = series.reduce<{[k: string]: SeriesData}>((acc, row) => {
    const group = row[2] || 'Y Value'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push([row[0], row[1]])
    return acc
  }, {})

  return Object.keys(groupedSeries).reduce<SeriesData>((acc, group) => {
    const fc = forecastForTimeSeries(groupedSeries[group] as SeriesData, daysInFuture, options)
    return acc.concat(fc.map((f: SeriesDataItem) => [f[0], f[1], group]))
  }, [])
}

const forecastForTimeSeries = (
  series: SeriesData,
  daysInFuture: number,
  options: InsightsForecastOptions,
): SeriesData => {
  const r = regression(
    series.map(row => datelikeToNumber(row[0])),
    series.map(row => row[1] || 0),
  )

  const lastOriginalDate = new Date(
    String(series.sort((a, b) => datelikeToNumber(b[0]) - datelikeToNumber(a[0]))[0]?.[0]),
  )

  const fc = [] as SeriesData
  for (let i = 0; i < daysInFuture; i++) {
    lastOriginalDate.setUTCDate(lastOriginalDate.getUTCDate() + 1)

    const rounded = handleRounding({roundTo: options.roundTo, lastOriginalDate, series, r})
    fc.push([lastOriginalDate.toISOString(), handleNegative(rounded, options.allowNegative)])
  }

  return fc
}

const handleNegative = (val: number, allowNegative?: boolean) => {
  if (allowNegative === true) {
    return val
  }

  if (val < 0) {
    return 0
  }

  return val
}

/**
 * Takes a number | string | Date and returns it as an epoch number in ZULU time
 * @param datelike
 * @returns
 */
const datelikeToNumber = (datelike: Datelike): number => {
  if (typeof datelike === 'number') {
    return datelike
  } else if (typeof datelike === 'string') {
    return new Date(datelike).getTime()
  } else {
    return datelike.getTime()
  }
}

type HandleRoundingParams = {
  roundTo?: number
  lastOriginalDate: Date
  series: SeriesData
  r: SimpleLinearRegression
}
const handleRounding = ({roundTo, lastOriginalDate, series, r}: HandleRoundingParams) => {
  // if roundTo is 0, return the closest whole number
  if (roundTo === 0) {
    return Math.round(r.predict(lastOriginalDate.getTime()))
  } else if (roundTo) {
    // round to number of decimal places specified in options.roundTo
    const roundTarget = Math.pow(10, roundTo)
    const roundedPredicted =
      Math.round((r.predict(lastOriginalDate.getTime()) + Number.EPSILON) * roundTarget) / roundTarget
    return roundedPredicted
  } else {
    // check for the greatest number of decimal places in the original series and use that as the rounding target
    const customRoundTo = series.reduce((acc, row) => {
      const decimalPlaces = (row[1] || 0).toString().split('.')[1]?.length || 0
      return Math.max(acc, decimalPlaces)
    }, 0)

    const roundTarget = Math.pow(10, customRoundTo)
    const roundedPredicted =
      Math.round((r.predict(lastOriginalDate.getTime()) + Number.EPSILON) * roundTarget) / roundTarget
    return roundedPredicted
  }
}
