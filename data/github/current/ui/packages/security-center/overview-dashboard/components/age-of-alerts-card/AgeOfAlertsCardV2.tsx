import DataCard from '@github-ui/data-card'
import {Stack} from '@primer/react/experimental'

import {TrendIndicator} from '../../../common/components/trend-indicator'
import {calculatePreviousDateRange} from '../../../common/utils/date-period'
import type {UseAgeOfAlertsQueryParams} from './use-age-of-alerts-query'
import {getTrend, useAgeOfAlertsQuery} from './use-age-of-alerts-query'

interface AgeOfAlertsCardProps extends UseAgeOfAlertsQueryParams {}

export function AgeOfAlertsCardV2(props: AgeOfAlertsCardProps): JSX.Element {
  const previousDateRange = calculatePreviousDateRange(props.startDate, props.endDate)
  const currentPeriodData = useAgeOfAlertsQuery(props)
  const previousPeriodData = useAgeOfAlertsQuery({
    ...props,
    startDate: previousDateRange.startDate,
    endDate: previousDateRange.endDate,
  })
  const trend = getTrend(currentPeriodData, previousPeriodData)
  const metric = {singular: 'day', plural: 'days'}

  return (
    <DataCard
      cardTitle="Age of alerts"
      loading={currentPeriodData.isPending || previousPeriodData.isPending}
      error={currentPeriodData.isError || previousPeriodData.isError}
    >
      <Stack direction={'horizontal'} gap="none">
        {currentPeriodData.isSuccess && <DataCard.Counter count={currentPeriodData.count} metric={metric} />}{' '}
        <TrendIndicator
          loading={currentPeriodData.isPending || previousPeriodData.isPending}
          error={currentPeriodData.isError || previousPeriodData.isError}
          value={trend}
          sx={{ml: 2}}
        />
      </Stack>
      <DataCard.Description>Average age of open alerts</DataCard.Description>
    </DataCard>
  )
}
