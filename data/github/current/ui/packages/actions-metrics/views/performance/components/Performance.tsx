import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {MetricsLayoutTable} from '../../../common/components/MetricsLayoutTable'
import type {MetricsPayload} from '../../../common/models/models'
import {LABELS} from '../../../common/resources/labels'
import type {IPayloadService} from '../../../common/services/payload-service'
import {Services} from '../../../common/services/services'
import {PerformanceService} from '../services/performance-service'
import type {IMetricsService} from '../../../common/services/metrics-service'

export interface PerformanceProps {
  beta?: boolean
  showSideNav?: boolean
}

export function Performance(props: PerformanceProps) {
  const payload = useRoutePayload<MetricsPayload>()
  const payloadService = Services.get<IPayloadService>('IPayloadService')
  payloadService.init(payload)

  PerformanceService.registerService(PerformanceService.serviceId, PerformanceService)
  const metricsService = Services.get<IMetricsService>('IMetricsService')
  metricsService.setScope()

  return (
    <MetricsLayoutTable title={LABELS.actionsPerformanceMetrics} beta={props.beta} hideSideNav={props.showSideNav} />
  )
}
