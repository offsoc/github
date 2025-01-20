/** @jest-environment node */
import {mockClientEnv} from '@github-ui/client-env/mock'
import {getEnabledFeatures, isFeatureEnabled} from '../feature-flags'

describe('isFeatureEnabled', () => {
  it('should return true if the feature is enabled', () => {
    mockClientEnv({
      featureFlags: ['foo'],
    })

    expect(isFeatureEnabled('foo')).toBe(true)
    expect(isFeatureEnabled('bar')).toBe(false)
  })

  it('should be case-insensitive', () => {
    mockClientEnv({
      featureFlags: ['baz'],
    })

    expect(isFeatureEnabled('baz')).toBe(true)
    expect(isFeatureEnabled('BAZ')).toBe(true)
  })
})

describe('getEnabledFeatures', () => {
  it('should return an array of enabled features', () => {
    mockClientEnv({
      featureFlags: ['foo', 'BAR', 'foo_bar'],
    })

    expect(getEnabledFeatures()).toEqual(['foo', 'bar', 'foo_bar'])
  })
})
