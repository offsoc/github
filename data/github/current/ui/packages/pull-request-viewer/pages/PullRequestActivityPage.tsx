import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import {useMemo} from 'react'
import type {EntryPointComponent} from 'react-relay'

import {PullRequestActivityViewer} from '../components/PullRequestActivityViewer'
import {PullRequestLayout} from '../components/PullRequestLayout'
import {PullRequestViewerLoading} from '../components/skeletons/PullRequestViewerLoading'
import usePullRequestPageAppPayload from '../hooks/use-pull-request-page-app-payload'
import {useRouteInfo} from '../hooks/use-route-info'
import type {PullRequestActivityPageProps} from '../types'

export const PullRequestActivityPage: EntryPointComponent<PullRequestActivityPageProps, Record<string, never>> = ({
  queries,
}) => {
  const {
    pullRequest: {defaultMergeMethod, headRefOid, basePageDataUrl},
    refListCacheKey,
  } = usePullRequestPageAppPayload()
  const itemIdentifier = useRouteInfo()
  const analyticsMetadata = useMemo(
    () => ({pullRequestId: itemIdentifier?.number.toString() ?? '', view: 'activity'}),
    [itemIdentifier?.number],
  )

  if (!itemIdentifier) throw new Error('no item identifier!')

  const {headerQuery, mainContentAreaQuery, contentQuery} = queries

  return (
    <PageDataContextProvider basePageDataUrl={basePageDataUrl}>
      <AnalyticsProvider appName="pull_request" category="prx" metadata={analyticsMetadata}>
        <PullRequestLayout
          defaultMergeMethod={defaultMergeMethod}
          headRefOid={headRefOid}
          itemIdentifier={itemIdentifier}
          loadingComponent={<PullRequestViewerLoading type="activity" />}
          queries={{headerQuery, mainContentAreaQuery}}
          refListCacheKey={refListCacheKey}
          showFileTree={false}
          body={
            <PullRequestActivityViewer
              {...itemIdentifier}
              pullRequestNumber={itemIdentifier.number}
              queries={{contentQuery}}
            />
          }
        />
      </AnalyticsProvider>
    </PageDataContextProvider>
  )
}
