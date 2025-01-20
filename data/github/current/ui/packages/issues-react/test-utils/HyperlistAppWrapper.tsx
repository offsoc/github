import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import {useMemo} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import type {createMockEnvironment} from 'relay-test-utils'

import {App} from '../App'

interface HyperlistAppProps {
  children: JSX.Element
  environment: ReturnType<typeof createMockEnvironment>
  metadata?: {[key: string]: string}
}

/**
 * Shared setup to faciliate testing individual components that descend from the hyperlist app
 */
export default function HyperlistAppWrapper({environment, children, metadata}: HyperlistAppProps) {
  const appPayloadContextValue = useMemo(() => ({initial_view_content: {}, enabled_features: {}}), [])

  return (
    <AppPayloadContext.Provider value={appPayloadContextValue}>
      <App>
        <RelayEnvironmentProvider environment={environment}>
          <AnalyticsProvider appName="hyperlist" category="search" metadata={{...metadata}}>
            {children}
          </AnalyticsProvider>
        </RelayEnvironmentProvider>
      </App>
    </AppPayloadContext.Provider>
  )
}
