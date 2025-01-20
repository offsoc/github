import DataCard from '@github-ui/data-card'
import {Stack} from '@primer/react/experimental'

import {TrendIndicator} from '../../../common/components/trend-indicator'
import {calculatePreviousDateRange} from '../../../common/utils/date-period'
import {getTrend, useNetResolveRateQuery, type UseNetResolveRateQueryParams} from './use-net-resolve-rate-query'

interface NetResolveRateCardProps extends UseNetResolveRateQueryParams {}

export function NetResolveRateCardV2(props: NetResolveRateCardProps): JSX.Element {
  const previousDateRange = calculatePreviousDateRange(props.startDate, props.endDate)
  const currentPeriodData = useNetResolveRateQuery(props)
  const previousPeriodData = useNetResolveRateQuery({
    ...props,
    startDate: previousDateRange.startDate,
    endDate: previousDateRange.endDate,
  })
  const trend = getTrend(currentPeriodData, previousPeriodData)
  const metric = '%'

  return (
    <DataCard
      cardTitle="Net resolve rate"
      loading={currentPeriodData.isPending || previousPeriodData.isPending}
      error={currentPeriodData.isError || previousPeriodData.isError}
    >
      <Stack direction={'horizontal'} gap="none">
        {currentPeriodData.isSuccess && <DataCard.Counter count={currentPeriodData.count} metric={metric} />}{' '}
        <TrendIndicator
          loading={currentPeriodData.isPending || previousPeriodData.isPending}
          error={currentPeriodData.isError || previousPeriodData.isError}
          value={trend}
          flipColor={true}
          sx={{ml: 2}}
        />
      </Stack>
      <DataCard.Description>Percentage of closed alerts to newly created alerts</DataCard.Description>
    </DataCard>
  )
}
