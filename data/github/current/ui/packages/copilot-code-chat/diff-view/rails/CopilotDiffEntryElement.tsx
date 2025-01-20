import {attr, controller, target} from '@github/catalyst'

/** Tracks all active (visible or near-visible) `CopilotDiffEntryElement` instances. */
class CopilotDiffEntryStore extends EventTarget {
  #entries: ReadonlySet<CopilotDiffEntryElement> = new Set()

  // lazily construct for SSR
  #_intersectionObserver?: IntersectionObserver
  get #intersectionObserver() {
    return (this.#_intersectionObserver ??= new IntersectionObserver(
      intersections => {
        const newEntries = new Set(this.#entries)
        let hasChanges = false // The flag avoids having to do a set equality check, which is O(n) when no changes

        for (const intersection of intersections) {
          const entry = intersection.target as CopilotDiffEntryElement

          if (intersection.isIntersecting && !newEntries.has(entry)) {
            newEntries.add(entry)
            hasChanges = true
          } else if (!intersection.isIntersecting && newEntries.has(entry)) {
            newEntries.delete(entry)
            hasChanges = true
          }
        }

        if (hasChanges) {
          // sometimes Turbo gets weird and the Catalyst lifecycle hooks don't work correctly
          // so check that all the entries are still in the document
          for (const entry of newEntries) {
            if (!document.contains(entry)) {
              newEntries.delete(entry)
            }
          }

          this.#entries = newEntries
          this.dispatchEvent(new Event('update'))
        }
      },
      {
        // margin of half screen size theoretically gives the request time to execute before the item is visible
        rootMargin: '50%',
      },
    ))
  }

  get entries() {
    return this.#entries
  }

  clear() {
    this.#entries = new Set()
  }

  connect(entry: CopilotDiffEntryElement) {
    this.#intersectionObserver.observe(entry)
  }

  disconnect(entry: CopilotDiffEntryElement) {
    this.#intersectionObserver.unobserve(entry)
  }
}

@controller
export class CopilotDiffEntryElement extends HTMLElement {
  static readonly store = new CopilotDiffEntryStore()

  @attr filePath = ''
  @attr disabled = false

  @target menuItemsSlot: HTMLElement | undefined

  connectedCallback() {
    // On page navigation the React app doesn't always clean up properly, and if we then navigate back with back/forward,
    // the HTML gets restored and these can load with children inside them. Then the portal appends to the container, causing
    // items to appear more than once. So we clear the slot first.
    this.menuItemsSlot?.replaceChildren()
    CopilotDiffEntryElement.store.connect(this)
  }

  disconnectedCallback() {
    CopilotDiffEntryElement.store.disconnect(this)
  }
}
