import {ghTrustedTypes} from '@github-ui/trusted-types'
import {trustedTypesPolicy} from './policy'

const policyName = 'default'

export const temporaryPermissiveDefaultPolicy = ghTrustedTypes.createPolicy(policyName, {
  createHTML: (s: string) => {
    return trustedTypesPolicy.apply({
      policy: () => s,
      policyName,
      fallback: s,
      sanitize: true,
      fallbackOnError: true,
    })
  },
  createScript: (s: string) => {
    return trustedTypesPolicy.apply({
      policy: () => s,
      policyName,
      fallback: s,
      sanitize: false,
      fallbackOnError: true,
    })
  },
  createScriptURL: (s: string) => {
    return trustedTypesPolicy.apply({
      policy: () => s,
      policyName,
      fallback: s,
      sanitize: false,
      fallbackOnError: true,
    })
  },
})
