import {type AnalyticsEvent, useClickAnalytics} from '@github-ui/use-analytics'
import {useCallback} from 'react'

/**
 * @param defaultPayload holds a set of properties that should be logged with every call to the returned function
 * @returns a function that logs a click event with the given properties payload
 */
export function useClickLogging({category, action, label, ...rest}: Partial<AnalyticsEvent> = {}): {
  logClick: (payload?: Partial<AnalyticsEvent>) => void
} {
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  // Using JSON.stringify as an easy way to check if the rest object is the same between calls
  const restJSON = JSON.stringify(rest)

  return {
    logClick: useCallback(
      (payload?: Partial<AnalyticsEvent>) => {
        sendClickAnalyticsEvent({category, action, label, ...rest, ...payload})
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [category, action, label, restJSON, sendClickAnalyticsEvent],
    ),
  }
}
