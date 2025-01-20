import {DeferredRegistry} from './deferred-registry'
import type {RouteRegistration} from './app-routing-types'

export interface AppRegistration {
  App?: React.ComponentType<{children?: React.ReactNode}>
  routes: RouteRegistration[]
}

export type AppRegistrationFn = () => AppRegistration

export const appRegistryFactory = new DeferredRegistry<AppRegistrationFn>()

export async function getReactApp(appName: string) {
  const factory = await appRegistryFactory.getRegistration(appName)
  return factory()
}
