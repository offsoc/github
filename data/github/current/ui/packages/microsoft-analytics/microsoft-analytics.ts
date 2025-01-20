import {getPreferencesFromCookie, CONSENT_COOKIE_NAME} from '@github-ui/cookie-consent'
import {Deferred} from '@github-ui/deferred'
import {gpcDisabled} from '@github-ui/do-not-track'

import Analytics from './ms.analytics-web'

const INSTRUMENTATION_KEY = 'b588e12fde784edfbd5ba42a17219be0-c9e70b20-6770-476b-8e75-5292a6fd04e2-7448'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const analyticsExports = Analytics as any
export const ApplicationInsights = analyticsExports.ApplicationInsights
const microsoftAnalytics = new ApplicationInsights()

const config = {
  instrumentationKey: INSTRUMENTATION_KEY,
  propertyConfiguration: {
    cookieDomain: 'github.com',
    userConsentCookieName: CONSENT_COOKIE_NAME,
    gpcDataSharingOptIn: gpcDisabled(),
    callback: {
      userConsentDetails: () => getPreferencesFromCookie(),
    },
  },
  webAnalyticsConfiguration: {
    urlCollectHash: true,
    urlCollectQuery: true,
  },
}

const isInitializedDeferred = new Deferred<boolean>()

export function waitForInitialization(): Promise<boolean> {
  return isInitializedDeferred.promise
}

export function initializeAnalytics() {
  microsoftAnalytics.initialize(config, [])
  isInitializedDeferred.resolve(microsoftAnalytics.isInitialized())
}

export type PageActionEventType = {
  behavior: number
  name: string
  uri: string
  properties: {
    [name: string]: string | number | boolean | string[] | number[] | boolean[] | object
  }
}

export type PageActionPropertiesType = {
  refUri: string
}

export function trackPageAction(pageActionEvent: PageActionEventType, pageActionProperties: PageActionPropertiesType) {
  if (!microsoftAnalytics.isInitialized()) {
    return
  }

  microsoftAnalytics.trackPageAction(pageActionEvent, pageActionProperties)
}
