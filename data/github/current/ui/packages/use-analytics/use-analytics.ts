import {useCallback, useContext} from 'react'
import {sendEvent} from '@github-ui/hydro-analytics'
import {AnalyticsContext} from '@github-ui/analytics-provider/context'

export interface AnalyticsEvent {
  category: string
  action: string
  label: string
  [key: string]: unknown
}

type SendAnalyticsEventFunction = (
  eventType: string,
  target?: string,
  payload?: {[key: string]: unknown} | AnalyticsEvent,
) => void

/**
 * Use this hook with the AnalyticsContext to send user analytics events to the data warehouse.
 * This hook will read values from the nearest AnalyticsContext.Provider, though you can override properties directly when sending an event.
 * It uses the `sendEvent` helper from `github/hydro-analytics`,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 *
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendAnalyticsEvent } = useAnalytics()
 *   return <Button onClick={() => sendAnalyticsEvent('file_tree.close', 'FILE_TREE_TOGGLE')}>CLOSE TREE</Button>
 * }
 * ```
 *
 */
export function useAnalytics(): {
  sendAnalyticsEvent: SendAnalyticsEventFunction
} {
  // WARNING: Do not add any hooks here that will cause rerenders on soft navs.
  const contextData = useContext(AnalyticsContext)

  if (!contextData) {
    throw new Error('useAnalytics must be used within an AnalyticsContext')
  }
  const {appName, category, metadata} = contextData

  return {
    sendAnalyticsEvent: useCallback(
      (eventType, target?, payload = {}) => {
        const context = {
          react: true,
          ['app_name']: appName,
          category,
          ...metadata,
        }
        sendEvent(eventType, {...context, ...payload, target})
      },
      [appName, category, metadata],
    ),
  }
}

/**
 * Use this hook with the AnalyticsContext to send user analytics events to the data warehouse.
 * This hook will read values from the nearest AnalyticsContext.Provider, though you can override properties directly when sending an event.
 * It uses the `sendEvent` helper from `github/hydro-analytics`,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 *
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendClickAnalyticsEvent } = useClickAnalytics()
 *   return <Button onClick={() => sendClickAnalyticsEvent({category: '...', action: '...', label: '...'})}>Submit</Button>
 * }
 * ```
 *
 */
export function useClickAnalytics(): {
  sendClickAnalyticsEvent: (payload?: {[key: string]: unknown} | AnalyticsEvent) => void
} {
  const {sendAnalyticsEvent} = useAnalytics()
  return {
    sendClickAnalyticsEvent: useCallback(
      (payload = {}) => {
        sendAnalyticsEvent('analytics.click', undefined, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}
