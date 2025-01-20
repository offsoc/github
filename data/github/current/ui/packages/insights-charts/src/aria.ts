import type {ChartData} from 'chart.js'
import type {SeriesData} from './types'

export const generateAriaLabelFromTimeSeriesData = (
  {datasets}: ChartData<'line'>,
  data: SeriesData,
  chartType: string | undefined,
  xAndYLabel: string[],
): string => {
  const humanReadableDate = (dateInteger: number) =>
    new Date(dateInteger).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const getMinMaxX = () => {
    if (!data.length) {
      return {min: 0, max: 0}
    }

    const vals = data
      .flatMap(d => d[0] || '')
      .filter(Boolean)
      .map(d => Date.parse(d))
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    return {min, max}
  }

  const getMinMaxY = () => {
    if (!data.length) {
      return {min: 0, max: 0}
    }

    const vals = data.flatMap(d => d[1] || 0)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    return {min, max}
  }

  const label = []
  label.push(`${chartType} chart describing time series data. It consists of ${datasets.length} series.`)

  const {min: xMin, max: xMax} = getMinMaxX()
  label.push(`The x-axis shows time from ${humanReadableDate(xMin)} to ${humanReadableDate(xMax)}.`)

  const {min: yMin, max: yMax} = getMinMaxY()
  label.push(
    `The y-axis shows data of type ${xAndYLabel[1]} with a minimum value of ${yMin} and a maximum value of ${yMax}.`,
  )

  label.push('This chart data can only be accessed as a table.')
  return label.join(' ')
}

export const generateAriaLabelFromCategoricalData = (
  {datasets}: ChartData<'line'>,
  data: SeriesData,
  chartType: string | undefined,
  xAndYLabel: string[],
): string => {
  const getMinMax = (index: number) => {
    if (!datasets.length) {
      return {min: 0, max: 0}
    }

    const vals = data.flatMap(d => d[index] || 0) as number[]
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    return {min, max}
  }

  const label = []
  label.push(`${chartType} chart describing discrete data. It consists of ${datasets.length} series.`)

  label.push(`The x-axis shows ${xAndYLabel[0]}.`)

  const {min: yMin, max: yMax} = getMinMax(1)
  label.push(`The y-axis shows ${xAndYLabel[1]} with a minimum value of ${yMin} and a maximum value of ${yMax}.`)

  label.push('This chart data can only be accessed as a table.')

  return label.join(' ')
}
