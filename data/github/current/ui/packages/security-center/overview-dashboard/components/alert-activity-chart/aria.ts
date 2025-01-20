import {humanReadableDate} from '../../../common/utils/date-formatter'
import type {AlertActivityChartData} from './fetch-types'

/**
 * Generates an ARIA label for a bar chart describing alert activity over time.
 * @param {AlertActivityChartData[]} datasets - An array of chart data objects.
 * @returns {string} - The generated ARIA label.
 */
export const generateAriaLabelForAlertActivity = (datasets: AlertActivityChartData[], isError?: boolean): string => {
  const getMinMaxX = (): {min: Date; max: Date} | null => {
    if (!datasets.length) {
      return null
    }

    const dates = []
    for (const d of datasets) {
      dates.push(Date.parse(d.date), Date.parse(d.endDate))
    }

    const min = new Date(Math.min(...dates))
    const max = new Date(Math.max(...dates))
    return {min, max}
  }

  const dateOptions = {includeYear: false}
  const label = []
  if (isError) {
    label.push(`Empty chart. Alert activity could not be loaded right now.`)
  } else if (!datasets.length) {
    label.push(`Empty chart. There are no alert activities in this period.`)
  } else {
    label.push(`Bar chart describing alert activity over time. It consists of ${datasets.length} data points.`)

    const xMinMax = getMinMaxX()
    if (xMinMax) {
      label.push(
        `The x-axis shows dates from ${humanReadableDate(xMinMax.min, dateOptions)} to ${humanReadableDate(
          xMinMax.max,
          dateOptions,
        )}.`,
      )

      label.push(`The y-axis shows counts of newly created alerts, closed alerts, and net alert activity.`)
    }
  }

  label.push('This chart data can only be accessed as a table.')
  return label.join(' ')
}
