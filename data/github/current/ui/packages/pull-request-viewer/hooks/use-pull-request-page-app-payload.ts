import type {CopilotPrReviewBannerProps} from '@github-ui/copilot-pr-review-banner'
import type {MergeMethod} from '@github-ui/mergebox/types'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'

export interface CopilotPreReviewBannerPayload
  extends Pick<
    CopilotPrReviewBannerProps,
    'analyticsPath' | 'apiURL' | 'ssoOrganizations' | 'threadName' | 'signedWebsocketChannel'
  > {}

interface PullRequestPageAppPayload {
  tracing: boolean
  tracing_flamegraph: boolean
  refListCacheKey: string
  helpUrl: string
  feedbackUrl: string
  pullRequest: {
    defaultMergeMethod: MergeMethod
    headRefOid: string
    basePageDataUrl: string
  }
  current_user_settings: {
    use_single_key_shortcut: boolean
  }
  ghostUser: {
    displayName: string
    login: string
    avatarUrl: string
    path: string
    url: string
  }
  copilotPreReviewBannerPayload?: CopilotPreReviewBannerPayload
  hadronEditorEnabled?: boolean
}

const defaultDocsUrl = 'https://docs.github.com'
/**
 * Hook used to reference data from the pull request app's JSON payload
 * This app should minimize usage of this payload since we're using Relay, but there are a few pieces of data we seed.
 */
export default function usePullRequestPageAppPayload(): PullRequestPageAppPayload {
  const {helpUrl = defaultDocsUrl, ...rest} = useAppPayload<PullRequestPageAppPayload>()
  return {helpUrl, ...rest}
}
