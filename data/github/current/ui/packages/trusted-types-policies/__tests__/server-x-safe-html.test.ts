import {serverXSafeHTMLPolicy} from '../server-x-safe-html'
import {isFeatureEnabled} from '@github-ui/feature-flags'

let shouldThrow = false
jest.mock('@github-ui/stats')
jest.mock('@github-ui/feature-flags')
jest.mock('@github-ui/html-safe-nonce', () => {
  return {
    __esModule: true,
    getDocumentHtmlSafeNonces: jest.fn(() => []),
    verifyResponseHtmlSafeNonce: jest.fn(() => {
      if (shouldThrow) throw new Error('nonce mismatch')
      return
    }),
  }
})

const mockReportError = jest.fn()
jest.mock('@github-ui/failbot', () => ({
  reportError: (...args: unknown[]) => mockReportError(...args),
}))

function isFeatureEnabledMockValue(value: boolean) {
  ;(isFeatureEnabled as jest.Mock).mockImplementation(() => value)
}

describe('serverXSafeHTMLPolicy', () => {
  it('checks that the nonce is correct', async () => {
    isFeatureEnabledMockValue(false)
    shouldThrow = false
    const trustedHTML = serverXSafeHTMLPolicy.createHTML('<div>Hello world</div>', {} as Response)
    expect(trustedHTML).toEqual('<div>Hello world</div>')
  })

  it('throws an error when nonce is incorrect', async () => {
    isFeatureEnabledMockValue(false)
    shouldThrow = true
    expect(() => serverXSafeHTMLPolicy.createHTML('<div>Hello world</div>', {} as Response)).toThrow('nonce mismatch')
  })

  it('returns the fallback string if the bypass feature flag is enabled, even if none is incorrect', async () => {
    isFeatureEnabledMockValue(true)
    shouldThrow = true
    const trustedHTML = serverXSafeHTMLPolicy.createHTML('<div>Hello world</div>', {} as Response)
    expect(trustedHTML).toEqual('<div>Hello world</div>')
  })
})
