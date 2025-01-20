import DataCard from '@github-ui/data-card'
import {Link} from '@primer/react'
import {useMemo} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import type {CustomProperty} from '../../common/filter-providers/types'
import type {Period} from '../../common/utils/date-period'
import {sanitizeQuery} from '../../common/utils/query-helper'
import {useFilterProviders as useSecretScanningMetricsFilterProviders} from '../../routes/SecretScanningReport'
import {MINIMUM_ALLOWED_DATE} from '../../secret-scanning-report/SecretScanningMetrics'
import type CardProps from '../types/card-props'
import useSecretsBypassedQuery from './secrets-bypassed/use-secrets-bypassed-query'

export interface SecretsBlockedCardProps extends CardProps {
  customProperties: CustomProperty[]
  datePeriod?: Period
}

interface NoDataResponse {
  noData: string
}

interface CountsResponse {
  totalBlocksCount: number
  successfulBlocksCount: number
  bypassedAlertsCount: number
}

const DEFAULT_DATE_SPAN: Period = {period: 'last30days'}

type FetchResponse = NoDataResponse | CountsResponse

function isNoDataResponse(response: FetchResponse | undefined): response is NoDataResponse {
  if (response == null) {
    return false
  }
  return response.hasOwnProperty('noData')
}

const defaultSx = Object.freeze({})
export function SecretsBlockedCard({
  startDate,
  endDate,
  query = '',
  customProperties = [],
  datePeriod = undefined,
  sx = defaultSx,
}: SecretsBlockedCardProps): JSX.Element {
  const minAllowedDate = useMemo(() => new Date(MINIMUM_ALLOWED_DATE), [])
  const noData = useMemo(() => new Date(endDate) <= minAllowedDate, [minAllowedDate, endDate])
  const parsedStartDate = useMemo(
    () => (!noData && new Date(startDate) < minAllowedDate ? MINIMUM_ALLOWED_DATE : startDate),
    [noData, minAllowedDate, startDate],
  )

  const dataQuery = useSecretsBypassedQuery({startDate: parsedStartDate, endDate, query})
  const paths = usePaths()

  const metricsFilterProviders = useSecretScanningMetricsFilterProviders(paths, customProperties)
  const actionLinkQuery = sanitizeQuery(query, metricsFilterProviders)
  let actionUrl = undefined
  if (dataQuery.isSuccess && !isNoDataResponse(dataQuery.data)) {
    if (!datePeriod) {
      actionUrl = paths.secretScanningMetricsPath({startDate, endDate, query: actionLinkQuery})
    } else if (datePeriod.period === DEFAULT_DATE_SPAN.period) {
      actionUrl = paths.secretScanningMetricsPath({query: actionLinkQuery})
    } else {
      actionUrl = paths.secretScanningMetricsPath({period: datePeriod.period, query: actionLinkQuery})
    }
  }

  return (
    <DataCard
      cardTitle="Secrets blocked"
      action={
        actionUrl && (
          <Link className="f6 no-wrap" href={actionUrl} data-testid="data-card-action-link">
            View push protection report
          </Link>
        )
      }
      error={dataQuery.isError}
      loading={dataQuery.isPending}
      noData={noData || isNoDataResponse(dataQuery.data)}
      sx={sx}
    >
      {dataQuery.isSuccess && !isNoDataResponse(dataQuery.data) && (
        <>
          <DataCard.Counter count={dataQuery.data.successfulBlocksCount} />
          <DataCard.Description>Secrets successfully blocked by push protection</DataCard.Description>
        </>
      )}
    </DataCard>
  )
}
