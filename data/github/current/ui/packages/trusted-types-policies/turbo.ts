import {ghTrustedTypes} from '@github-ui/trusted-types'
import {trustedTypesPolicy} from './policy'

const policyName = 'turbo'

export const turboPolicy = ghTrustedTypes.createPolicy(policyName, {
  createHTML: (html: string) => {
    return trustedTypesPolicy.apply({
      policy: () => {
        return html
      },
      policyName: `${policyName}-html`,
      fallback: html,
      fallbackOnError: true,
      silenceErrorReporting: true,
    })
  },
  createScript: (script: string) => {
    return trustedTypesPolicy.apply({
      policy: () => {
        return script
      },
      policyName: `${policyName}-script`,
      fallback: script,
      fallbackOnError: true,
      silenceErrorReporting: true,
    })
  },
  createScriptURL: (url: string) => {
    return trustedTypesPolicy.apply({
      policy: () => {
        return url
      },
      policyName: `${policyName}-url`,
      fallback: url,
      fallbackOnError: true,
      silenceErrorReporting: true,
    })
  },
})
