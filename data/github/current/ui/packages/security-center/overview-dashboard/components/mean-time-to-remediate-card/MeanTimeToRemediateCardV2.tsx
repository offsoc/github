import DataCard from '@github-ui/data-card'
import {Stack} from '@primer/react/experimental'

import {TrendIndicator} from '../../../common/components/trend-indicator'
import {calculatePreviousDateRange} from '../../../common/utils/date-period'
import {
  getTrend,
  useMeanTimeToRemediateQuery,
  type UseMeanTimeToRemediateQueryParams,
} from './use-mean-time-to-remediate-query'

interface MeanTimeToRemediateCardProps extends UseMeanTimeToRemediateQueryParams {}

export function MeanTimeToRemediateCardV2(props: MeanTimeToRemediateCardProps): JSX.Element {
  const previousDateRange = calculatePreviousDateRange(props.startDate, props.endDate)
  const currentPeriodData = useMeanTimeToRemediateQuery(props)
  const previousPeriodData = useMeanTimeToRemediateQuery({
    ...props,
    startDate: previousDateRange.startDate,
    endDate: previousDateRange.endDate,
  })
  const trend = getTrend(currentPeriodData, previousPeriodData)
  const metric = {singular: 'day', plural: 'days'}

  return (
    <DataCard
      cardTitle="Mean time to remediate"
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
      <DataCard.Description>
        Average age of closed alerts (excludes alerts closed as false positive)
      </DataCard.Description>
    </DataCard>
  )
}
