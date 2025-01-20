import type {updateContent} from '@github-ui/updatable-content'

export class BatchedUpdatableContent {
  intervals: {
    [key: number]: {
      interval: NodeJS.Timer | null
      targets: Set<HTMLElement>
    }
  } = {}

  // Append each websocket update to the batch.
  onEvent(target: HTMLElement, windowSize: number, updaterFunction: typeof updateContent) {
    let config = this.intervals[windowSize]

    if (!config) {
      config = this.intervals[windowSize] = {
        interval: null,
        targets: new Set(),
      }
    }

    config.targets.add(target)

    // Early return if we've already started.
    if (config.interval) return

    const fn = () => this.onInterval(windowSize, updaterFunction)

    // Start the interval loop if it hasn't been started yet.
    config.interval = setInterval(fn, windowSize)
  }

  // Function run on the interval run.
  onInterval = (windowSize: number, updaterFunction: typeof updateContent) => {
    // Move the reference.
    const config = this.intervals[windowSize]

    if (!config) return

    const targets = config.targets

    if (targets.size === 0) return

    // Clear the set so new messages can be batched up for the next iteration.
    config.targets = new Set()

    // Dispatch all queued updates.
    for (const target of targets) {
      // Only execute if we're attached to the DOM.
      if (document.body.contains(target)) {
        updaterFunction(target)
      }
    }

    // Clear references.
    targets.clear()
  }

  // Clear the buffer so that intervals are not run after turbolinks navigations.
  clear = () => {
    for (const key in this.intervals) {
      if (Object.prototype.hasOwnProperty.call(this.intervals, key)) {
        const config = this.intervals[key]
        if (config) {
          // Stop the interval.
          if (config.interval) {
            clearInterval(config.interval)
            config.interval = null
          }

          config.targets.clear()
        }
      }
    }
  }
}
