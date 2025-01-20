import {sendStats} from '@github-ui/stats'
import {getCurrentReactAppName, getSoftNavMechanism, getSoftNavReactAppName, getSoftNavReferrer} from './utils'
import type {SoftNavMechanism} from './events'

export const SOFT_NAV_DURATION_MARK = 'stats:soft-nav-duration'
export const MECHANISM_MAPPING: Record<SoftNavMechanism | 'ui' | 'hard', PlatformBrowserSoftNavigationMechanism> = {
  turbo: 'TURBO',
  react: 'REACT',
  'turbo.frame': 'FRAME',
  ui: 'UI',
  hard: 'HARD',
}
export function markStart() {
  // browswers only record the first ~150 resources
  // clearing it here provides room to track additional resources loaded during the soft-nav
  performance.clearResourceTimings()
  performance.mark(SOFT_NAV_DURATION_MARK)
}

function getDurationSinceLastSoftNav() {
  if (performance.getEntriesByName(SOFT_NAV_DURATION_MARK).length === 0) {
    return null
  }

  performance.measure(SOFT_NAV_DURATION_MARK, SOFT_NAV_DURATION_MARK)
  const measures = performance.getEntriesByName(SOFT_NAV_DURATION_MARK)
  const measure = measures.pop()
  return measure ? measure.duration : null
}

export function sendFailureStats(turboFailureReason: string) {
  sendStats({
    turboFailureReason,
    turboStartUrl: getSoftNavReferrer(),
    turboEndUrl: window.location.href,
  })
}

export function sendRenderStats() {
  const duration = getDurationSinceLastSoftNav()

  if (!duration) return

  const mechanism = MECHANISM_MAPPING[getSoftNavMechanism()]
  const roundedDuration = Math.round(duration)

  if (mechanism === MECHANISM_MAPPING.react)
    document.dispatchEvent(new CustomEvent('staffbar-update', {detail: {duration: roundedDuration}}))

  sendStats({
    requestUrl: window.location.href,
    softNavigationTiming: {
      mechanism,
      destination: getCurrentReactAppName() || 'rails',
      duration: roundedDuration,
      initiator: getSoftNavReactAppName() || 'rails',
    },
  })
}
