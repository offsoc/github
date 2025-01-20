import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'
import type {GroupKey, Severity} from '../../types'

interface AbstractAlert {
  repositoryId: number
  repositoryName: string
  // Repository#permalink
  repositoryHref: string
  // Repository#repo_type_icon
  repositoryTypeIcon: 'repo' | 'lock' | 'mirror' | 'repo-forked'
  alertNumber: number
  alertHref: string
}

export interface DependabotAlert extends AbstractAlert {
  featureType: 'dependabot_alerts'
  alertTitle: string
  alertSeverity: Severity
  alertDependencyScope: 'runtime' | 'development'
  alertPackageName: string
  alertEcosystem: string
  alertLocation: string
  alertResolved: boolean
  alertResolution?: string
  alertUpdatedAt: string
}

export interface CodeScanningAlert extends AbstractAlert {
  featureType: 'code_scanning'
  alertTitle: string
  alertTool: string
  alertSeverity?: Severity
  // alertClassifications?: string[]
  alertLocation: string
  alertResolved: boolean
  alertResolution?: string
  alertUpdatedAt: string
}

export interface SecretScanningAlert extends AbstractAlert {
  featureType: 'secret_scanning'
  alertTitle: string
  alertSeverity: Severity
  alertRawSecret: string
  alertActive: boolean
  alertIsCustomPattern: boolean
  alertLocation: string
  alertResolved: boolean
  alertResolution?: string
  alertUpdatedAt: string
}

export type Alert = DependabotAlert | CodeScanningAlert | SecretScanningAlert

export function isDependabotAlert(alert: Alert): alert is DependabotAlert {
  return alert.featureType === 'dependabot_alerts'
}

export function isCodeScanningAlert(alert: Alert): alert is CodeScanningAlert {
  return alert.featureType === 'code_scanning'
}

export function isSecretScanningAlert(alert: Alert): alert is SecretScanningAlert {
  return alert.featureType === 'secret_scanning'
}

export interface AlertsResult {
  alerts: Alert[]
  previous?: string
  next?: string
}

type AlertsQueryResult = UseQueryResult<AlertsResult>

interface UseAlertsQueryParams {
  groupKey: GroupKey
  groupValue?: string
  query?: string
  cursor?: string
}
export function useAlertsQuery({groupKey, groupValue, query, cursor}: UseAlertsQueryParams): AlertsQueryResult {
  const paths = usePaths()

  // Assumes that group keys reuse filter qualifier keys
  const groupFilter = groupKey === 'none' ? '' : `${groupValue}`
  const queryWithGroup = [query, groupFilter].join(' ').trim()

  // When viewing alerts for a grouped list, we want to use a smaller page size so that if
  // multiple groups are open, the screen is still usable.
  const pageSize = groupKey === 'none' ? 25 : 10

  let params: {[key: string]: string | number | undefined} = {
    query: queryWithGroup,
    cursor,
    pageSize,
  }

  // filter empty values from object
  params = Object.fromEntries(Object.entries(params).filter(([_, v]) => v))

  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => {
      const path = paths.unifiedAlertsAlertsPath(params)
      return fetchJson(path)
    },
  })
}
