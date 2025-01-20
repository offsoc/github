import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {ssrSafeDocument, ssrSafeWindow} from '@github-ui/ssr-utils'
import type {INPMetric} from './metric'
import {InteractionProcessor} from './interaction-processor'

const supportsINP =
  // eslint-disable-next-line compat/compat
  ssrSafeWindow && 'PerformanceEventTiming' in ssrSafeWindow && 'interactionId' in PerformanceEventTiming.prototype

type INPCallback = (inp: INPMetric, opts: {url?: string}) => void

/*
 * The INPObserver is responsible for listening to Performance events and routing them to the InteractionProcessor.
 * It also manages resetting INP and reporting it when navigating or hiding a page.
 */
export class INPObserver {
  cb: INPCallback
  interactionProcessor: InteractionProcessor
  observer?: PerformanceObserver
  url?: string

  constructor(cb: INPCallback) {
    this.cb = cb
    this.interactionProcessor = new InteractionProcessor()
    this.setupListeners()
  }

  setupListeners() {
    if (!supportsINP) return

    const onHiddenOrPageHide = (event: Event) => {
      if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
        this.report()
      }
    }

    // Similar to web-vitals, we report the current INP when hard navigating or
    // when the page is hidden
    ssrSafeDocument?.addEventListener('visibilitychange', onHiddenOrPageHide, true)
    ssrSafeDocument?.addEventListener('pagehide', onHiddenOrPageHide, true)

    // SOFT_NAV_STATE.RENDER is dispatched when the soft navigation finished rendering.
    // That means that the previous page is fully hidden so we can stop listening for its events.
    ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.RENDER, () => {
      this.report()
      this.reset()
    })
  }

  observe(initialLoad = true) {
    if (!supportsINP) return

    this.url = ssrSafeWindow?.location.href
    this.observer = new PerformanceObserver(list => {
      this.interactionProcessor.processEntries(list.getEntries() as PerformanceEventTiming[])
    })

    this.observer.observe({type: 'first-input', buffered: initialLoad})
    this.observer.observe({
      type: 'event',
      // threshold set by web-vitals library
      durationThreshold: 40,
      // buffered events are important on first page load since we may have missed
      // a few until the observer was set up.
      buffered: initialLoad,
    })
  }

  report() {
    this.cb(this.interactionProcessor.inp, {url: this.url})
  }

  teardown() {
    this.observer?.takeRecords()
    this.observer?.disconnect()
  }

  reset() {
    this.teardown()
    this.interactionProcessor.teardown()
    this.interactionProcessor = new InteractionProcessor()
    this.observe(false)
  }
}
