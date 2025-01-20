import React from 'react'
import {FeatureFlags} from '@primer/react/experimental'
import {getEnabledFeatures} from '@github-ui/feature-flags'

interface PrimerFeatureFlagsProps extends React.PropsWithChildren {}

export function PrimerFeatureFlags({children}: PrimerFeatureFlagsProps) {
  const featureFlags = getEnabledFeatures()
  const flags = React.useMemo(() => {
    const result: Record<string, boolean> = {}
    for (const flag of featureFlags) {
      if (flag.startsWith('primer_react_')) {
        result[flag] = true
      }
    }
    return result
    // Note: getEnabledFeatures() will be constant between renders. It is placed
    // within the component so that mockClientEnv works as expected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <FeatureFlags flags={flags}>{children}</FeatureFlags>
}
