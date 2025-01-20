import {setDocumentAttributesCache} from './cache'
import {markTurboHasLoaded} from './utils'
import {beginProgressBar, completeProgressBar} from './progress-bar'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {hasSoftNavFailure, inSoftNav, setSoftNavFailReason, setSoftNavMechanism} from '@github-ui/soft-nav/utils'
import {endSoftNav, failSoftNav, initSoftNav, renderedSoftNav, succeedSoftNav} from '@github-ui/soft-nav/state'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

// In case this event is triggered, it means we are in a Frame navigation, so we update the mechanism (if needed).
ssrSafeDocument?.addEventListener('turbo:frame-load', event => {
  // When going to a React page, there is a chance that the soft-nav end event finishes before the frame-load event.
  // In that case, we don't want to start a new soft-nav event here, so we'll skip this if the soft-nav has already ended.
  if (inSoftNav()) setSoftNavMechanism('turbo.frame')
  // When navigating using frames, we either render here, or wait for the react-app to render.
  renderedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo.frame']})

  if (!(event.target instanceof HTMLElement)) return

  if (event.target.getAttribute('data-turbo-action') !== 'advance') {
    // If we are not navigating to a new page, Turbo won't fire a `turbo:load` event, so we need to end the soft-nav here.
    succeedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo.frame']})
  }
})

// Turbo navigations should end here, unless we are navigating to a React app. In that case, React itself will
// end the navigation, since Turbo doesn't know when React is done rendering.
ssrSafeDocument?.addEventListener('turbo:load', event => {
  markTurboHasLoaded()
  const isHardLoad = Object.keys((event as CustomEvent).detail.timing).length === 0

  if (inSoftNav() && !isHardLoad && !hasSoftNavFailure()) {
    // When navigating using drive, we either render here, or wait for the react-app to render.
    renderedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo']})
    // If going to a react app, we let React succeed the soft-nav.
    succeedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo', 'turbo.frame']})
  } else if (isHardLoad && (hasSoftNavFailure() || inSoftNav())) {
    // If going to a react app, we let React fail the soft-nav.
    failSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo', 'turbo.frame']})
  } else if (isHardLoad) {
    initSoftNav()
  }
})

ssrSafeDocument?.addEventListener('beforeunload', () => endSoftNav())

// Set the failure reason when we get a reload
ssrSafeDocument?.addEventListener('turbo:reload', function (event) {
  if (!(event instanceof CustomEvent)) return

  setSoftNavFailReason(event.detail.reason)
})

ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.END, setDocumentAttributesCache)

ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.PROGRESS_BAR.START, beginProgressBar)
ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.PROGRESS_BAR.END, completeProgressBar)
