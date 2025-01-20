import {PageRenderer, session, setCSPTrustedTypesPolicy, setProgressBarDelay} from '@github/turbo'
import {formatKeyToError} from './utils'
import {turboPolicy} from '@github-ui/trusted-types-policies/turbo'

interface HeadSnapshot {
  detailsByOuterHTML: {
    [outerHTML: string]: {
      tracked: boolean
      elements: Element[]
    }
  }
}

setCSPTrustedTypesPolicy(turboPolicy)
setProgressBarDelay(0)

session.isVisitable = () => true

// get the reason why a Turbo request had to be reloaded so we can report metrics
const originalTrackedElementsAreIdentical = Object.getOwnPropertyDescriptor(PageRenderer.prototype, 'reloadReason')?.get
Object.defineProperty(PageRenderer.prototype, 'reloadReason', {
  get() {
    const reloadReason = originalTrackedElementsAreIdentical?.call(this)

    if (reloadReason.reason !== 'tracked_element_mismatch') {
      return reloadReason
    }

    const currentTracked = Object.fromEntries(getSnapshotSignatures(this.currentHeadSnapshot))
    const changedKeys = []

    for (const [key, value] of getSnapshotSignatures(this.newHeadSnapshot)) {
      if (currentTracked[key] !== value) {
        changedKeys.push(formatKeyToError(key))
      }
    }

    return {
      reason: `tracked_element_mismatch-${changedKeys.join('-')}`,
    }
  },
})

function* getSnapshotSignatures(snapshot: HeadSnapshot): IterableIterator<[string, string]> {
  for (const detail of Object.values(snapshot.detailsByOuterHTML)) {
    if (detail.tracked) {
      for (const element of detail.elements) {
        if (element instanceof HTMLMetaElement && element.getAttribute('http-equiv')) {
          yield [element.getAttribute('http-equiv') || '', element.getAttribute('content') || '']
        }
      }
    }
  }
}
