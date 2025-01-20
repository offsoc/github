import {humanReadableDate} from '../../../common/utils/date-formatter'
import type {AlertTrend} from './fetch-types'

/**
 * Generates an ARIA label for a line chart describing alert trends over time.
 * @param {AlertTrend[][]} datasets - An array of arrays of chart data objects.
 * @param {boolean} isOpenSelected - A boolean indicating whether the chart is showing open or closed alerts.
 * @returns {string} - The generated ARIA label.
 */
export const generateAriaLabelForAlertTrends = (
  datasets: AlertTrend[][],
  isOpenSelected: boolean,
  isError?: boolean,
): string => {
  const getMinMaxX = (): {min: Date; max: Date} | null => {
    if (!datasets.flatMap(d => d).length) {
      return null
    }

    const dates = datasets.flatMap(data => data.map(d => Date.parse(d.x)))
    const min = new Date(Math.min(...dates))
    const max = new Date(Math.max(...dates))
    return {min, max}
  }

  const getAvailableSeverities = (): string[] => {
    if (!datasets.flatMap(d => d).length) {
      return []
    }

    const severities = []
    const low = datasets[0]?.reduce((acc, curr) => acc + curr.y, 0) || 0
    const medium = datasets[1]?.reduce((acc, curr) => acc + curr.y, 0) || 0
    const high = datasets[2]?.reduce((acc, curr) => acc + curr.y, 0) || 0
    const critical = datasets[3]?.reduce((acc, curr) => acc + curr.y, 0) || 0

    if (low > 0) severities.push('low')
    if (medium > 0) severities.push('medium')
    if (high > 0) severities.push('high')
    if (critical > 0) severities.push('critical')

    return severities
  }

  const dateOptions = {includeYear: true}
  const state = isOpenSelected ? 'open' : 'closed'
  const severities = getAvailableSeverities()
  const label = []
  if (isError) {
    label.push(`Empty chart. Alert trends could not be loaded right now.`)
  } else if (!datasets.flatMap(d => d).length) {
    label.push(`Empty chart. There are no ${state} alerts in this period.`)
  } else {
    label.push(
      `Line chart describing ${state} alert trends over time. It consists of ${severities.length} time series.`,
    )

    const xMinMax = getMinMaxX()
    if (xMinMax) {
      label.push(
        `The x-axis shows dates from ${humanReadableDate(xMinMax.min, dateOptions)} to ${humanReadableDate(
          xMinMax.max,
          dateOptions,
        )}.`,
      )
    }

    if (severities.length > 0) {
      label.push(`The y-axis shows counts of alerts with ${severities.join(', ')} severities.`)
    }
  }

  label.push('This chart data can only be accessed as a table.')
  return label.join(' ')
}
