/* eslint no-restricted-globals: ['off', '__TRUSTED_TYPE_POLICIES__'] */
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {sendStats} from '@github-ui/stats'

/*
 * Tinyfill for trusted types
 */

interface GHTrustedTypePolicyOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createHTML: (input: string, ...args: any[]) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createScript: (input: string, ...args: any[]) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createScriptURL: (input: string, ...args: any[]) => string
}

interface GHTrustedTypePolicyWithName extends GHTrustedTypePolicyOptions {
  name: string
}

function unimplemented(functionName: string) {
  return () => {
    throw new TypeError(`The policy does not implement the function ${functionName}`)
  }
}

const fallbacks = {
  createHTML: unimplemented('createHTML'),
  createScript: unimplemented('createScript'),
  createScriptURL: unimplemented('createScriptURL'),
}

const tinyfill = {
  createPolicy: (name: string, rules: Partial<GHTrustedTypePolicyOptions>): GHTrustedTypePolicyWithName => ({
    name,
    ...fallbacks,
    ...rules,
  }),
}

type TrustedTypesPolicies = Map<string, GHTrustedTypePolicyOptions>

declare global {
  // eslint-disable-next-line no-var
  var trustedTypes: typeof tinyfill | undefined
  // We need to store the policies in a global variable so that they accurately track the global policy store in the
  // browser. This prevents false misses when there is more than one instance of this module loaded on the page.
  // eslint-disable-next-line no-var
  var __TRUSTED_TYPE_POLICIES__: TrustedTypesPolicies
}

const registeredPolicies: TrustedTypesPolicies = (globalThis.__TRUSTED_TYPE_POLICIES__ ??= new Map())

// eslint-disable-next-line compat/compat
const trustedTypes = globalThis.trustedTypes ?? tinyfill

export const ghTrustedTypes = {
  createPolicy: (name: string, rules: Partial<GHTrustedTypePolicyOptions>): GHTrustedTypePolicyWithName => {
    if (registeredPolicies.has(name)) {
      sendStats({
        incrementKey: 'TRUSTED_TYPES_POLICY_INITIALIZED_TWICE',
      })
      return registeredPolicies.get(name) as GHTrustedTypePolicyWithName
    } else {
      const policy = Object.freeze(trustedTypes.createPolicy(name, rules))
      registeredPolicies.set(name, policy)
      return policy
    }
  },
}

// This export is only for testing. Do not import in production code.
export const registeredPoliciesForTesting = registeredPolicies
export const tinyfillForTesting = tinyfill

/*
 *
 * This is a temporary warning to indicate to hubbers that the following errors are expected and safe to ignore.
 *
 */
let hasWarnedHubberAboutTrustedTypes = false

ssrSafeDocument?.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
  if (e.violatedDirective === 'require-trusted-types-for' && !hasWarnedHubberAboutTrustedTypes) {
    // eslint-disable-next-line no-console
    console.warn(`Hi fellow Hubber!
    You're probably seeing a Report Only Trusted Types error near this message. This is intended behaviour, staff-only,
    does not impact application control flow, and is used solely for statistic collection. Unfortunately we
    can't gather these statistics without adding the above warnings to your console. Sorry about that!
    Feel free to drop by #prodsec-engineering if you have any additional questions about Trusted Types or CSP.`)
    hasWarnedHubberAboutTrustedTypes = true
  }
})
