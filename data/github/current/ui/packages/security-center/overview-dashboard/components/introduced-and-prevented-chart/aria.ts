import {humanReadableDate} from '../../../common/utils/date-formatter'
import type {IntroducedAndPreventedResult} from './use-introduced-and-prevented-chart-data'

/**
 * Generates an ARIA label for a line chart describing introduced vs prevented alerts over time.
 * @param {IntroducedAndPreventedResult} introducedAndPrevented - An array of arrays of chart data objects.
 * @returns {string} - The generated ARIA label.
 */
export const generateAriaLabelForIntroducedAndPrevented = (
  introducedAndPrevented?: IntroducedAndPreventedResult,
): string => {
  if (introducedAndPrevented === undefined) {
    return `Empty chart. Introduced and prevented trends could not be loaded right now.`
  }

  if (introducedAndPrevented.length === 0) {
    return `Empty chart. There are no introduced or prevented alerts in this period.`
  }

  const label = []
  label.push('Line chart describing the introduced and prevented alert trends over time.')
  label.push(`It consists of ${introducedAndPrevented.length} time series.`)

  const firstSeries = introducedAndPrevented[0]
  if (firstSeries?.data.length) {
    const startDate = new Date(firstSeries.data[0]!.x)
    const startDateStr = humanReadableDate(startDate, {includeYear: true})
    const endDate = new Date(firstSeries.data.at(-1)!.x)
    const endDateStr = humanReadableDate(endDate, {includeYear: true})
    label.push(`The x-axis shows dates from ${startDateStr} to ${endDateStr}.`)
  }

  const labels = introducedAndPrevented.map(x => x.label)
  if (labels.length > 0) {
    label.push(`The y-axis shows counts of alerts that are ${labels.join(' or ')}.`)
  }

  label.push('This chart data can only be accessed as a table.')
  return label.join(' ')
}
