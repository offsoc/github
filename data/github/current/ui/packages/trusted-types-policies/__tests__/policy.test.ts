import {trustedTypesPolicy} from '../policy'
import {isStaff} from '@github-ui/stats'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import dompurify from 'dompurify'
jest.mock('@github-ui/stats')
jest.mock('@github-ui/feature-flags')
const mockReportError = jest.fn()
const mockSendEvent = jest.fn()

jest.mock('@github-ui/hydro-analytics', () => ({
  sendEvent: (...args: unknown[]) => mockSendEvent(...args),
}))

jest.mock('@github-ui/failbot', () => ({
  reportError: (...args: unknown[]) => mockReportError(...args),
}))

function isStaffMockValue(value: boolean) {
  ;(isStaff as jest.Mock).mockImplementation(() => value)
}

function isFeatureEnabledMockValue(value: boolean) {
  ;(isFeatureEnabled as jest.Mock).mockImplementation(() => value)
}

const mockSuccessfulPolicy = jest.fn(() => {
  return 'expected return'
})
const mockUnsafeStringPolicy = jest.fn(() => {
  return '<img src=x onerror=alert(1)//>'
})
const mockErroredPolicy = jest.fn(() => {
  throw new Error('policy error')
})

afterEach(() => {
  mockSendEvent.mockClear()
  mockReportError.mockClear()
})

describe('apply()', () => {
  it('throws an error and reports to failbot when the policy errors', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(false)
    expect(() =>
      trustedTypesPolicy.apply({policy: mockErroredPolicy, policyName: 'test-policy', fallback: 'fallback'}),
    ).toThrow('policy error')
    expect(mockReportError).toHaveBeenCalled()
  })

  it('returns the policy value when it is successful', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(false)
    expect(
      trustedTypesPolicy.apply({policy: mockSuccessfulPolicy, policyName: 'test-policy', fallback: 'fallback'}),
    ).toEqual('expected return')
  })

  it('returns the fallback if the bypass feature flag is enabled', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(true)
    expect(
      trustedTypesPolicy.apply({policy: mockSuccessfulPolicy, policyName: 'test-policy', fallback: 'fallback'}),
    ).toEqual('fallback')
  })
  it('returns the fallback if the policy errors but fallbackOnError is set', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(false)

    expect(
      trustedTypesPolicy.apply({
        policy: mockErroredPolicy,
        policyName: 'test-policy',
        fallback: 'fallback',
        fallbackOnError: true,
      }),
    ).toEqual('fallback')
    expect(jest.spyOn(dompurify, 'sanitize').mockReturnValue('expected return')).not.toHaveBeenCalled()
    expect(mockReportError).toHaveBeenCalled()
  })
  it('when sanitize is true, runs DOMPurify.sanitize() and sends an event if the output is different', async () => {
    isFeatureEnabledMockValue(false)
    expect(
      trustedTypesPolicy.apply({
        policy: mockUnsafeStringPolicy,
        policyName: 'test-policy',
        fallback: 'fallback',
        sanitize: true,
      }),
    ).toEqual('<img src=x onerror=alert(1)//>')
    expect(jest.spyOn(dompurify, 'sanitize').mockReturnValue('expected return')).toHaveBeenCalled()
    expect(mockSendEvent).toHaveBeenCalled()
  })
  it('when sanitize is true, runs DOMPurify.sanitize() and do not sends an event if the output the same', async () => {
    isFeatureEnabledMockValue(false)
    expect(
      trustedTypesPolicy.apply({
        policy: mockSuccessfulPolicy,
        policyName: 'test-policy',
        fallback: 'fallback',
        sanitize: true,
      }),
    ).toEqual('expected return')
    expect(jest.spyOn(dompurify, 'sanitize').mockReturnValue('expected return')).toHaveBeenCalled()
    expect(mockSendEvent).not.toHaveBeenCalled()
  })
  it('does not report to sentry if silenceErrorReporting is set', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(false)
    expect(
      trustedTypesPolicy.apply({
        policy: mockErroredPolicy,
        policyName: 'test-policy',
        fallbackOnError: true,
        fallback: 'fallback',
        silenceErrorReporting: true,
      }),
    ).toEqual('fallback')
    expect(mockReportError).not.toHaveBeenCalled()
  })
  it('does report to sentry if silenceErrorReporting is disabled', async () => {
    isStaffMockValue(true)
    isFeatureEnabledMockValue(false)
    expect(
      trustedTypesPolicy.apply({
        policy: mockErroredPolicy,
        policyName: 'test-policy',
        fallbackOnError: true,
        fallback: 'fallback',
        silenceErrorReporting: false,
      }),
    ).toEqual('fallback')
    expect(mockReportError).toHaveBeenCalled()
  })
})
