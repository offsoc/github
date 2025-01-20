import type {EnablementTrendData} from '../hooks/use-enablement-trend-data'
import type {SecurityCenterEnablementTrendsReportProps} from '../SecurityCenterEnablementTrendsReport'

export function getSecurityCenterEnablementTrendsReportProps(): SecurityCenterEnablementTrendsReportProps {
  return {
    initialQuery: '',
    initialDateSpan: {period: 'last30days'},
    feedbackLink: {
      text: 'Give feedback',
      url: '#',
    },
    showIncompleteDataWarning: false,
    incompleteDataWarningDocHref: 'https://docs.github.com/en',
    filterProviders: [],
  }
}

export function getEnablementTrendData(): EnablementTrendData {
  return {
    trendData: [
      {
        date: '2024-01-01',
        dependabotAlertsRepositoriesCount: 8,
        dependabotSecurityUpdatesRepositoriesCount: 8,
        codeScanningRepositoriesCount: 8,
        codeScanningPrAlertsRepositoriesCount: 8,
        secretScanningRepositoriesCount: 8,
        secretScanningPushProtectionRepositoriesCount: 8,
        advancedSecurityRepositoriesCount: 8,
        dependabotAlertsEnabled: 2,
        dependabotSecurityUpdatesEnabled: 3,
        codeScanningEnabled: 4,
        codeScanningPrAlertsEnabled: 5,
        secretScanningEnabled: 6,
        secretScanningPushProtectionEnabled: 7,
        advancedSecurityEnabled: 8,
      },
      {
        date: '2024-01-02',
        dependabotAlertsRepositoriesCount: 10,
        dependabotSecurityUpdatesRepositoriesCount: 10,
        codeScanningRepositoriesCount: 10,
        codeScanningPrAlertsRepositoriesCount: 10,
        secretScanningRepositoriesCount: 10,
        secretScanningPushProtectionRepositoriesCount: 10,
        advancedSecurityRepositoriesCount: 10,
        dependabotAlertsEnabled: 2,
        dependabotSecurityUpdatesEnabled: 3,
        codeScanningEnabled: 4,
        codeScanningPrAlertsEnabled: 5,
        secretScanningEnabled: 6,
        secretScanningPushProtectionEnabled: 7,
        advancedSecurityEnabled: 8,
      },
    ],
  }
}
