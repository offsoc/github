import {Stack} from '@primer/react/experimental'
import {useMemo} from 'react'

import {AlertActivityChartV2} from './alert-activity-chart/AlertActivityChartV2'
import {AlertTrendsChartV2} from './alert-trends-chart/AlertTrendsChartV2'
import type {GroupingType} from './alert-trends-chart/grouping-type'
import {MeanTimeToRemediateCardV2} from './mean-time-to-remediate-card/MeanTimeToRemediateCardV2'
import {NetResolveRateCardV2} from './net-resolve-rate-card/NetResolveRateCardV2'

export interface RemediationTabProps {
  submittedQuery: string
  startDateString: string
  endDateString: string
  alertTrendsGrouping?: GroupingType
}

export function RemediationTab({
  submittedQuery,
  startDateString,
  endDateString,
  alertTrendsGrouping,
}: RemediationTabProps): JSX.Element {
  const cardProps = useMemo(() => {
    return {
      query: submittedQuery,
      startDate: startDateString,
      endDate: endDateString,
    }
  }, [submittedQuery, startDateString, endDateString])

  return (
    <Stack direction="vertical">
      <AlertTrendsChartV2
        isOpenSelected={false}
        query={submittedQuery}
        startDate={startDateString}
        endDate={endDateString}
        grouping={alertTrendsGrouping}
        showStateToggle={false}
        updateStateUrl={false}
        showChartTitle={true}
      />

      <Stack direction="horizontal">
        <MeanTimeToRemediateCardV2 {...cardProps} />
        <NetResolveRateCardV2 {...cardProps} />
      </Stack>

      <AlertActivityChartV2 {...cardProps} />
    </Stack>
  )
}
