import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {AliveTestProvider} from '@github-ui/use-alive/test-utils'
import {Suspense} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import type {createMockEnvironment} from 'relay-test-utils'

import {NavigationPaneContextProvider} from '../contexts/NavigationPaneContext'
import {PendingSuggestedChangesBatchContextProvider} from '../contexts/PendingSuggestedChangesBatchContext'

interface PullRequestsAppProps {
  children: JSX.Element
  environment: ReturnType<typeof createMockEnvironment>
  metadata?: {[key: string]: string}
  pullRequestId: string
}

/**
 *
 * Shared setup to faciliate testing individual components that descend from the pull-requests app
 *
 */
export default function PullRequestsAppWrapper({environment, children, pullRequestId, metadata}: PullRequestsAppProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <AnalyticsProvider
        appName="pull_request"
        category="files_tab"
        metadata={{...metadata, pull_request_id: pullRequestId}}
      >
        <AliveTestProvider>
          <PendingSuggestedChangesBatchContextProvider headRefOid="mock" number={1} owner="mock" repo="mock">
            <NavigationPaneContextProvider>
              <ErrorBoundary>
                <Suspense fallback="Loading...">{children}</Suspense>
              </ErrorBoundary>
            </NavigationPaneContextProvider>
          </PendingSuggestedChangesBatchContextProvider>
        </AliveTestProvider>
      </AnalyticsProvider>
    </RelayEnvironmentProvider>
  )
}
