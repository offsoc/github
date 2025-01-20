// Based on https://github.com/GoogleChrome/web-vitals/blob/7b44bea0d5ba6629c5fd34c3a09cc683077871d0/src/lib/polyfills/interactionCountPolyfill.ts
declare global {
  interface Performance {
    interactionCount: number
  }
}

/*
 * The InteractionCountObserver tracks the number of interactions that have occurred on the page. This
 * is used to estimate INP's p98 value.
 */
export class InteractionCountObserver {
  interactionCountEstimate = 0
  minKnownInteractionId = Infinity
  maxKnownInteractionId = 0
  observer?: PerformanceObserver

  get interactionCount() {
    return this.observer ? this.interactionCountEstimate : performance.interactionCount || 0
  }

  teardown() {
    if (this.observer) {
      // take the records so a new observer will start empty
      this.observer.takeRecords()
      this.observer.disconnect()
      this.observer = undefined
    }
  }

  // from https://github.com/GoogleChrome/web-vitals/blob/7b44bea0d5ba6629c5fd34c3a09cc683077871d0/src/lib/polyfills/interactionCountPolyfill.ts#L29-L40
  updateEstimate = (entries: PerformanceEventTiming[]) => {
    for (const e of entries) {
      if (e.interactionId) {
        this.minKnownInteractionId = Math.min(this.minKnownInteractionId, e.interactionId)
        this.maxKnownInteractionId = Math.max(this.maxKnownInteractionId, e.interactionId)

        this.interactionCountEstimate = this.maxKnownInteractionId
          ? (this.maxKnownInteractionId - this.minKnownInteractionId) / 7 + 1
          : 0
      }
    }
  }

  observe() {
    if ('interactionCount' in performance || this.observer) return

    this.observer = new PerformanceObserver(async list => {
      // Delay by a microtask to workaround a bug in Safari where the
      // callback is invoked immediately, rather than in a separate task.
      // See: https://github.com/GoogleChrome/web-vitals/issues/277
      await Promise.resolve()

      this.updateEstimate(list.getEntries() as PerformanceEventTiming[])
    })

    this.observer.observe({
      type: 'event',
      buffered: true,
      durationThreshold: 0,
    })
  }
}
