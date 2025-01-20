import {updateContent} from '@github-ui/updatable-content'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {BatchedUpdatableContent} from './updatable-content-batcher'

const MINIMUM_INTERVAL = 1000

const batcher = new BatchedUpdatableContent()

ssrSafeWindow?.addEventListener(SOFT_NAV_STATE.END, batcher.clear)

export function makeSocketMessageHandler(updaterFunction: typeof updateContent = updateContent) {
  return function handleSocketMessage(event: Event) {
    const {gid, wait, event_updates} = (event as CustomEvent).detail.data
    const container = event.target as HTMLElement
    const target = gid ? findByGid(container, gid) : container

    /**
     * TODO: Ideally we'd have a better unique identifier to use to enable better scheduling. We'd have to introduce
     * a DOM attribute to give a unique identifier.
     */
    if (target) {
      const batched = target.getAttribute('data-batched')

      const eventName = target.getAttribute('data-channel-event-name')
      if (eventName) {
        // If the event name is not in the event updates, we don't need to update the content.
        if (event_updates === undefined || !event_updates.hasOwnProperty(eventName)) {
          return
        }
      }

      if (batched) {
        const windowSize = Math.max(parseInt(batched) || 0, MINIMUM_INTERVAL)
        batcher.onEvent(target, windowSize, updaterFunction)
      } else {
        setTimeout(updaterFunction, wait || 0, target)
      }
    }
  }
}

function findByGid(root: HTMLElement, gid: string): HTMLElement | null {
  if (root.getAttribute('data-gid') === gid) return root
  for (const el of root.querySelectorAll<HTMLElement>(`[data-url][data-gid]`)) {
    if (el.getAttribute('data-gid') === gid) {
      return el
    }
  }
  return null
}
