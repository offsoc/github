import type {FilterSuggestion} from '@github-ui/filter'
import config from '../../../../config/code_security_configuration_failures.json'
import {DependencyGraphAutosubmitActionDefaultOptions} from '../components/SecurityProducts/DependencyGraph'
import {SettingValue} from '../security-products-enablement-types'

interface FailureReasonProps {
  frontend_label: string
  frontend_dialog_title?: string
  filter_token: string
  filter_display: string
  audit_log_allowed: boolean
  audit_log_message?: string
  frontend_banner_reason: string
}
export const ENABLEMENT_FAILURES_MAP = new Map<string, FailureReasonProps>(Object.entries(config.failures))

export const getFailureReasonValues = () => {
  const map = new Map<string, FilterSuggestion>()
  for (const [_, {filter_token, filter_display}] of ENABLEMENT_FAILURES_MAP) {
    if (!map.get(filter_token)) {
      map.set(filter_token, {
        value: filter_token,
        displayName: filter_display,
        priority: 1,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => a.displayName!.toString().localeCompare(b.displayName!.toString()))
}

export const DEFAULT_SECURITY_CONFIGURATION_STATE = {
  enableGHAS: true,
  dependencyGraph: SettingValue.Enabled,
  dependencyGraphAutosubmitAction: SettingValue.NotSet,
  dependencyGraphAutosubmitActionOptions: DependencyGraphAutosubmitActionDefaultOptions,
  dependabotAlerts: SettingValue.Enabled,
  dependabotAlertsVEA: SettingValue.Enabled,
  dependabotSecurityUpdates: SettingValue.NotSet,
  codeScanning: SettingValue.Enabled,
  secretScanning: SettingValue.Enabled,
  secretScanningPushProtection: SettingValue.Enabled,
  secretScanningValidityChecks: SettingValue.Enabled,
  secretScanningNonProviderPatterns: SettingValue.Enabled,
  privateVulnerabilityReporting: SettingValue.Enabled,
}
