import {useAppPayload} from './use-app-payload'

export type AppPayloadWithFeatureFlags = {enabled_features?: EnabledFeatures}
export type EnabledFeatures = {[key: string]: boolean | undefined}

/**
 * Fetches all client side feature flags.
 *
 * Note: If your app isn't rendered in the monolith using the registerReactAppFactory function,
 * you can use the FeatureFlagProvider to wrap your app in a context and populate the
 * client side feature flags yourself.
 */
export const useFeatureFlags = () => useAppPayload<AppPayloadWithFeatureFlags>()?.enabled_features ?? {}

/**
 * Fetches a specific client side feature flag.
 *
 * Note: If your app isn't rendered in the monolith using the registerReactAppFactory function,
 * you can use the FeatureFlagProvider to wrap your app in a context and populate the
 * client side feature flags yourself.
 */
export const useFeatureFlag = (featureName: string) => !!useFeatureFlags()[featureName]
