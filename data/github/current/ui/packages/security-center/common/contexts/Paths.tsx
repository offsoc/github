import {encodePart, orgOnboardingAdvancedSecurityPath, type PathFunction} from '@github-ui/paths'
import {createContext, useContext} from 'react'

import type {GroupingType} from '../../overview-dashboard/components/alert-trends-chart/grouping-type'
import type {PeriodOptions} from '../utils/date-period'

export const alertTrendsEndpointSuffixes = [
  'age',
  'severity',
  'tool-code-scanning',
  'tool-dependabot-alerts',
  'tool-secret-scanning',
] as const
export type AlertTrendsEndpointSuffix = (typeof alertTrendsEndpointSuffixes)[number]

type CardQueryParams = {
  startDate: string
  endDate: string
  query: string
  slice4?: string
}

type AlertTrendsQueryParams = CardQueryParams & {
  alertState: 'open' | 'closed'
  grouping: GroupingType
}

interface OverviewPaths {
  advisoriesPath: PathFunction<CardQueryParams>
  ageOfAlertsPath: PathFunction<CardQueryParams>
  alertActivityPath: PathFunction<CardQueryParams>
  alertTrendsPath: PathFunction<AlertTrendsQueryParams>
  introducedAndPreventedPath: PathFunction<CardQueryParams>
  autofixSuggestionsPath: PathFunction<CardQueryParams>
  csvExportPath: PathFunction<CardQueryParams>
  enqueueAlertPrioritizationCopilotPromptExperimentPath: PathFunction
  meanTimeToRemediatePath: PathFunction<CardQueryParams>
  netResolveRatePath: PathFunction<CardQueryParams>
  reopenedAlertsPath: PathFunction<CardQueryParams>
  repositoriesPath: PathFunction<CardQueryParams>
  sastPath: PathFunction<CardQueryParams>
  secretsBypassedPath: PathFunction<CardQueryParams>
  onboardingAdvancedSecurityPath: PathFunction<void>
}

interface EnablementTrendsReportPaths {
  enablementTrendsPath: PathFunction<CardQueryParams>
}

type CodeScanningReportParams = {
  startDate: string
  endDate: string
  query: string
}

type PageParams = {
  cursor?: string
  pageSize?: number
}

type SortParams = {
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

type CodeScanningMetricsParams = {period?: PeriodOptions; query: string} | CardQueryParams
interface CodeScanningReportPaths {
  codeScanningMetricsPath: PathFunction<CodeScanningMetricsParams>
  codeScanningAlertsFoundPath: PathFunction<CodeScanningReportParams>
  codeScanningAutofixSuggestionsPath: PathFunction<CodeScanningReportParams>
  codeScanningAlertsFixedPath: PathFunction<CodeScanningReportParams>
  codeScanningAlertTrendsPath: PathFunction<CodeScanningReportParams & {groupKey: 'status' | 'severity'}>
  codeScanningAlertsFixedWithAutofixPath: PathFunction<CodeScanningReportParams>
  codeScanningRemediationRatesPath: PathFunction<CodeScanningReportParams>
  codeScanningMostPrevalentRulesPath: PathFunction<CodeScanningReportParams & PageParams>
  codeScanningRepositoriesPath: PathFunction<CodeScanningReportParams & PageParams & SortParams>
  codeScanningCsvExportPath: PathFunction<CodeScanningReportParams>
}

type SecretScanningMetricsParams = {period?: PeriodOptions; query: string} | CardQueryParams

type SecretScanningAlertCentricViewParams = {
  query: string
}

interface SecretScanningReportPaths {
  secretScanningMetricsPath: PathFunction<SecretScanningMetricsParams>
  secretsPushProtectionMetricsPath: PathFunction<CardQueryParams>
  secretsPushProtectionBlocksByTokenTypeMetricsPath: PathFunction<CardQueryParams>
  secretsPushProtectionBlocksByRepositoryMetricsPath: PathFunction<CardQueryParams>
  secretsPushProtectionBypassesByTokenTypeMetricsPath: PathFunction<CardQueryParams>
  secretsPushProtectionBypassesByRepositoryMetricsPath: PathFunction<CardQueryParams>
  secretScanningAlertCentricViewPath: PathFunction<SecretScanningAlertCentricViewParams>
}

interface UnifiedAlertsPaths {
  unifiedAlertsCountsPath: PathFunction<{query?: string}>
  unifiedAlertsAlertsPath: PathFunction<{query?: string; cursor?: string; pageSize?: number}>
  unifiedAlertsGroupsPath: PathFunction<{groupKey: string; query?: string; cursor?: string}>
}

type SuggestionsQueryParams =
  | {
      type:
        | 'repos'
        | 'teams'
        | 'tools'
        | 'topics'
        | 'owners'
        | 'orgs'
        | 'secret-scanning.secret-types'
        | 'secret-scanning.providers'
        | 'codeql.rules'
        | 'third-party.rules'
        | 'dependabot.ecosystems'
        | 'dependabot.packages'
    }
  | {type: 'props'; name: string}
export interface Paths
  extends OverviewPaths,
    EnablementTrendsReportPaths,
    CodeScanningReportPaths,
    SecretScanningReportPaths,
    UnifiedAlertsPaths {
  suggestionsPath: PathFunction<SuggestionsQueryParams>
}

export const PathsContext = createContext<Paths | undefined>(undefined)

export const usePaths = (): Paths => {
  const context = useContext(PathsContext)

  if (context == null) {
    throw new Error('usePaths must be used within a PathsProvider')
  }

  return context
}

const toSearchParams = (params: Record<string, string | number | undefined>): URLSearchParams => {
  return Object.entries(params).reduce((result, [key, value]) => {
    if (value) {
      result.set(key, value.toString())
    }
    return result
  }, new URLSearchParams())
}

export class OrgPaths implements Paths {
  constructor(private org: string) {}

  private rootPath: PathFunction = () => `/orgs/${encodePart(this.org)}`

  // #region Options
  suggestionsPath: PathFunction<SuggestionsQueryParams> = props => {
    const {type} = props
    let path = `${this.rootPath()}/security/options?options-type=${type}`
    if (type === 'props') {
      path += `&name=${props.name}`
    }

    return path
  }
  // #endregion

  // #region Overview
  advisoriesPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/advisories?${new URLSearchParams(params).toString()}`
  }

  ageOfAlertsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/age-of-alerts?${new URLSearchParams(params).toString()}`
  }

  alertActivityPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/alert-activity?${new URLSearchParams(params).toString()}`
  }

  introducedAndPreventedPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/introduced-prevented?${new URLSearchParams(params).toString()}`
  }

  alertTrendsPath: PathFunction<AlertTrendsQueryParams> = ({alertState, grouping, query, ...rest}) => {
    const isOpenSelected = alertState !== 'closed'
    const params = new URLSearchParams({
      'alertTrendsChart[isOpenSelected]': isOpenSelected.toString(),
      query,
      ...rest,
    })

    let endpointSuffix: AlertTrendsEndpointSuffix = 'tool-code-scanning'
    switch (grouping) {
      case 'age':
        endpointSuffix = 'age'
        break
      case 'severity':
        endpointSuffix = 'severity'
        break
      case 'tool':
        if (query.includes('dependabot')) {
          endpointSuffix = 'tool-dependabot-alerts'
        } else if (query.includes('secret-scanning')) {
          endpointSuffix = 'tool-secret-scanning'
        }
        break
    }

    return `${this.rootPath()}/security/overview/alert-trends-by-${endpointSuffix}?${params.toString()}`
  }

  autofixSuggestionsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/autofix-suggestions?${new URLSearchParams(params).toString()}`
  }

  csvExportPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/export?${new URLSearchParams(params).toString()}`
  }

  meanTimeToRemediatePath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/mean-time-to-remediate?${new URLSearchParams(params).toString()}`
  }

  netResolveRatePath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/net-resolve-rate?${new URLSearchParams(params).toString()}`
  }

  reopenedAlertsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/reopened-alerts?${new URLSearchParams(params).toString()}`
  }

  repositoriesPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/repositories?${new URLSearchParams(params).toString()}`
  }

  sastPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/sast?${new URLSearchParams(params).toString()}`
  }

  secretsBypassedPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/secrets-bypassed?${new URLSearchParams(params).toString()}`
  }
  // #endregion

  // #region Enablement trends report
  enablementTrendsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/enablement/enablement-trends?${new URLSearchParams(params).toString()}`
  }
  // #endregion

  // #region Code Scanning report
  codeScanningMetricsPath: PathFunction<CodeScanningMetricsParams> = params =>
    `${this.rootPath()}/security/metrics/codeql?${toSearchParams(params).toString()}`

  codeScanningAlertsFoundPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/alerts-found?${toSearchParams(params).toString()}`

  codeScanningAutofixSuggestionsPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/autofix-suggestions?${toSearchParams(params).toString()}`

  codeScanningAlertsFixedPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/alerts-fixed?${toSearchParams(params).toString()}`

  codeScanningAlertTrendsPath: PathFunction<CodeScanningReportParams & {groupKey: 'status' | 'severity'}> = ({
    groupKey,
    ...rest
  }) => {
    return `${this.rootPath()}/security/metrics/codeql/alert-trends-by-${groupKey}?${toSearchParams(rest)}`
  }

  codeScanningAlertsFixedWithAutofixPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/alerts-fixed-with-autofix?${toSearchParams(params).toString()}`

  codeScanningRemediationRatesPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/remediation-rates?${toSearchParams(params).toString()}`

  codeScanningMostPrevalentRulesPath: PathFunction<CodeScanningReportParams & PageParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/most-prevalent-rules?${toSearchParams(params).toString()}`

  codeScanningRepositoriesPath: PathFunction<CodeScanningReportParams & PageParams & SortParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/repositories?${toSearchParams(params).toString()}`

  codeScanningCsvExportPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/export?${toSearchParams(params).toString()}`
  // #endregion

  // #region Secret Scanning report
  secretScanningMetricsPath: PathFunction<SecretScanningMetricsParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning?${new URLSearchParams(params).toString()}`
  }

  secretsPushProtectionMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretsPushProtectionBlocksByTokenTypeMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics/block-counts-by-token-type?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretsPushProtectionBlocksByRepositoryMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics/block-counts-by-repo?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretsPushProtectionBypassesByTokenTypeMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics/bypass-counts-by-token-type?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretsPushProtectionBypassesByRepositoryMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics/bypass-counts-by-repo?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretScanningAlertCentricViewPath: PathFunction<SecretScanningAlertCentricViewParams> = params => {
    return `${this.rootPath()}/security/alerts/secret-scanning?${new URLSearchParams(params).toString()}`
  }
  // #endregion

  // #region Unified Alerts

  unifiedAlertsCountsPath: PathFunction<{query?: string}> = params => {
    return `${this.rootPath()}/security/alerts/counts?${new URLSearchParams(params).toString()}`
  }

  unifiedAlertsAlertsPath: PathFunction<{query?: string; cursor?: string}> = params => {
    return `${this.rootPath()}/security/alerts/alerts?${new URLSearchParams(params).toString()}`
  }

  unifiedAlertsGroupsPath: PathFunction<{groupKey: string; query?: string; cursor?: string}> = params => {
    return `${this.rootPath()}/security/alerts/groups?${new URLSearchParams(params).toString()}`
  }

  // #endregion

  // #region Alert Prioritization
  enqueueAlertPrioritizationCopilotPromptExperimentPath: PathFunction = () => {
    return `${this.rootPath()}/security/alert_prioritization/enqueue_copilot_prompt_experiment`
  }
  // #endregion

  onboardingAdvancedSecurityPath: PathFunction<void> = () => {
    return orgOnboardingAdvancedSecurityPath({org: this.org})
  }
}

export class EnterprisePaths implements Paths {
  constructor(private biz: string) {}

  private rootPath: PathFunction = () => `/enterprises/${encodePart(this.biz)}`

  // #region Options
  suggestionsPath: PathFunction<SuggestionsQueryParams> = props => {
    const {type} = props
    let path = `${this.rootPath()}/security/options?options-type=${type}`
    if (type === 'props') {
      path += `&name=${props.name}`
    }

    return path
  }
  // #endregion

  // #region Overview
  advisoriesPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/advisories?${new URLSearchParams(params).toString()}`
  }

  ageOfAlertsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/age-of-alerts?${new URLSearchParams(params).toString()}`
  }

  alertActivityPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/alert-activity?${new URLSearchParams(params).toString()}`
  }

  introducedAndPreventedPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/introduced-prevented?${new URLSearchParams(params).toString()}`
  }

  alertTrendsPath: PathFunction<AlertTrendsQueryParams> = ({alertState, grouping, query, ...rest}) => {
    const isOpenSelected = alertState !== 'closed'
    const params = new URLSearchParams({
      'alertTrendsChart[isOpenSelected]': isOpenSelected.toString(),
      query,
      ...rest,
    })

    let endpointSuffix: AlertTrendsEndpointSuffix = 'tool-code-scanning'
    switch (grouping) {
      case 'age':
        endpointSuffix = 'age'
        break
      case 'severity':
        endpointSuffix = 'severity'
        break
      case 'tool':
        if (query.includes('dependabot')) {
          endpointSuffix = 'tool-dependabot-alerts'
        } else if (query.includes('secret-scanning')) {
          endpointSuffix = 'tool-secret-scanning'
        }
        break
    }

    return `${this.rootPath()}/security/overview/alert-trends-by-${endpointSuffix}?${params.toString()}`
  }

  autofixSuggestionsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/autofix-suggestions?${new URLSearchParams(params).toString()}`
  }

  csvExportPath: PathFunction<CardQueryParams> = () => {
    throw new Error('CSV exports are currently unsupported at the enterprise level')
  }

  meanTimeToRemediatePath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/mean-time-to-remediate?${new URLSearchParams(params).toString()}`
  }

  netResolveRatePath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/net-resolve-rate?${new URLSearchParams(params).toString()}`
  }

  reopenedAlertsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/reopened-alerts?${new URLSearchParams(params).toString()}`
  }

  repositoriesPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/repositories?${new URLSearchParams(params).toString()}`
  }

  sastPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/sast?${new URLSearchParams(params).toString()}`
  }

  secretsBypassedPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/overview/secrets-bypassed?${new URLSearchParams(params).toString()}`
  }
  // #endregion

  // #region Enablement trends report
  enablementTrendsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/enablement/enablement-trends?${new URLSearchParams(params).toString()}`
  }
  // #endregion

  // #region Code Scanning report
  codeScanningMetricsPath: PathFunction<CodeScanningMetricsParams> = params =>
    `${this.rootPath()}/security/metrics/codeql?${toSearchParams(params).toString()}`

  codeScanningAlertsFoundPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/alerts-found?${toSearchParams(params).toString()}`

  codeScanningAutofixSuggestionsPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/autofix-suggestions?${toSearchParams(params).toString()}`

  codeScanningAlertsFixedPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/alerts-fixed?${toSearchParams(params).toString()}`

  codeScanningAlertTrendsPath: PathFunction<CodeScanningReportParams & {groupKey: 'status' | 'severity'}> = ({
    groupKey,
    ...rest
  }) => {
    return `${this.rootPath()}/security/metrics/codeql/alert-trends-by-${groupKey}?${toSearchParams(rest)}`
  }

  codeScanningAlertsFixedWithAutofixPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/alerts-fixed-with-autofix?${toSearchParams(params).toString()}`

  codeScanningRemediationRatesPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/remediation-rates?${toSearchParams(params).toString()}`

  codeScanningMostPrevalentRulesPath: PathFunction<CodeScanningReportParams & PageParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/most-prevalent-rules?${toSearchParams(params).toString()}`

  codeScanningRepositoriesPath: PathFunction<CodeScanningReportParams & PageParams & SortParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/repositories?${toSearchParams(params).toString()}`

  codeScanningCsvExportPath: PathFunction<CodeScanningReportParams> = params =>
    `${this.rootPath()}/security/metrics/codeql/export?${toSearchParams(params).toString()}`
  // #endregion

  // #region Secret Scanning report
  secretScanningMetricsPath: PathFunction<SecretScanningMetricsParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning?${new URLSearchParams(params).toString()}`
  }

  secretsPushProtectionMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretsPushProtectionBlocksByTokenTypeMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics/block-counts-by-token-type?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretsPushProtectionBlocksByRepositoryMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics/block-counts-by-repo?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretsPushProtectionBypassesByTokenTypeMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics/bypass-counts-by-token-type?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretsPushProtectionBypassesByRepositoryMetricsPath: PathFunction<CardQueryParams> = params => {
    return `${this.rootPath()}/security/metrics/secret-scanning/push-protection-metrics/bypass-counts-by-repo?${new URLSearchParams(
      params,
    ).toString()}`
  }

  secretScanningAlertCentricViewPath: PathFunction<SecretScanningAlertCentricViewParams> = params => {
    return `${this.rootPath()}/security/alerts/secret-scanning?${new URLSearchParams(params).toString()}`
  }

  // #endregion

  // #region Unified Alerts

  unifiedAlertsCountsPath: PathFunction<{query?: string}> = () => {
    throw new Error('Unified alerts is not implemented for enterprise.')
  }

  unifiedAlertsAlertsPath: PathFunction<{query?: string; cursor?: string}> = () => {
    throw new Error('Unified alerts is not implemented for enterprise.')
  }

  unifiedAlertsGroupsPath: PathFunction<{groupKey: string; query?: string; cursor?: string}> = () => {
    throw new Error('Unified alerts is not implemented for enterprise.')
  }

  // #endregion

  // #region Alert Prioritization
  enqueueAlertPrioritizationCopilotPromptExperimentPath: PathFunction = () => {
    throw new Error('Copilot prompt experiments are not supported at the enterprise level')
  }
  // #endregion

  onboardingAdvancedSecurityPath: PathFunction<void> = () => {
    throw new Error('onboardingAdvancedSecurityPath not available for enterprise')
  }
}
