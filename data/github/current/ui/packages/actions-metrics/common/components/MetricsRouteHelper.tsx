import {useNavigate, useSearchParams} from '@github-ui/use-navigate'
import {useEffect} from 'react'
import type {IMetricsService} from '../services/metrics-service'
import type {IRoutingService} from '../services/routing-service'
import {Services} from '../services/services'

export interface MetricsRouteHelperProps {
  metricsService: IMetricsService
}

// this component wires up the routing service since we should not call hooks outside components
export function MetricsRouteHelper(props: MetricsRouteHelperProps) {
  const [searchParams] = useSearchParams()
  const routingService = Services.get<IRoutingService>('IRoutingService')
  const navigate = useNavigate()

  useEffect(() => {
    props.metricsService?.setMetricsViewFromSearchParams()
    routingService?.init(navigate)
    return () => {}
  }, [searchParams, props.metricsService, routingService, navigate])

  return <></>
}
