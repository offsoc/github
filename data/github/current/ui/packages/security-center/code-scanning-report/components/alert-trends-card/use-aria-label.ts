import {useMemo} from 'react'

import {humanReadableDate} from '../../../common/utils/date-formatter'
import type {AlertTrendsResult} from './use-alert-trends-query'

export function useAriaLabel(groupKey: string, alertTrends?: AlertTrendsResult): string {
  return useMemo(() => {
    if (alertTrends === undefined) {
      return 'Empty chart. Alert trends could not be loaded right now.'
    }

    if (alertTrends.length === 0) {
      return 'Empty chart. There are no pull request alerts in this period.'
    }
    const label = []
    label.push('Line chart describing pull request alert trends over time.')
    label.push(`It consists of ${alertTrends.length} time series.`)

    const firstSeries = alertTrends[0]
    if (firstSeries?.data.length) {
      const startDate = new Date(firstSeries.data[0]!.x)
      const startDateStr = humanReadableDate(startDate, {includeYear: true})
      const endDate = new Date(firstSeries.data.at(-1)!.x)
      const endDateStr = humanReadableDate(endDate, {includeYear: true})
      label.push(`The x-axis shows dates from ${startDateStr} to ${endDateStr}.`)
    }

    // There's currently only a max of 2 supported features on a chart, so the 'and' concat is grammatically appropriate.
    const labels = alertTrends.map(x => x.label)
    if (labels.length) {
      label.push(`The y-axis shows counts of alerts by ${groupKey}, with groups ${labels.join(', ')}.`)
    }

    label.push('This chart data can only be accessed as a table.')
    return label.join(' ')
  }, [groupKey, alertTrends])
}
