import {useEffect} from 'react'
import {graphql, useFragment} from 'react-relay'

import type {useEmitPageViewEvent_pullRequest$key} from './__generated__/useEmitPageViewEvent_pullRequest.graphql'
import {usePullRequestAnalytics} from './use-pull-request-analytics'

export function useEmitPageViewEvent(pullRequest: useEmitPageViewEvent_pullRequest$key) {
  const data = useFragment(
    graphql`
      fragment useEmitPageViewEvent_pullRequest on PullRequest
      @argumentDefinitions(endOid: {type: "String"}, startOid: {type: "String"}, singleCommitOid: {type: "String"}) {
        comparison(endOid: $endOid, startOid: $startOid, singleCommitOid: $singleCommitOid) {
          filesChanged
          linesChanged
        }
      }
    `,
    pullRequest,
  )

  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()
  useEffect(() => {
    sendPullRequestAnalyticsEvent('pull_request.viewed', 'PAGE_VIEW', {
      filesChanged: data.comparison?.filesChanged,
      linesChanged: data.comparison?.linesChanged,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
