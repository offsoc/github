import {onCLS, onFCP, onFID, onLCP, onTTFB, onINP} from 'web-vitals/attribution'
import {sendSoftVitals, sendTimingResults, sendVitals} from './timing-stats'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {resetHPC} from './hpc'
import {INPObserver} from './inp/observer'
import {isFeatureEnabled} from '@github-ui/feature-flags'

export function setupWebVitals() {
  const useCustomINP = isFeatureEnabled('custom_inp')

  sendTimingResults()
  onCLS(sendVitals)
  onFCP(sendVitals)
  onFID(sendVitals)
  onLCP(sendVitals)
  onTTFB(sendVitals)

  onLCP(sendSoftVitals, {reportSoftNavs: true})
  onCLS(sendSoftVitals, {reportSoftNavs: true})

  if (useCustomINP) {
    const inpObserver = new INPObserver(sendVitals)
    inpObserver.observe()
  } else {
    onINP(sendVitals)
  }

  // Any time we trigger a new soft navigation, we want to reset HPC.
  ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, ({mechanism}) => {
    resetHPC({soft: true, mechanism})
  })

  // Start HPC at page load.
  resetHPC({soft: false})
}
