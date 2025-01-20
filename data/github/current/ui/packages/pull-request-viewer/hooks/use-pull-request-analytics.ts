import type {AnalyticsEvent} from '@github-ui/use-analytics'
import {useAnalytics} from '@github-ui/use-analytics'
import {useCallback} from 'react'

import type {PullRequestsEventType, PullRequestsTargetType} from '../types/analytics-events-types'

type SendPullRequestsEventFunction = (
  eventType: PullRequestsEventType,
  target: PullRequestsTargetType,
  payload?: {[key: string]: unknown} | AnalyticsEvent,
) => void

/**
 * Hook used to send analytics events for pull request actions
 */
export function usePullRequestAnalytics(): {
  sendPullRequestAnalyticsEvent: SendPullRequestsEventFunction
} {
  const {sendAnalyticsEvent} = useAnalytics()
  return {
    sendPullRequestAnalyticsEvent: useCallback(
      (eventType, target, payload = {}) => {
        sendAnalyticsEvent(eventType, target, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}
