import DataCard from '@github-ui/data-card'
import {Link} from '@primer/react'
import {useMemo} from 'react'

import {usePaths} from '../../../common/contexts/Paths'
import type {CustomProperty} from '../../../common/filter-providers/types'
import type {Period} from '../../../common/utils/date-period'
import {sanitizeQuery} from '../../../common/utils/query-helper'
import {useFilterProviders as useSecretScanningMetricsFilterProviders} from '../../../routes/SecretScanningReport'
import {MINIMUM_ALLOWED_DATE} from '../../../secret-scanning-report/SecretScanningMetrics'
import type CardProps from '../../types/card-props'
import useSecretsBypassedQuery, {type NoDataResponse, type SecretsBypassedResponse} from './use-secrets-bypassed-query'

export interface SecretsBypassedCardProps extends CardProps {
  customProperties: CustomProperty[]
  datePeriod?: Period
}

const DEFAULT_DATE_SPAN: Period = {period: 'last30days'}

function isNoDataResponse(response: SecretsBypassedResponse | undefined): response is NoDataResponse {
  if (response == null) {
    return false
  }
  return response.hasOwnProperty('noData')
}

const defaultSx = Object.freeze({})
export function SecretsBypassedCardV2({
  startDate,
  endDate,
  query = '',
  customProperties = [],
  datePeriod = undefined,
  sx = defaultSx,
}: SecretsBypassedCardProps): JSX.Element {
  const minAllowedDate = useMemo(() => new Date(MINIMUM_ALLOWED_DATE), [])
  const noData = useMemo(() => new Date(endDate) <= minAllowedDate, [minAllowedDate, endDate])
  const parsedStartDate = useMemo(
    () => (!noData && new Date(startDate) < minAllowedDate ? MINIMUM_ALLOWED_DATE : startDate),
    [noData, minAllowedDate, startDate],
  )

  const dataQuery = useSecretsBypassedQuery({startDate: parsedStartDate, endDate, query})

  const progress = useMemo(() => {
    if (dataQuery.isSuccess && !isNoDataResponse(dataQuery.data)) {
      if (dataQuery.data.totalBlocksCount === 0) {
        return 0
      }
      return (dataQuery.data.bypassedAlertsCount / dataQuery.data.totalBlocksCount) * 100
    }
    return 0
  }, [dataQuery])

  const numberFormatter = Intl.NumberFormat('en-US', {
    notation: 'standard',
  })

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
      cardTitle="Secrets bypassed"
      action={
        actionUrl && (
          <Link className="f6 no-wrap" href={actionUrl} data-testid="data-card-action-link">
            View details
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
          <DataCard.Counter count={dataQuery.data.bypassedAlertsCount} total={dataQuery.data.totalBlocksCount} />
          <DataCard.ProgressBar
            data={[{progress, color: 'attention.emphasis'}]}
            aria-label="Secrets successfully blocked"
          />
          <DataCard.Description>{`${numberFormatter.format(dataQuery.data.successfulBlocksCount)} ${
            dataQuery.data.successfulBlocksCount > 1 ? 'secrets' : 'secret'
          } blocked successfully`}</DataCard.Description>
        </>
      )}
    </DataCard>
  )
}
