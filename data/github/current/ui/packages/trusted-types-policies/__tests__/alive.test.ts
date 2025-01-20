import {alivePolicy} from '../alive'
import {isStaff} from '@github-ui/stats'
import {isFeatureEnabled} from '@github-ui/feature-flags'
jest.mock('@github-ui/stats')
jest.mock('@github-ui/feature-flags')

const mockReportError = jest.fn()

jest.mock('@github-ui/failbot', () => ({
  reportError: (...args: unknown[]) => mockReportError(...args),
}))

function isStaffMockValue(value: boolean) {
  ;(isStaff as jest.Mock).mockImplementation(() => value)
}

function isFeatureEnabledMockValue(value: boolean) {
  ;(isFeatureEnabled as jest.Mock).mockImplementation(() => value)
}

function isFeatureEnabledMockError(message: string) {
  ;(isFeatureEnabled as jest.Mock).mockImplementation(() => {
    throw new Error(message)
  })
}

describe('alivePolicy', () => {
  it('throws an error when rel is invalid', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(false)
    const sourceRel = 'https://attacker.com/assets-cdn/worker/socket-worker-cda4e63471af.js'
    expect(() => alivePolicy.createScriptURL(sourceRel)).toThrow('Alive worker src URL must start with a slash')
  })

  it('returns the href and reports to failbot when an unexpected error occurs', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockError('unexpected error')
    const sourceRel = 'https://attacker.com/assets-cdn/worker/socket-worker-cda4e63471af.js'
    const trustedHTML = alivePolicy.createScriptURL(sourceRel)
    expect(mockReportError).toHaveBeenCalled()
    expect(trustedHTML).toEqual(sourceRel)
  })

  it('returns the href when the rel is valid', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(false)
    const sourceRel = '/assets-cdn/worker/socket-worker-cda4e63471af.js'
    const trustedHTML = alivePolicy.createScriptURL(sourceRel)
    expect(trustedHTML).toEqual(sourceRel)
  })

  it('returns the href if the user is not github staff', async () => {
    isStaffMockValue(false)
    isFeatureEnabledMockValue(false)
    const sourceRel = 'https://attacker.com/assets-cdn/worker/socket-worker-cda4e63471af.js'
    const trustedHTML = alivePolicy.createScriptURL(sourceRel)
    expect(trustedHTML).toEqual(sourceRel)
  })

  it('returns the href if the bypass feature flag is enabled', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(true)
    const sourceRel = 'https://attacker.com/assets-cdn/worker/socket-worker-cda4e63471af.js'
    const trustedHTML = alivePolicy.createScriptURL(sourceRel)
    expect(trustedHTML).toEqual(sourceRel)
  })
})
