import {getItem, removeItem, setItem} from '@github-ui/safe-storage/session-storage'
import type {SoftNavMechanism} from './events'

export const DEFAULT_SOFT_NAV_ERROR_REASON = 'reload'

export const SOFT_NAV_FAIL = 'soft-nav:fail'
export const SOFT_NAV_FAIL_REFERRER = 'soft-nav:fail-referrer'
export const SOFT_NAV_REFERRER = 'soft-nav:referrer'
export const SOFT_NAV_MARK = 'soft-nav:marker'
export const SOFT_NAV_REACT_APP_NAME = 'soft-nav:react-app-name'
export const SOFT_NAV_LATEST_MECHANISM = 'soft-nav:latest-mechanism'

export function clearSoftNav() {
  setItem(SOFT_NAV_MARK, '0')
  removeItem(SOFT_NAV_REFERRER)
  removeItem(SOFT_NAV_FAIL)
  removeItem(SOFT_NAV_FAIL_REFERRER)
  removeItem(SOFT_NAV_REACT_APP_NAME)
  removeItem(SOFT_NAV_LATEST_MECHANISM)
}

export function setSoftNavMechanism(mechanism: SoftNavMechanism) {
  setItem(SOFT_NAV_MARK, mechanism)
}

export function unsetSoftNav() {
  setItem(SOFT_NAV_MARK, '0')
}

export function inSoftNav() {
  const softNav = getItem(SOFT_NAV_MARK)
  return softNav && softNav !== '0'
}

export function getSoftNavMechanism(): SoftNavMechanism {
  return getItem(SOFT_NAV_MARK) as SoftNavMechanism
}

export function hasSoftNavFailure() {
  return Boolean(getSoftNavFailReason())
}

export function getSoftNavFailReason() {
  return getItem(SOFT_NAV_FAIL)
}

export function setSoftNavFailReason(reason: string) {
  setItem(SOFT_NAV_FAIL, reason || DEFAULT_SOFT_NAV_ERROR_REASON)
  setItem(SOFT_NAV_FAIL_REFERRER, window.location.href)
}

export function setSoftNavReferrer() {
  setItem(SOFT_NAV_REFERRER, window.location.href)
}

export function getSoftNavReferrer() {
  return getItem(SOFT_NAV_REFERRER) || document.referrer
}

export function setSoftNavReactAppName() {
  const appName = getCurrentReactAppName()

  if (appName) {
    setItem(SOFT_NAV_REACT_APP_NAME, appName)
  } else {
    removeItem(SOFT_NAV_REACT_APP_NAME)
  }
}

export function getSoftNavReactAppName() {
  return getItem(SOFT_NAV_REACT_APP_NAME)
}

export function getCurrentReactAppName() {
  if (document.querySelector('meta[name="ui"]')) return 'ui'

  return document.querySelector('react-app')?.getAttribute('app-name')
}

export function setLatestMechanism(mechanism: SoftNavMechanism) {
  setItem(SOFT_NAV_LATEST_MECHANISM, mechanism)
}

export function getLatestMechanism() {
  return getItem(SOFT_NAV_LATEST_MECHANISM) as SoftNavMechanism
}
