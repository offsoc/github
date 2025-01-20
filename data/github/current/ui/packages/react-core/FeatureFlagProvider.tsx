import {type ReactNode, useMemo} from 'react'
import {AppPayloadContext} from './use-app-payload'
import type {AppPayloadWithFeatureFlags, EnabledFeatures} from './use-feature-flag'

type FeatureFlagProviderProps = {
  children: ReactNode
  features: EnabledFeatures
}

/**
 * This is a context provider for products in the monolith that are not fully integrated via the established
 * mechanisms set by the web-systems for rendering React applications.
 *
 * This wraps the {@link AppPayloadContext} to replicate the server-side behavior of setting client side feature flags
 * to enable the usage of the useFeatureFlag() hook.
 */
export const FeatureFlagProvider = ({children, features}: FeatureFlagProviderProps) => {
  const contextValue: AppPayloadWithFeatureFlags = useMemo(
    () => ({
      enabled_features: features,
    }),
    [features],
  )

  return <AppPayloadContext.Provider value={contextValue}>{children}</AppPayloadContext.Provider>
}
