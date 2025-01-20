import type {PartialRegistration} from './react-partial-registry'

export const reactPartials = new Map<string, PartialRegistration>()

/**
 * This is a shim for the registerReactPartial function. The standard version uses promises
 * to handle delayed registration, but we can rely on synchronous registration in
 * the Alloy bundle. This shim is injected via webpack
 **/
export function registerReactPartial(name: string, registration: PartialRegistration) {
  reactPartials.set(name, registration)
}
