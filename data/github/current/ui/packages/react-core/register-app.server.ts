import type {AppRegistrationFn} from './react-app-registry'

export const reactAppFactories = new Map<string, AppRegistrationFn>()

/**
 * This is a shim for the registerReactAppFactory function. The standard version uses promises
 * to handle delayed registration, but we can rely on synchronous registration in
 * the Alloy bundle. This shim is injected via webpack
 **/
export function registerReactAppFactory(appName: string, factory: AppRegistrationFn) {
  reactAppFactories.set(appName, factory)
}
