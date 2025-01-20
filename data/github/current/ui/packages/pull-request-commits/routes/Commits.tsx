import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Commits as CommitsList} from '@github-ui/commits/shared/Commits'
import {CommitsBlankState} from '@github-ui/commits/shared/CommitsBlankState'
import {useAnalytics} from '@github-ui/use-analytics'

import {PullRequestHeader} from '../components/PullRequestHeader'
import {PageLayout, Flash} from '@primer/react'
import {OptOut} from '../components/OptOut'
import {useCommitsLiveUpdates} from '../hooks/use-commits-live-updates'
import {useHeaderLiveUpdates} from '../hooks/use-header-live-updates'
import {useCommitsPageData} from '../page-data/loaders/use-commits-page-data'
import {useHeaderPageData} from '../page-data/loaders/use-header-page-data'
import {ObservableBox as StickyHeaderActivationThreshold} from '@github-ui/use-sticky-header/ObservableBox'
import {useStickyHeader} from '@github-ui/use-sticky-header/useStickyHeader'
import {responsiveWrapperClasses, StickyPullRequestHeader} from '../components/StickyPullRequestHeader'
import type {HeaderPageData} from '../page-data/payloads/header'
import type {CommitsPageData} from '../page-data/payloads/commits'
import {useLoadDeferredCommitDataPaginated} from '@github-ui/commits/shared/useLoadDeferredCommitData'
import {useEffect} from 'react'

export type CommitsRoutePayload = CommitsPageData &
  HeaderPageData & {
    metadata: {
      deferredCommitsDataUrl: string
      aliveChannel: string
    }
  }

const loggingPrefix = 'prx_commits.'

export function Commits() {
  const {
    commitGroups,
    metadata: {deferredCommitsDataUrl, aliveChannel},
    pullRequest,
    bannersData,
    repository,
    timeOutMessage,
    truncated,
    urls,
    user,
  } = useRoutePayload<CommitsRoutePayload>()

  const {isSticky, observe, unobserve} = useStickyHeader()
  const {data: headerData} = useHeaderPageData({repository, pullRequest, bannersData, urls, user})
  const {data: commitsData, dataUpdatedAt} = useCommitsPageData({
    commitGroups,
    repository,
    timeOutMessage,
    truncated,
  })
  useCommitsLiveUpdates(aliveChannel)
  useHeaderLiveUpdates(aliveChannel)
  const deferredCommitsData = useLoadDeferredCommitDataPaginated(
    deferredCommitsDataUrl,
    //currently passing in 0 to start at the beginning, but if we want to paginate in the future this would be a variable
    0,
    pullRequest.commitsCount,
    dataUpdatedAt,
  )
  const {sendAnalyticsEvent} = useAnalytics()

  const loggingInfo = {commitCount: pullRequest.commitsCount, prNumber: pullRequest.number}

  useEffect(() => {
    sendAnalyticsEvent(`${loggingPrefix}page_view`, 'COMMITS_PAGE_VIEWED', loggingInfo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {isSticky && <StickyPullRequestHeader repository={repository} pullRequest={pullRequest} />}
      <div className={`mt-4 ${responsiveWrapperClasses}`}>
        <PageLayout padding="none">
          <PageLayout.Header>
            <PullRequestHeader {...headerData} />
            {/* On scroll, when this element reaches the top of the viewport, the sticky header activates */}
            <StickyHeaderActivationThreshold
              sx={{visibility: 'hidden', height: '1px'}}
              onObserve={observe}
              onUnobserve={unobserve}
            />
          </PageLayout.Header>

          <h2 className="sr-only">Commits</h2>

          <PageLayout.Content as="div">
            <div data-testid="commits-list" data-hpc>
              {commitsData.commitGroups.length === 0 && (
                <CommitsBlankState timeoutMessage={commitsData.timeOutMessage} />
              )}
              {commitsData.commitGroups.length > 0 && (
                <>
                  {commitsData.truncated && (
                    <Flash variant="warning" className="mb-3">
                      This pull request is big! We&apos;re only showing the most recent 250 commits
                    </Flash>
                  )}
                  <CommitsList
                    commitGroups={commitsData.commitGroups}
                    deferredCommitData={deferredCommitsData}
                    repository={commitsData.repository}
                    loggingPrefix={loggingPrefix}
                    loggingPayload={loggingInfo}
                  />
                </>
              )}
              <OptOut
                pullRequestNumber={pullRequest.number}
                repoNameWithOwner={`${repository.ownerLogin}/${repository.name}`}
              />
            </div>
          </PageLayout.Content>
        </PageLayout>
      </div>
    </>
  )
}
