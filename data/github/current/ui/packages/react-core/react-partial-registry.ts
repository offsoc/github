import {DeferredRegistry} from './deferred-registry'

export interface PartialRegistration {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>
}

export const partialRegistry = new DeferredRegistry<PartialRegistration>()

export function getReactPartial(appName: string) {
  return partialRegistry.getRegistration(appName)
}
