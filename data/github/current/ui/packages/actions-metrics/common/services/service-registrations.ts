import {AnalyticsService} from './analytics-service'
import {CacheService} from './cache-service'
import {DataService} from './data-service'
import {ErrorService} from './error-service'
import {PayloadService} from './payload-service'
import {FilterService} from './filter-service'
import {RoutingService} from './routing-service'
import type {ServiceFactory} from './services'

let registered = false

// Add new services to be registered here
const servicesToBeRegistered = [
  AnalyticsService,
  CacheService,
  DataService,
  ErrorService,
  PayloadService,
  FilterService,
  RoutingService,
]

export const registerServices = () => {
  if (!registered) {
    registered = true
    for (const serviceType of servicesToBeRegistered) {
      serviceType.registerService(serviceType.serviceId, serviceType as unknown as ServiceFactory)
    }
  }
}
