import DataCard from '@github-ui/data-card'
import {Stack} from '@primer/react/experimental'

import {TrendIndicator} from '../../../common/components/trend-indicator'
import {calculatePreviousDateRange} from '../../../common/utils/date-period'
import {getTrend, useReopenedAlertsQuery, type UseReopenedAlertsQueryParams} from './use-reopened-alerts-query'

interface ReopenedAlertsCardProps extends UseReopenedAlertsQueryParams {}

export function ReopenedAlertsCardV2(props: ReopenedAlertsCardProps): JSX.Element {
  const previousDateRange = calculatePreviousDateRange(props.startDate, props.endDate)
  const currentPeriodData = useReopenedAlertsQuery(props)
  const previousPeriodData = useReopenedAlertsQuery({
    ...props,
    startDate: previousDateRange.startDate,
    endDate: previousDateRange.endDate,
  })
  const trend = getTrend(currentPeriodData, previousPeriodData)

  return (
    <DataCard
      cardTitle="Reopened alerts"
      loading={currentPeriodData.isPending || previousPeriodData.isPending}
      error={currentPeriodData.isError || previousPeriodData.isError}
    >
      <Stack direction={'horizontal'} gap="none">
        {currentPeriodData.isSuccess && <DataCard.Counter count={currentPeriodData.count} />}{' '}
        <TrendIndicator
          loading={currentPeriodData.isPending || previousPeriodData.isPending}
          error={currentPeriodData.isError || previousPeriodData.isError}
          value={trend}
          sx={{ml: 2}}
        />
      </Stack>
      <DataCard.Description>Total open alerts that were reopened during the period</DataCard.Description>
    </DataCard>
  )
}
