import DataCard from '@github-ui/data-card'
import {Link, sx} from '@primer/react'

import type {UseAlertsFixedQueryParams} from '../../code-scanning-report/components/alerts-fixed-card/use-alerts-fixed-query'
import useAlertsFixedQuery from '../../code-scanning-report/components/alerts-fixed-card/use-alerts-fixed-query'
import {usePaths} from '../../common/contexts/Paths'
import type {CustomProperty} from '../../common/filter-providers/types'
import type {Period} from '../../common/utils/date-period'
import {sanitizeQuery} from '../../common/utils/query-helper'
import {useFilterProviders as useCodeScanningMetricsFilterProviders} from '../../routes/CodeScanningReport'

interface AlertsFixedInPullRequestsCardProps extends UseAlertsFixedQueryParams {
  customProperties: CustomProperty[]
  datePeriod?: Period
}

const DEFAULT_DATE_SPAN: Period = {period: 'last30days'}

export default function AlertsFixedInPullRequestsCard({
  query,
  startDate,
  endDate,
  customProperties,
  datePeriod,
}: AlertsFixedInPullRequestsCardProps): JSX.Element {
  const dataQuery = useAlertsFixedQuery({query, startDate, endDate})
  const paths = usePaths()

  const metricsFilterProviders = useCodeScanningMetricsFilterProviders(paths, false, customProperties)
  const actionLinkQuery = sanitizeQuery(query, metricsFilterProviders)
  let actionUrl = undefined
  if (dataQuery.isSuccess) {
    if (!datePeriod) {
      actionUrl = paths.codeScanningMetricsPath({
        startDate,
        endDate,
        query: actionLinkQuery,
      })
    } else if (datePeriod.period === DEFAULT_DATE_SPAN.period) {
      actionUrl = paths.codeScanningMetricsPath({query: actionLinkQuery})
    } else {
      actionUrl = paths.codeScanningMetricsPath({period: datePeriod.period, query: actionLinkQuery})
    }
  }

  return (
    <DataCard
      cardTitle="Vulnerabilities fixed in pull requests"
      action={
        actionUrl && (
          <Link className="f6 no-wrap" href={actionUrl} data-testid="data-card-action-link">
            View CodeQL report
          </Link>
        )
      }
      error={dataQuery.isError}
      loading={dataQuery.isPending}
      sx={sx}
    >
      {dataQuery.isSuccess && (
        <>
          <DataCard.Counter count={dataQuery.data.count} />
          <DataCard.Description>
            Total code vulnerabilities caught by CodeQL tools in pull requests before they are merged into the main
            branch
          </DataCard.Description>
        </>
      )}
    </DataCard>
  )
}
