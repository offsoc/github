import memoize from '@github/memoize'
import {getEnv} from '@github-ui/client-env'
import {IS_SERVER} from '@github-ui/ssr-utils'

function getEnabledFeaturesSet(): Set<string> {
  const features = getEnv().featureFlags
  const featuresUpperCase = features.map(feature => feature.toLowerCase())
  return new Set<string>(featuresUpperCase)
}

const featuresSet =
  IS_SERVER || process.env.NODE_ENV === 'test' ? getEnabledFeaturesSet : memoize(getEnabledFeaturesSet)

export function getEnabledFeatures(): string[] {
  return Array.from(featuresSet())
}

export function isFeatureEnabled(name: string): boolean {
  return featuresSet().has(name.toLowerCase())
}

//exported to allow mocking in tests
const featureFlag = {isFeatureEnabled}

export {featureFlag}
