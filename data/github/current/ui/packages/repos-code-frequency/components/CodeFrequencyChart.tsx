import {useMemo} from 'react'
import {ChartCard} from '@github-ui/chart-card'
import {type MetricDataPoint, METRIC_KEY} from '../types'

export type CodeFrequencyChartProps = {
  additions: MetricDataPoint[]
  deletions: MetricDataPoint[]
}

export default function CodeFrequencyChart({additions, deletions}: CodeFrequencyChartProps) {
  const isAcrossMultipleYears = useMemo(() => {
    const first = additions[0]
    const last = additions.at(-1)
    if (!first || !last) {
      return false
    }
    const firstDate = new Date(first[METRIC_KEY.TIMESTAMP])
    const lastDate = new Date(last[METRIC_KEY.TIMESTAMP])

    return firstDate?.getFullYear() !== lastDate?.getFullYear()
  }, [additions])

  return (
    <ChartCard size="xl">
      <ChartCard.Title>Code frequency</ChartCard.Title>
      <ChartCard.Description>Additions and deletions per week</ChartCard.Description>
      <ChartCard.Chart
        type="areaspline"
        series={[
          {
            type: 'areaspline',
            name: 'Additions',
            data: additions,
          },
          {
            type: 'areaspline',
            name: 'Deletions',
            data: deletions,
            dashStyle: 'Dash',
          },
        ]}
        xAxisTitle="Date"
        yAxisTitle="Frequency"
        colors={[
          'var(--data-green-color-emphasis, var(--data-green-color))',
          'var(--data-red-color-emphasis, var(--data-red-color))',
        ]}
        xAxisOptions={{
          type: 'datetime',
          labels: {
            format: `{value:%b %e${isAcrossMultipleYears ? ', %Y' : ''}}`,
          },
        }}
        plotOptions={{
          series: {
            marker: {
              enabled: false,
            },
          },
        }}
      />
    </ChartCard>
  )
}
