import {type AnalyticsEvent, useAnalytics} from '@github-ui/use-analytics'
import {useCallback} from 'react'

import type {HyperlistEventType, HyperlistTargetType} from '../types/analytics-event-types'

type SendHyperlistsEventFunction = (
  eventType: HyperlistEventType,
  target: HyperlistTargetType,
  payload?: {[key: string]: unknown} | AnalyticsEvent,
) => void

/**
 * Hook used to send analytics events for hyperlist actions
 */
export function useHyperlistAnalytics(): {
  sendHyperlistAnalyticsEvent: SendHyperlistsEventFunction
} {
  const {sendAnalyticsEvent} = useAnalytics()
  return {
    sendHyperlistAnalyticsEvent: useCallback(
      (eventType, target, payload = {}) => {
        sendAnalyticsEvent(eventType, target, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}
