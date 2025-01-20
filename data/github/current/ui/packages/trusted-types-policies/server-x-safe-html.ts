import {getDocumentHtmlSafeNonces, verifyResponseHtmlSafeNonce} from '@github-ui/html-safe-nonce'
import {ghTrustedTypes} from '@github-ui/trusted-types'
import {trustedTypesPolicy} from './policy'

const policyName = 'server-x-safe-html'

// This is a no-op policy to be used with server-side rendered HTML.
export const serverXSafeHTMLPolicy = ghTrustedTypes.createPolicy(policyName, {
  createHTML: (s: string, response: Response) => {
    return trustedTypesPolicy.apply({
      policy: () => {
        verifyResponseHtmlSafeNonce(getDocumentHtmlSafeNonces(document), response)
        return s
      },
      policyName,
      fallback: s,
      silenceErrorReporting: true,
    })
  },
})
