import DataCard from '@github-ui/data-card'
import {Link} from '@primer/react'
import {useEffect, useMemo, useState} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import type {CustomProperty} from '../../common/filter-providers/types'
import type {Period} from '../../common/utils/date-period'
import {tryFetchJson} from '../../common/utils/fetch-json'
import {sanitizeQuery} from '../../common/utils/query-helper'
import {useFilterProviders as useSecretScanningMetricsFilterProviders} from '../../routes/SecretScanningReport'
import {MINIMUM_ALLOWED_DATE} from '../../secret-scanning-report/SecretScanningMetrics'
import type CardProps from '../types/card-props'
import type {NoDataResponse, SecretsBypassedResponse} from './secrets-bypassed/use-secrets-bypassed-query'

export interface SecretsBypassedCardProps extends CardProps {
  customProperties: CustomProperty[]
  datePeriod?: Period
}

const DEFAULT_DATE_SPAN: Period = {period: 'last30days'}

function isNoDataResponse(response: SecretsBypassedResponse): response is NoDataResponse {
  return response.hasOwnProperty('noData')
}

const defaultSx = Object.freeze({})
export function SecretsBypassedCard({
  startDate,
  endDate,
  query = '',
  customProperties = [],
  datePeriod = undefined,
  sx = defaultSx,
}: SecretsBypassedCardProps): JSX.Element {
  const [total, setTotal] = useState(0)
  const [blocked, setBlocked] = useState(0)
  const [bypassed, setBypassed] = useState(0)
  const [cardState, setCardState] = useState('loading')

  const progress = useMemo(() => {
    if (total === 0) {
      return 0
    }
    return (bypassed / total) * 100
  }, [bypassed, total])
  const minAllowedDate = useMemo(() => new Date(MINIMUM_ALLOWED_DATE), [])
  const noData = useMemo(() => new Date(endDate) <= minAllowedDate, [minAllowedDate, endDate])
  const parsedStartDate = useMemo(
    () => (!noData && new Date(startDate) < minAllowedDate ? MINIMUM_ALLOWED_DATE : startDate),
    [noData, minAllowedDate, startDate],
  )

  const paths = usePaths()

  useEffect(() => {
    async function fetchSecretsBlocked(): Promise<void> {
      setCardState('loading')

      const url = paths.secretsBypassedPath({startDate: parsedStartDate, endDate, query})
      const data = await tryFetchJson<SecretsBypassedResponse>(url)

      if (data == null) {
        setCardState('error')
        return
      }

      if (isNoDataResponse(data)) {
        setCardState('no-data')
        return
      }

      setTotal(data.totalBlocksCount)
      setBlocked(data.successfulBlocksCount)
      setBypassed(data.bypassedAlertsCount)
      setCardState('done')
    }

    if (noData) {
      setCardState('no-data')
    } else {
      fetchSecretsBlocked()
    }
  }, [paths, query, parsedStartDate, endDate, noData])

  const metric = blocked > 1 ? 'secrets' : 'secret'

  const numberFormatter = Intl.NumberFormat('en-US', {
    notation: 'standard',
  })

  const metricsFilterProviders = useSecretScanningMetricsFilterProviders(paths, customProperties)
  const actionLinkQuery = sanitizeQuery(query, metricsFilterProviders)
  let actionUrl = undefined
  if (cardState === 'done') {
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
      error={cardState === 'error'}
      loading={cardState === 'loading'}
      noData={cardState === 'no-data'}
      sx={sx}
    >
      <DataCard.Counter count={bypassed} total={total} />
      <DataCard.ProgressBar
        data={[{progress, color: 'attention.emphasis'}]}
        aria-label="Secrets successfully blocked"
      />
      <DataCard.Description>{`${numberFormatter.format(blocked)} ${metric} blocked successfully`}</DataCard.Description>
    </DataCard>
  )
}
