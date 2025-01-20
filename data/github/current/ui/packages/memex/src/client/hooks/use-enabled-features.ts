import type {EnabledFeaturesMap} from '../api/enabled-features/contracts'
import {getEnabledFeatures} from '../helpers/feature-flags'

export const useEnabledFeatures = (): EnabledFeaturesMap => {
  return getEnabledFeatures()
}
