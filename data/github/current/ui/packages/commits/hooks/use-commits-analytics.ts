import {type AnalyticsEvent, useAnalytics} from '@github-ui/use-analytics'
import {useCallback} from 'react'

import type {CommitsEventType, CommitsTargetType} from '../types/analytics-events-types'

type SendCommitsEventFunction = (
  eventType: CommitsEventType,
  target: CommitsTargetType,
  payload?: {[key: string]: unknown} | AnalyticsEvent,
) => void

/**
 * Hook used to send analytics events for commit actions
 */
export function useCommitsAnalytics(): {
  sendCommitAnalyticsEvent: SendCommitsEventFunction
} {
  const {sendAnalyticsEvent} = useAnalytics()
  return {
    sendCommitAnalyticsEvent: useCallback(
      (eventType, target, payload = {}) => {
        sendAnalyticsEvent(eventType, target, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}
