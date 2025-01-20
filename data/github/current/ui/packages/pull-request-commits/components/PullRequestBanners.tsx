import type {HeaderPageData} from '../page-data/payloads/header'
import {PullRequestPausedDependabotBanner} from './banners/PullRequestPausedDependabotBanner'
import {PullRequestHiddenCharactersBanner} from './banners/PullRequestHiddenCharactersBanner'

export function PullRequestBanners({bannersData, pullRequest, repository}: Omit<HeaderPageData, 'urls' | 'user'>) {
  return (
    <>
      {bannersData.banners.hiddenCharacterWarning.render && (
        <PullRequestHiddenCharactersBanner pullRequest={pullRequest} />
      )}
      {bannersData.banners.pausedDependabotUpdate.render && (
        <PullRequestPausedDependabotBanner repository={repository} />
      )}
    </>
  )
}
