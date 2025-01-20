import {isFeatureEnabled} from '@github-ui/feature-flags'
import {sendStats} from '@github-ui/stats'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import dompurify from 'dompurify'
import {sendEvent} from '@github-ui/hydro-analytics'

export class TrustedTypesPolicyError extends Error {}

interface PolicyParam {
  policy: () => string
  policyName: string
  fallback: string
  fallbackOnError?: boolean
  sanitize?: boolean // report-only mode for now
  silenceErrorReporting?: boolean
}

function apply({
  policy,
  policyName,
  fallback,
  fallbackOnError = false,
  sanitize,
  silenceErrorReporting = false,
}: PolicyParam): string {
  try {
    if (isFeatureEnabled('BYPASS_TRUSTED_TYPES_POLICY_RULES')) return fallback
    sendStats({incrementKey: 'TRUSTED_TYPES_POLICY_CALLED', trustedTypesPolicyName: policyName}, false, 0.1)
    const policyOutput = policy()
    if (sanitize) {
      new Promise(resolve => {
        const startTime = window.performance.now()
        const sanitized = dompurify.sanitize(policyOutput, {FORBID_ATTR: []})
        const endTime = window.performance.now()
        const executionTime = endTime - startTime
        if (policyOutput.length !== sanitized.length) {
          const err = new Error('Trusted Types policy output sanitized')
          const stack = err.stack?.slice(0, 1000)
          const output = policyOutput.slice(0, 250)
          sendEvent('trusted_types_policy.sanitize', {
            policyName,
            output,
            stack,
            outputLength: policyOutput.length,
            sanitizedLength: sanitized.length,
            executionTime,
          })
          resolve(policyOutput)
        }
      })
    }
    return policyOutput
  } catch (e) {
    if (e instanceof TrustedTypesPolicyError) throw e
    if (!silenceErrorReporting) reportError(e)
    sendStats({incrementKey: 'TRUSTED_TYPES_POLICY_ERROR', trustedTypesPolicyName: policyName})
    if (!fallbackOnError) throw e
  }

  return fallback
}

export const trustedTypesPolicy = {apply}
