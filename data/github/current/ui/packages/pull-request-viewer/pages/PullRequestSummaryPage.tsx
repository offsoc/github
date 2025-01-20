import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import {useMemo} from 'react'
import type {EntryPointComponent} from 'react-relay'

import {PullRequestLayout} from '../components/PullRequestLayout'
import {PullRequestSummaryViewer} from '../components/PullRequestSummaryViewer'
import {PullRequestViewerLoading} from '../components/skeletons/PullRequestViewerLoading'
import usePullRequestPageAppPayload from '../hooks/use-pull-request-page-app-payload'
import {useRouteInfo} from '../hooks/use-route-info'
import type {PullRequestSummaryPageProps} from '../types'

export const PullRequestSummaryPage: EntryPointComponent<PullRequestSummaryPageProps, Record<string, never>> = ({
  queries,
}) => {
  const {
    pullRequest: {defaultMergeMethod, headRefOid, basePageDataUrl},
    refListCacheKey,
  } = usePullRequestPageAppPayload()
  const itemIdentifier = useRouteInfo()
  const analyticsMetadata = useMemo(
    () => ({pullRequestId: itemIdentifier?.number.toString() ?? '', view: 'overview'}),
    [itemIdentifier?.number],
  )

  if (!itemIdentifier) throw new Error('no item identifier!')

  const {headerQuery, mainContentAreaQuery, ...remainingQueries} = queries

  return (
    <PageDataContextProvider basePageDataUrl={basePageDataUrl}>
      <AnalyticsProvider appName="pull_request" category="prx" metadata={analyticsMetadata}>
        <PullRequestLayout
          defaultMergeMethod={defaultMergeMethod}
          headRefOid={headRefOid}
          itemIdentifier={itemIdentifier}
          loadingComponent={<PullRequestViewerLoading type="overview" />}
          queries={{headerQuery, mainContentAreaQuery}}
          refListCacheKey={refListCacheKey}
          showFileTree={false}
          body={
            <PullRequestSummaryViewer
              {...itemIdentifier}
              pullRequestNumber={itemIdentifier.number}
              queries={remainingQueries}
            />
          }
        />
      </AnalyticsProvider>
    </PageDataContextProvider>
  )
}
