import {AnalyticsClient, getOptionsFromMeta} from '@github/hydro-analytics-client'
import type {Context} from '@github/hydro-analytics-client'
import safeStorage from '@github-ui/safe-storage'
import {isStaff} from '@github-ui/stats'
const {getItem} = safeStorage('localStorage')

declare const process: {
  env: {
    NODE_ENV: string
  }
}

const dimensionPrefix = 'dimension_'
let hydroAnalyticsClient: AnalyticsClient | undefined

const MARKETING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'scid']

try {
  const options = getOptionsFromMeta('octolytics')

  // Remove the base context because meta tags can change as the user navigates with Turbo
  // These will be folded in for each event & page view
  delete options.baseContext

  hydroAnalyticsClient = new AnalyticsClient(options)
} catch (_) {
  // Failed to get options from meta tags.  This most likely means analytics are disabled.
}

function extendBaseContext(context?: Context) {
  const baseContext = getOptionsFromMeta('octolytics').baseContext || {}

  if (baseContext) {
    delete baseContext.app_id
    delete baseContext.event_url
    delete baseContext.host

    for (const [key, value] of Object.entries(baseContext)) {
      // some octolytics meta tags are prefixed with dimension-, which we don't need with the new hydro-analytics-client
      if (key.startsWith(dimensionPrefix)) {
        baseContext[key.replace(dimensionPrefix, '')] = value
        delete baseContext[key]
      }
    }
  }

  const visitorMeta = document.querySelector<HTMLMetaElement>('meta[name=visitor-payload]')
  if (visitorMeta) {
    const visitorHash = JSON.parse(atob(visitorMeta.content))
    Object.assign(baseContext, visitorHash)
  }

  const urlParams = new URLSearchParams(window.location.search)
  for (const [key, value] of urlParams) {
    if (MARKETING_PARAMS.includes(key.toLowerCase())) {
      baseContext[key] = value
    }
  }

  // Include additional context from the page
  baseContext.staff = isStaff().toString()

  return Object.assign(baseContext, context)
}

export function sendPageView(context?: Context) {
  hydroAnalyticsClient?.sendPageView(extendBaseContext(context))
}

export function sendEvent(type: string, context: Record<string, string | number | boolean | undefined | null> = {}) {
  const service = document.head?.querySelector<HTMLMetaElement>('meta[name="current-catalog-service"]')?.content

  const cleanContext: Context = service ? {service} : {}

  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null) {
      cleanContext[key] = `${value}`
    }
  }

  if (hydroAnalyticsClient) {
    const typeWithFallback = type || 'unknown'
    const fullContext = extendBaseContext(cleanContext)
    hydroAnalyticsClient.sendEvent(typeWithFallback, extendBaseContext(cleanContext))

    if (process.env.NODE_ENV === 'development') {
      debugSendEvent(typeWithFallback, fullContext)
    }
  }
}

export function stringifyObjectValues(obj: object) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, JSON.stringify(v)]))
}

function debugSendEvent(type: string, context: Context) {
  if (getItem('hydro-debug.send-event') === 'true') {
    // eslint-disable-next-line no-console
    console.group('[hydro-debug.send-event]')
    // eslint-disable-next-line no-console
    console.log({type, context})
    // eslint-disable-next-line no-console
    console.groupEnd()
  }
}
