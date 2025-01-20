import {ghTrustedTypes} from '@github-ui/trusted-types'
import {trustedTypesPolicy} from './policy'

const policyName = 'jtml-no-op'

// This is a temporary policy to allow us to migrate to Trusted Types without breaking existing code.
export const temporaryPermissiveJtmlPolicy = ghTrustedTypes.createPolicy(policyName, {
  createHTML: (s: string) => {
    return trustedTypesPolicy.apply({
      policy: () => s,
      policyName,
      fallback: s,
      fallbackOnError: true,
    })
  },
})
