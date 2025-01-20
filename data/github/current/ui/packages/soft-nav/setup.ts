import {announce} from '@github-ui/aria-live'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {SOFT_NAV_EXTERNAL_EVENTS} from './external'
import {failSoftNav, initSoftNav, renderedSoftNav, startSoftNav, succeedSoftNav} from './state'
import {SOFT_NAV_STATE} from './states'

export function setup() {
  /** Ensure that when a turbo drive navigation happens, the page title is announced */
  ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.SUCCESS, function (event) {
    if (event.mechanism === 'turbo') {
      announce(`${document.title}`)
    }
  })

  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.INITIAL, initSoftNav)

  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.START, e => {
    startSoftNav((e as CustomEvent).detail.mechanism)
  })

  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.SUCCESS, () => succeedSoftNav())
  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.ERROR, () => failSoftNav())
  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.RENDER, () => renderedSoftNav())
}
