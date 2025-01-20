import type {EnabledFeatures} from '../../client/api/enabled-features/contracts'
import {getEnabledFeatures} from '../../client/helpers/feature-flags'
import {defaultEnabledFeaturesConfig} from '../../mocks/generate-enabled-features-from-url'
import {createMockEnvironment} from '../create-mock-environment'

const setupTest = (enabledFeatures: Array<EnabledFeatures>) => {
  return createMockEnvironment({
    jsonIslandData: {
      'memex-enabled-features': enabledFeatures,
    },
  })
}

describe('getEnabledFeatures', () => {
  it('isDummyFeatureEnabled returns default when no features are enabled', () => {
    setupTest([])
    expect(getEnabledFeatures().memex_beta_with_dummy_feature).toEqual(
      defaultEnabledFeaturesConfig.memex_beta_with_dummy_feature,
    )
  })

  it('isDummyFeatureEnabled returns false when unknown features are enabled', () => {
    // @ts-expect-error passing an unknown feature flag here
    setupTest(['memex_beta_next'])
    expect(getEnabledFeatures().memex_beta_with_dummy_feature).toEqual(
      defaultEnabledFeaturesConfig.memex_beta_with_dummy_feature,
    )
  })

  it('isDummyFeatureEnabled returns true when feature is enabled', () => {
    setupTest(['memex_beta_with_dummy_feature'])
    expect(getEnabledFeatures().memex_beta_with_dummy_feature).toEqual(true)
  })
})
