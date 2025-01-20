import type {RangeSelection} from '@github-ui/date-picker'
import {Stack} from '@primer/react/experimental'

import AlertsFixedWithAutofixCard from '../../code-scanning-report/components/alerts-fixed-with-autofix-card/AlertsFixedWithAutofixCard'
import {isRangeSelection} from '../../common/components/date-span-picker'
import type {CustomProperty} from '../../common/filter-providers/types'
import type {Period} from '../../common/utils/date-period'
import AlertsFixedInPullRequestsCard from './AlertsFixedInPullRequestsCard'
import {IntroducedAndPreventedChart} from './introduced-and-prevented-chart/IntroducedAndPreventedChart'

export interface PreventionTabProps {
  submittedQuery: string
  startDateString: string
  endDateString: string
  selectedDateSpan: Period | RangeSelection
  customProperties: CustomProperty[]
}

export function PreventionTab({
  submittedQuery,
  startDateString,
  endDateString,
  customProperties,
  selectedDateSpan,
}: PreventionTabProps): JSX.Element {
  return (
    <Stack>
      <IntroducedAndPreventedChart query={submittedQuery} startDate={startDateString} endDate={endDateString} />

      <Stack direction="horizontal">
        <AlertsFixedInPullRequestsCard
          query={submittedQuery}
          customProperties={customProperties}
          startDate={startDateString}
          endDate={endDateString}
          datePeriod={isRangeSelection(selectedDateSpan) ? undefined : selectedDateSpan}
        />

        <AlertsFixedWithAutofixCard query={submittedQuery} startDate={startDateString} endDate={endDateString} />
      </Stack>
    </Stack>
  )
}
