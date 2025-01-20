import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {MetricsLayoutTable} from '../../../common/components/MetricsLayoutTable'
import type {MetricsPayload} from '../../../common/models/models'
import {LABELS} from '../../../common/resources/labels'
import type {IPayloadService} from '../../../common/services/payload-service'
import {Services} from '../../../common/services/services'
import {UsageService} from '../services/usage-service'
import type {IMetricsService} from '../../../common/services/metrics-service'

export interface UsageProps {
  beta?: boolean
  showSideNav?: boolean
}

export function Usage(props: UsageProps) {
  const payload = useRoutePayload<MetricsPayload>()
  const payloadService = Services.get<IPayloadService>('IPayloadService')
  payloadService.init(payload)

  UsageService.registerService(UsageService.serviceId, UsageService)
  const metricsService = Services.get<IMetricsService>('IMetricsService')
  metricsService.setScope()

  return <MetricsLayoutTable title={LABELS.actionsUsageMetrics} beta={props.beta} hideSideNav={props.showSideNav} />
}
