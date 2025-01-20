import {getSecurityCenterEnablementTrendsReportProps} from '../enablement-trends-report/test-utils/mock-data'
import {getSecurityCenterOverviewDashboardProps} from '../overview-dashboard/test-utils/mock-data'
import type {EnablementTrendsReportPayload} from '../routes/EnablementTrendsReport'
import type {OverviewPayload} from '../routes/Overview'
import type {SecretScanningReportPayload} from '../routes/SecretScanningReport'
import type {UnifiedAlertsPayload} from '../routes/UnifiedAlerts'
import {getSecretScanningMetricsProps} from '../secret-scanning-report/test-utils/mock-data'
import {getUnifiedAlertsProps} from '../unified-alerts/test-utils/mock-data'

export function getOverviewRoutePayload(): OverviewPayload {
  return getSecurityCenterOverviewDashboardProps()
}

export function getEnablementTrendsReportRoutePayload(): EnablementTrendsReportPayload {
  return getSecurityCenterEnablementTrendsReportProps()
}

export function getSecretScanningReportRoutePayload(): SecretScanningReportPayload {
  return getSecretScanningMetricsProps()
}

export function getUnifiedAlertsRoutePayload(): UnifiedAlertsPayload {
  return getUnifiedAlertsProps()
}
