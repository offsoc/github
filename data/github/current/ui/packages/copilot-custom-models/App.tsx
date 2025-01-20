import {FeatureFlagProvider} from '@github-ui/react-core/feature-flag-provider'
import type {AppPayloadWithFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type React from 'react'
import {NavigateWithFlashBannerProvider} from './features/NavigateWithFlashBanner'

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App(props: {children?: React.ReactNode}) {
  const {enabled_features} = useRoutePayload<AppPayloadWithFeatureFlags>()
  return (
    <FeatureFlagProvider features={enabled_features ?? {}}>
      <NavigateWithFlashBannerProvider>{props.children}</NavigateWithFlashBannerProvider>
    </FeatureFlagProvider>
  )
}
