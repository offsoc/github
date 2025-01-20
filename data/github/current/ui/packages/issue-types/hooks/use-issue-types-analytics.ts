import {type AnalyticsEvent, useAnalytics} from '@github-ui/use-analytics'
import {useCallback} from 'react'

import type {IssueTypesEventType, IssueTypesTargetType} from '../types/analytics-event-types'

type SendIssueTypesEventFunction = (
  eventType: IssueTypesEventType,
  target: IssueTypesTargetType,
  payload?: {[key: string]: unknown} | AnalyticsEvent,
) => void

/**
 * Hook used to send analytics events for Issue Type actions
 */
export function useIssueTypesAnalytics(): {
  sendIssueTypesAnalyticsEvent: SendIssueTypesEventFunction
} {
  const {sendAnalyticsEvent} = useAnalytics()
  return {
    sendIssueTypesAnalyticsEvent: useCallback(
      (eventType, target, payload = {}) => {
        sendAnalyticsEvent(eventType, target, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}
