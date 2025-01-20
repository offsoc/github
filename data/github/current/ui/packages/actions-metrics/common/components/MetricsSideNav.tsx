import {InsightsSidenavPanel} from '@github-ui/insights-sidenav'
import {Services} from '../services/services'
import type {IPayloadService} from '../services/payload-service'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {PATHS} from '../constants/controller_paths'

export const MetricsSideNav = () => {
  const payloadService = Services.get<IPayloadService>('IPayloadService')
  return (
    <InsightsSidenavPanel
      selectedKey={getSideNavKey()}
      showActionsPerformanceMetrics={payloadService.getFeatureFlag('actions_performance_metrics')}
      showActionsUsageMetrics={payloadService.getFeatureFlag('actions_usage_metrics')}
      showDependencies={payloadService.getFeatureFlag('dependency_insights_enabled')}
      showApi={payloadService.getFeatureFlag('api_insights_enabled')}
      urls={payloadService.getPayload().paths || {}}
    />
  )
}

const getSideNavKey = (): 'actions_usage_metrics' | 'actions_performance_metrics' | undefined => {
  if (ssrSafeWindow?.location.href.includes(PATHS.performance)) {
    return 'actions_performance_metrics'
  } else if (ssrSafeWindow?.location.href.includes(PATHS.usage)) {
    return 'actions_usage_metrics'
  }

  return undefined
}
