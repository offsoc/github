import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import {useMemo} from 'react'
import type {EntryPointComponent} from 'react-relay'

import {PullRequestFilesViewer} from '../components/PullRequestFilesViewer'
import {PullRequestLayout} from '../components/PullRequestLayout'
import {PullRequestViewerLoading} from '../components/skeletons/PullRequestViewerLoading'
import {FocusedFileContextProvider} from '../contexts/FocusedFileContext'
import usePullRequestPageAppPayload from '../hooks/use-pull-request-page-app-payload'
import {useRouteInfo} from '../hooks/use-route-info'
import type {PullRequestFilesPageProps} from '../types'

export const PullRequestFilesPage: EntryPointComponent<PullRequestFilesPageProps, Record<string, never>> = ({
  queries,
}) => {
  const {
    pullRequest: {defaultMergeMethod, headRefOid, basePageDataUrl},
    refListCacheKey,
  } = usePullRequestPageAppPayload()
  const itemIdentifier = useRouteInfo()
  const analyticsMetadata = useMemo(
    () => ({pullRequestId: itemIdentifier?.number.toString() ?? '', view: 'files'}),
    [itemIdentifier?.number],
  )

  if (!itemIdentifier) throw new Error('no item identifier!')

  const {headerQuery, mainContentAreaQuery, ...remainingQueries} = queries

  return (
    <PageDataContextProvider basePageDataUrl={basePageDataUrl}>
      <AnalyticsProvider appName="pull_request" category="prx" metadata={analyticsMetadata}>
        <FocusedFileContextProvider>
          <PullRequestLayout
            defaultMergeMethod={defaultMergeMethod}
            headRefOid={headRefOid}
            itemIdentifier={itemIdentifier}
            loadingComponent={<PullRequestViewerLoading type="files" />}
            queries={{headerQuery, mainContentAreaQuery}}
            refListCacheKey={refListCacheKey}
            body={
              <PullRequestFilesViewer
                {...itemIdentifier}
                pullRequestNumber={itemIdentifier.number}
                queries={remainingQueries}
              />
            }
          />
        </FocusedFileContextProvider>
      </AnalyticsProvider>
    </PageDataContextProvider>
  )
}
