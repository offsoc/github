import {
  allFeaturesDisabled,
  type EnabledFeatures,
  enabledFeatures,
  type EnabledFeaturesMap,
} from '../api/enabled-features/contracts'
import {fetchJSONIslandData} from './json-island'

let featureKeys: Set<string> | undefined = undefined
let enabledFeaturesMap: EnabledFeaturesMap = allFeaturesDisabled

export function getEnabledFeatures() {
  if (!featureKeys) {
    const features = fetchJSONIslandData('memex-enabled-features')
    featureKeys = features && new Set(features)

    for (const feature of enabledFeatures) {
      enabledFeaturesMap[feature] = isEnabled(feature)
    }
  }
  return enabledFeaturesMap
}

function isEnabled(name: EnabledFeatures) {
  if (!featureKeys) {
    return false
  }
  return featureKeys.has(name)
}

/**
 * Test helper to reset the alive config
 * allowing us to test different configs between tests
 *
 * Should only be called within tests
 */
export function resetEnabledFeaturesForTests() {
  featureKeys = undefined
  enabledFeaturesMap = allFeaturesDisabled
}
