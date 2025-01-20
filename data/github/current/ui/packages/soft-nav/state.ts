import {SOFT_NAV_STATE} from './states'
import {
  SoftNavEndEvent,
  SoftNavErrorEvent,
  type SoftNavMechanism,
  SoftNavStartEvent,
  SoftNavSuccessEvent,
} from './events'
import {markStart, sendFailureStats, sendRenderStats} from './stats'
import {
  clearSoftNav,
  getSoftNavFailReason,
  getSoftNavMechanism,
  setSoftNavMechanism,
  unsetSoftNav,
  setSoftNavReferrer,
  setSoftNavReactAppName,
  inSoftNav,
  getCurrentReactAppName,
  DEFAULT_SOFT_NAV_ERROR_REASON,
  setLatestMechanism,
} from './utils'

interface SoftNavOptions {
  skipIfGoingToReactApp?: boolean
  allowedMechanisms?: SoftNavMechanism[]
}

let visitCount = 0

export function initSoftNav() {
  visitCount = 0
  document.dispatchEvent(new Event(SOFT_NAV_STATE.INITIAL))

  clearSoftNav()
}

export function startSoftNav(mechanism: SoftNavMechanism) {
  if (inSoftNav()) return

  startProgressBar()
  document.dispatchEvent(new SoftNavStartEvent(mechanism))

  setSoftNavMechanism(mechanism)
  setSoftNavReactAppName()
  setSoftNavReferrer()
  markStart()
}

export function succeedSoftNav(options: SoftNavOptions = {}) {
  if (!canTriggerEvent(options)) return

  visitCount += 1

  document.dispatchEvent(new SoftNavSuccessEvent(getSoftNavMechanism(), visitCount))
  endSoftNav(options)
}

export function failSoftNav(options: SoftNavOptions = {}) {
  if (!canTriggerEvent(options)) return

  visitCount = 0
  const reason = getSoftNavFailReason() || DEFAULT_SOFT_NAV_ERROR_REASON
  document.dispatchEvent(new SoftNavErrorEvent(getSoftNavMechanism(), reason))

  endProgressBar()
  sendFailureStats(reason)
  clearSoftNav()
}

export function endSoftNav(options: SoftNavOptions = {}) {
  if (!canTriggerEvent(options)) return

  const mechanism = getSoftNavMechanism()
  endProgressBar()
  document.dispatchEvent(new SoftNavEndEvent(mechanism))

  unsetSoftNav()
  setLatestMechanism(mechanism)
}

export function renderedSoftNav(options: SoftNavOptions = {}) {
  if (!canTriggerEvent(options)) return

  sendRenderStats()
  document.dispatchEvent(new Event(SOFT_NAV_STATE.RENDER))
}

export function updateFrame() {
  document.dispatchEvent(new Event(SOFT_NAV_STATE.FRAME_UPDATE))
}

function startProgressBar() {
  document.dispatchEvent(new Event(SOFT_NAV_STATE.PROGRESS_BAR.START))
}

function endProgressBar() {
  document.dispatchEvent(new Event(SOFT_NAV_STATE.PROGRESS_BAR.END))
}

function canTriggerEvent({skipIfGoingToReactApp, allowedMechanisms = []}: SoftNavOptions = {}) {
  return (
    inSoftNav() &&
    (allowedMechanisms.length === 0 || allowedMechanisms.includes(getSoftNavMechanism())) &&
    (!skipIfGoingToReactApp || !getCurrentReactAppName())
  )
}
