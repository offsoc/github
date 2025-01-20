import {ChartCard} from '@github-ui/chart-card'
import {useReplaceSearchParams} from '../hooks/UseReplaceSearchParams'
import styles from './RequestsChart.module.css'
import {clsx} from 'clsx'

export interface RequestsChartProps {
  request_count: Array<[number, number]>
  rate_limited_request_count: Array<[number, number]>
}

export function RequestsChart({request_count, rate_limited_request_count}: RequestsChartProps) {
  const {searchParams} = useReplaceSearchParams()
  return (
    <div className={clsx(styles.requestsChart, 'position-relative width-full')}>
      <ChartCard
        size="large"
        border={true}
        padding="normal"
        visibleControls={false}
        className="position-absolute width-full"
      >
        <ChartCard.Title as="h2">Amount of requests</ChartCard.Title>
        <ChartCard.Chart
          useUTC={searchParams.get('t') !== 'local'}
          xAxisTitle="Time"
          yAxisTitle="Requests"
          colors={['var(--fgColor-accent)', 'var(--fgColor-danger)']}
          series={[
            {
              name: 'Total requests',
              data: request_count,
              type: 'line',
            },
            {
              name: 'Rate limited requests',
              data: rate_limited_request_count,
              type: 'line',
            },
          ]}
          xAxisOptions={{
            type: 'datetime',
            dateTimeLabelFormats: {
              minute: '%H:%M',
            },
            gridLineDashStyle: 'Dash',
          }}
          yAxisOptions={{
            gridLineDashStyle: 'Solid',
          }}
          plotOptions={{
            series: {
              marker: {
                enabled: false,
              },
            },
          }}
          type={'line'}
        />
      </ChartCard>
    </div>
  )
}

export default RequestsChart
