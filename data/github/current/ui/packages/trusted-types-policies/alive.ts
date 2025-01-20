import {ghTrustedTypes} from '@github-ui/trusted-types'
import {isStaff} from '@github-ui/stats'
import {TrustedTypesPolicyError, trustedTypesPolicy} from './policy'

const policyName = 'alive'

export class InvalidSourceRelError extends TrustedTypesPolicyError {}
export const alivePolicy = ghTrustedTypes.createPolicy(policyName, {
  createScriptURL: (url: string) => {
    return trustedTypesPolicy.apply({
      policy: () => {
        if (!isStaff()) return url
        if (!url.startsWith('/')) throw new InvalidSourceRelError('Alive worker src URL must start with a slash')
        return url
      },
      policyName,
      fallback: url,
      fallbackOnError: true,
    })
  },
})
