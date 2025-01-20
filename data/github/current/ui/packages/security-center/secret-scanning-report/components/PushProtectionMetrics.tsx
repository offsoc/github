import DataCard from '@github-ui/data-card'
import {AlertIcon, KeyIcon, RepoIcon, ShieldCheckIcon} from '@primer/octicons-react'
import {Box, Text} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {tryFetchJson} from '../../common/utils/fetch-json'
import type {PushProtectionMetricsResponse} from '../types/push-protection-metrics'
import {AggregateMetricsList} from './AggregateMetricsList'
import {SeeAllMetricsButton} from './SeeAllMetrics'

export interface PushProtectionMetricsProps {
  startDate: string
  endDate: string
  query: string
  noData?: boolean
}

interface NoDataResponse {
  noData: string
}

type FetchResponse = NoDataResponse | {payload: PushProtectionMetricsResponse}

function isNoDataResponse(response: FetchResponse): response is NoDataResponse {
  return response.hasOwnProperty('noData')
}

const meanResponseTimeLabel = (meanResponseTime: number): string => (meanResponseTime < 60 * 60 ? 'minutes' : 'hours')
function meanResponseTimeNumber(meanResponseTime: number): number {
  if (meanResponseTime === 0) return 0
  let formatted = meanResponseTime / 60
  if (formatted > 60) {
    formatted = formatted / 60
  }
  return Math.round(formatted * 10) / 10
}

export function PushProtectionMetrics({
  startDate,
  endDate,
  query = '',
  noData,
}: PushProtectionMetricsProps): JSX.Element {
  const paths = usePaths()

  const {
    data: metrics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [paths, startDate, endDate, query, noData],
    queryFn: async () => {
      if (noData) return null

      const url = paths.secretsPushProtectionMetricsPath({startDate, endDate, query})
      const res = await tryFetchJson<FetchResponse>(url)
      if (!res) throw new Error('Failed to fetch push protection metrics')

      if (isNoDataResponse(res)) return null
      if (!res.payload) throw new Error('Failed to fetch push protection metrics')
      return res.payload
    },
  })
  const openStatus = metrics?.bypassesByRequestStatusCounts.find(({name}) => name === 'Open')
  const approvedStatus = metrics?.bypassesByRequestStatusCounts.find(({name}) => name === 'Approved')
  const rejectedStatus = metrics?.bypassesByRequestStatusCounts.find(({name}) => name === 'Rejected')
  const cancelledStatus = metrics?.bypassesByRequestStatusCounts.find(({name}) => name === 'Cancelled')
  const bypassedPercentage = useMemo(() => {
    if (!metrics || metrics.totalBlocksCount === 0) {
      return 0
    }
    return (metrics.bypassedAlertsCount / metrics.totalBlocksCount) * 100
  }, [metrics])
  const isNoData = !metrics

  if (isError) {
    return requestErrorBlankslate()
  }

  return (
    <>
      <Box data-hpc sx={{mt: 4}}>
        <Text as="div" className="text-bold" sx={{fontSize: 3}}>
          Push protection
        </Text>
        <Box sx={{display: 'flex', gap: 3, mt: 2}}>
          <DataCard
            data-testid="bypassed-secrets-count"
            cardTitle="Bypassed secrets"
            loading={isLoading}
            noData={isNoData}
          >
            <DataCard.Counter
              count={isNoData || !metrics ? 0 : metrics.bypassedAlertsCount}
              total={isNoData || !metrics ? 0 : metrics.totalBlocksCount}
            />
            <DataCard.ProgressBar
              data={[{progress: bypassedPercentage, color: 'attention.emphasis'}]}
              aria-label="Secrets successfully blocked"
            />
            <DataCard.Description>
              {`${isNoData || !metrics ? 0 : metrics.successfulBlocksCount} secrets blocked successfully`}
            </DataCard.Description>
          </DataCard>
          <DataCard
            data-testid="bypass-requests-by-status"
            cardTitle="Bypass requests"
            loading={isLoading}
            noData={isNoData}
          >
            <DataCard.Counter count={isNoData || !metrics ? 0 : metrics.bypassRequestsCount} metric={'requests'} />
            <DataCard.ProgressBar
              data={[
                {progress: openStatus?.percent || 0},
                {progress: approvedStatus?.percent || 0},
                {progress: rejectedStatus?.percent || 0},
                {progress: cancelledStatus?.percent || 0},
              ]}
              aria-label="Bypass requests by status"
            />
            {(openStatus || approvedStatus || rejectedStatus || cancelledStatus) && (
              <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                {openStatus && (
                  <Text key={openStatus.name} sx={{flexBasis: '33%', color: 'fg.muted'}}>
                    <Text sx={{fontWeight: 'bolder'}}>{openStatus.count}</Text> {openStatus.name}
                  </Text>
                )}
                {approvedStatus && (
                  <Text key={approvedStatus.name} sx={{flexBasis: '33%', color: 'fg.muted'}}>
                    <Text sx={{fontWeight: 'bolder'}}>{approvedStatus.count}</Text> {approvedStatus.name}
                  </Text>
                )}
                {rejectedStatus && (
                  <Text key={rejectedStatus.name} sx={{flexBasis: '33%', color: 'fg.muted', textAlign: 'right'}}>
                    <Text sx={{fontWeight: 'bolder'}}>{rejectedStatus.count}</Text> {rejectedStatus.name}
                  </Text>
                )}
                {cancelledStatus && (
                  <Text key={cancelledStatus.name} sx={{flexBasis: '33%', color: 'fg.muted'}}>
                    <Text sx={{fontWeight: 'bolder'}}>{cancelledStatus.count}</Text> {cancelledStatus.name}
                  </Text>
                )}
              </Box>
            )}
          </DataCard>
          <DataCard
            data-testid="mean-time-to-response"
            cardTitle="Mean time to response"
            loading={isLoading}
            noData={isNoData}
          >
            <Box sx={{display: 'flex'}}>
              <DataCard.Counter
                count={meanResponseTimeNumber(metrics?.meanResponseTime || 0)}
                metric={meanResponseTimeLabel(metrics?.meanResponseTime || 0)}
              />
            </Box>
            <DataCard.Description>Average time to respond to bypass requests</DataCard.Description>
          </DataCard>
        </Box>
      </Box>

      <Box sx={{mt: 4}}>
        <Text as="div" className="text-bold" sx={{fontSize: 3}}>
          Blocks
        </Text>
        <Text sx={{color: 'fg.muted'}}>
          All secrets pushed, including secrets bypassed and secrets fixed on block. Only secrets bypassed create
          alerts.
        </Text>
        <Box sx={{display: 'flex', gap: 3, mt: 3}}>
          <AggregateMetricsList
            data-testid="blocks-by-token-type"
            title="Most blocked secret types"
            loading={isLoading}
            aggregateCounts={isNoData || !metrics ? [] : metrics.blocksByTokenTypeCounts}
            icon={KeyIcon}
            seeAllButton={
              <SeeAllMetricsButton
                label="See all blocked secret types"
                header="Most blocked secret types"
                href={paths.secretsPushProtectionBlocksByTokenTypeMetricsPath({startDate, endDate, query})}
              />
            }
          />
          <AggregateMetricsList
            data-testid="blocks-by-repo"
            title="Repositories with most pushes blocked"
            loading={isLoading}
            aggregateCounts={isNoData || !metrics ? [] : metrics.blocksByRepositoryCounts}
            icon={RepoIcon}
            seeAllButton={
              <SeeAllMetricsButton
                label="See all repositories with pushes blocked"
                header="Repositories with most pushes blocked"
                href={paths.secretsPushProtectionBlocksByRepositoryMetricsPath({startDate, endDate, query})}
              />
            }
          />
        </Box>
      </Box>

      <Box sx={{mt: 4}}>
        <Text as="div" className="text-bold" sx={{fontSize: 3}}>
          Bypasses
        </Text>
        <Text sx={{color: 'fg.muted'}}>
          Secrets pushed and bypassed. A user allowed this secret to be pushed and the secret was exposed in a
          repository.
        </Text>
        <Box sx={{display: 'flex', gap: 3, mt: 3}}>
          <AggregateMetricsList
            data-testid="bypasses-by-token-type"
            title="Most bypassed secret types"
            loading={isLoading}
            aggregateCounts={isNoData || !metrics ? [] : metrics.bypassesByTokenTypeCounts}
            icon={KeyIcon}
            seeAllButton={
              <SeeAllMetricsButton
                label="See all bypassed secret types"
                header="Most bypassed secret types"
                href={paths.secretsPushProtectionBypassesByTokenTypeMetricsPath({startDate, endDate, query})}
                baseIndexLink={paths.secretScanningAlertCentricViewPath({query: 'bypassed:true'})}
              />
            }
            baseIndexLink={paths.secretScanningAlertCentricViewPath({query: 'bypassed:true'})}
          />
          <AggregateMetricsList
            data-testid="bypasses-by-repo"
            title="Repositories with most secrets bypassed"
            loading={isLoading}
            aggregateCounts={isNoData || !metrics ? [] : metrics.bypassesByRepositoryCounts}
            icon={RepoIcon}
            seeAllButton={
              <SeeAllMetricsButton
                label="See all repositories with secrets bypassed"
                header="Repositories with most secrets bypassed"
                href={paths.secretsPushProtectionBypassesByRepositoryMetricsPath({startDate, endDate, query})}
                baseIndexLink={paths.secretScanningAlertCentricViewPath({query: 'bypassed:true'})}
              />
            }
            baseIndexLink={paths.secretScanningAlertCentricViewPath({query: 'bypassed:true'})}
          />
        </Box>
        <Box sx={{display: 'flex', mt: 3, pr: 2, width: '50%'}}>
          <AggregateMetricsList
            data-testid="bypasses-by-reason"
            title="Bypass reason distribution"
            loading={isLoading}
            aggregateCounts={isNoData || !metrics ? [] : metrics.bypassesByReasonCounts}
            icon={ShieldCheckIcon}
          />
        </Box>
      </Box>
    </>
  )
}

function requestErrorBlankslate(): JSX.Element {
  return (
    <DataCard
      data-testid="push-protection-metrics-request-error-blankslate"
      sx={{
        width: '100%',
        height: 258,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Blankslate>
        <Blankslate.Visual>
          <AlertIcon size="medium" />
        </Blankslate.Visual>
        <Blankslate.Heading>Secret scanning data could not be loaded right now</Blankslate.Heading>
      </Blankslate>
    </DataCard>
  )
}
