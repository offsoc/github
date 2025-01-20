import {ghTrustedTypes} from '@github-ui/trusted-types'
import {trustedTypesPolicy} from './policy'

const policyName = 'include-fragment-element-no-op'

// This is a temporary policy to allow us to migrate to Trusted Types without breaking existing code.
export const temporaryPermissiveIncludeFragmentPolicy = ghTrustedTypes.createPolicy(policyName, {
  createHTML: (s: string) => {
    return trustedTypesPolicy.apply({
      policy: () => s,
      policyName,
      fallback: s,
      fallbackOnError: true,
    })
  },
})
