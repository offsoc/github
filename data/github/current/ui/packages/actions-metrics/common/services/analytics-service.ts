import type {IService} from './services'
import {ServiceBase} from './services'
import {sendEvent} from '@github-ui/hydro-analytics'

export interface IAnalyticsService extends IService {
  logEvent: (eventType: string, target: string, payload: object) => void
}

export class AnalyticsService extends ServiceBase implements IAnalyticsService {
  public static override readonly serviceId = 'IAnalyticsService'

  logEvent = (eventType: string, target: string, payload: object) => {
    sendEvent(`${CONTEXT.app_name}.${eventType}`, {...CONTEXT, ...payload, target})
  }
}

const CONTEXT = {
  app_name: 'actions-metrics',
  category: '',
  react: true,
}
