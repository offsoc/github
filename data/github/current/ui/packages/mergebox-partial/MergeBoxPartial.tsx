import {
  MergeMethodContextProvider,
  MergeBoxWithRelaySuspense,
  validateMergeMethod,
  MergeBoxWithSuspense,
} from '@github-ui/mergebox'
import {MergeMethod} from '@github-ui/mergebox/types'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {RelayEnvironmentProvider} from 'react-relay'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'

const environment = relayEnvironmentWithMissingFieldHandlerForNode()
export interface MergeBoxPartialProps {
  defaultMergeMethod: string
  pullRequestId: string
  basePageDataUrl: string
  shouldReadFromJSONAPI: boolean
  viewerLogin: string
}

export function MergeBoxPartial({
  defaultMergeMethod,
  pullRequestId,
  basePageDataUrl,
  shouldReadFromJSONAPI,
  viewerLogin,
}: MergeBoxPartialProps) {
  const mergeMethod = validateMergeMethod(defaultMergeMethod) ? defaultMergeMethod : MergeMethod.MERGE
  const analyticsMetadata = {pullRequestId, view: 'show'}

  return (
    <PageDataContextProvider basePageDataUrl={basePageDataUrl}>
      <AnalyticsProvider appName="pull_request" category="mergebox_react_partial" metadata={analyticsMetadata}>
        <MergeMethodContextProvider defaultMergeMethod={mergeMethod}>
          <RelayEnvironmentProvider environment={environment}>
            <div className="ml-md-6 pl-md-3 my-3" data-testid="mergebox-partial">
              {shouldReadFromJSONAPI ? (
                <MergeBoxWithSuspense isReadingFromJSONAPI={shouldReadFromJSONAPI} viewerLogin={viewerLogin} />
              ) : (
                <MergeBoxWithRelaySuspense isReadingFromJSONAPI={shouldReadFromJSONAPI} pullRequestId={pullRequestId} />
              )}
            </div>
          </RelayEnvironmentProvider>
        </MergeMethodContextProvider>
      </AnalyticsProvider>
    </PageDataContextProvider>
  )
}
