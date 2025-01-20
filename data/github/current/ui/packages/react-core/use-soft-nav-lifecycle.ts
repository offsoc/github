import type {Location} from 'react-router-dom'
import type {PageError} from './app-routing-types'
import {useEffect, useRef} from 'react'
import {sendStats} from '@github-ui/stats'
import {sendPageView} from '@github-ui/hydro-analytics'
import {inSoftNav} from '@github-ui/soft-nav/utils'
import {failSoftNav, renderedSoftNav, succeedSoftNav} from '@github-ui/soft-nav/state'

export const useSoftNavLifecycle = (
  location: Location,
  isLoading: boolean,
  error: PageError | null,
  reactAppName: string,
) => {
  // Send page view analytics when the route changes
  useEffect(() => {
    if (isLoading) {
      // we don't want to send the page view until the page is done loading
      return
    }

    // location.key is used to trigger this effect when it changes, but is not used in the effect
    void location.key

    // Note: this will cause a duplicate page view stat on the initial page load.  Another will be sent
    // _without the app name_ when turbo finishes loading in hydro-analytics-pageview.ts
    // Note: sendPageView will pull the current location from the window.location
    // Depending on changes we make to this file, it's possible we could trigger this at a point when the href is not
    // aligned with what react currently has rendered to the page.  We may eventually want to add an override option
    // to pass in the href we have here.
    sendPageView({
      react_app: reactAppName,
    })
  }, [reactAppName, location.key, isLoading])

  const lastRecordedKey = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!isLoading && (lastRecordedKey.current === undefined || lastRecordedKey.current !== location.key)) {
      // At this point, React is done rendering, so we can end the navigation
      if (inSoftNav()) {
        finishSoftNav(error)
      } else {
        finishHardNav(error)
      }

      lastRecordedKey.current = location.key
    }
  }, [location.key, isLoading, error])
}

const finishSoftNav = (error: PageError | null) => {
  if (error) {
    failSoftNav()
  } else {
    renderedSoftNav()
    succeedSoftNav()
  }
}

const finishHardNav = (error: PageError | null) => {
  // We don't want to measure pages with errors.
  if (error) return

  const navDuration = getReactNavDuration()

  if (!navDuration) return

  sendStats({
    requestUrl: window.location.href,
    distributionKey: 'REACT_NAV_DURATION',
    distributionValue: Math.round(navDuration),
    distributionTags: ['REACT_NAV_HARD'],
  })
}

const reactNavDurationStat = 'react_nav_duration'
function getReactNavDuration() {
  window.performance.measure(reactNavDurationStat)
  const measures = window.performance.getEntriesByName(reactNavDurationStat)
  const measure = measures.pop()
  return measure ? measure.duration : null
}
