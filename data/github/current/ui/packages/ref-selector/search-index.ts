import safeStorage from '@github-ui/safe-storage'
import {sendStats} from '@github-ui/stats'

const {getItem, setItem, removeItem} = safeStorage('localStorage', {throwQuotaErrorsOnSet: true})

export enum RefType {
  Branch = 'branch',
  Tag = 'tag',
}

// the SearchIndex needs to be able to tell the element that owns it to
// re-render, so it holds a reference to it and just calls render().  This is
// the minimal interface for an object which owns a SearchIndex.
export interface Renderer {
  render(): void
}

// The shape of a response from refs_branch_list_path, and of the payload we
// store in localstorage.
interface RefResponse {
  refs: string[]
  cacheKey: string // an opaque string representing the freshness of the ref list
}

// Stores a list of refs for local search with remote backfill.
export class SearchIndex {
  refType: RefType

  // A reference to the parent RefSelectorElement
  selector: Renderer

  // The items we have in memory.
  knownItems: string[] = []

  // items in knownItems matching the current query
  currentSearchResult: string[] = []

  // does the current search match an item exactly?
  exactMatchFound = false

  // The string currently being used to search
  searchTerm = ''

  // URL to retrieve ref data from
  refEndpoint: string

  // A key used to represent the freshness of any given (possibly partial) list of refs.
  cacheKey: string

  // NWO for the repo on this page
  nameWithOwner: string

  // State flags
  isLoading = true
  fetchInProgress = false
  fetchFailed = false

  static LocalStoragePrefix = 'ref-selector'

  constructor(refType: RefType, selector: Renderer, refEndpoint: string, cacheKey: string, nameWithOwner: string) {
    this.refType = refType
    this.selector = selector
    this.refEndpoint = refEndpoint
    this.cacheKey = cacheKey
    this.nameWithOwner = nameWithOwner
  }

  render() {
    this.selector.render()
  }

  async fetchData() {
    try {
      // Don't do anything if we're already loaded or AJAX is in flight.
      if (!this.isLoading || this.fetchInProgress) return
      if (!this.bootstrapFromLocalStorage()) {
        this.fetchInProgress = true
        this.fetchFailed = false
        const response = await fetch(`${this.refEndpoint}?type=${this.refType}`, {
          headers: {Accept: 'application/json'},
        })
        await this.processResponse(response)
      }
      this.isLoading = false
      this.fetchInProgress = false
      this.render()
    } catch (_) {
      this.fetchInProgress = false
      this.fetchFailed = true
    }
  }

  // Store newly received data and update bookkeeping structures
  async processResponse(response: Response) {
    this.emitStats(response)
    if (!response.ok) {
      this.fetchFailed = true
      return
    }
    const lsClone = response.clone() // avoid double-reading Response
    const decoded = (await response.json()) as RefResponse
    this.knownItems = decoded.refs
    this.cacheKey = decoded.cacheKey
    this.flushToLocalStorage(await lsClone.text())
  }

  emitStats(response: Response) {
    if (!response.ok) {
      sendStats({incrementKey: 'REF_SELECTOR_BOOT_FAILED'}, true)
      return
    }
    switch (response.status) {
      case 200: {
        sendStats({incrementKey: 'REF_SELECTOR_BOOTED_FROM_UNCACHED_HTTP'})
        break
      }
      case 304: {
        sendStats({incrementKey: 'REF_SELECTOR_BOOTED_FROM_HTTP_CACHE'})
        break
      }
      default: {
        // I doubt this should ever be triggered since we already know the
        // request is ok, but just here to have an exhaustive switch statement
        sendStats({incrementKey: 'REF_SELECTOR_UNEXPECTED_RESPONSE'})
      }
    }
  }

  // Perform a substring search for the given query among all known items.
  // Prefix-matches should be sorted before other substring matches.
  //
  // We could consider maintaining a fancier data structure to make this search
  // faster, but that would make bootstrapping more expensive and at any rate
  // profiling shows this naive approach is not a bottleneck for real world
  // numbers of branches (~X0,000)
  search(query: string) {
    this.searchTerm = query
    if (query === '') {
      this.currentSearchResult = this.knownItems
      return
    }
    const result: string[] = []
    const prefixes: string[] = []
    this.exactMatchFound = false
    let pos
    for (const ref of this.knownItems) {
      pos = ref.indexOf(query)
      if (pos < 0) continue
      if (pos === 0) {
        if (query === ref) {
          // exact match first
          prefixes.unshift(ref)
          this.exactMatchFound = true
        } else {
          // sort prefix matches before other matches
          prefixes.push(ref)
        }
        continue
      }
      result.push(ref)
    }
    this.currentSearchResult = [...prefixes, ...result]
  }

  // Try to init state from localstorage if a fresh state exists there.
  // This lets us reuse AJAX requests made on previous page loads as long as
  // the repo state hasn't changed.
  // Returns a boolean indicating succcess or failure
  bootstrapFromLocalStorage(): boolean {
    const storedData = getItem(this.localStorageKey)
    if (!storedData) {
      return false
    }
    const payload: RefResponse = JSON.parse(storedData)
    if (payload.cacheKey !== this.cacheKey || !('refs' in payload)) {
      // stored data is stale or malformed, discard it
      removeItem(this.localStorageKey)
      return false
    }
    // Our stored data is valid, use it
    this.knownItems = payload.refs
    this.isLoading = false
    sendStats({incrementKey: 'REF_SELECTOR_BOOTED_FROM_LOCALSTORAGE'})
    return true
  }

  // Store our state at a cache-tied LS key so future selectors
  // can bootstrap without AJAX if the repo state is fresh.
  async flushToLocalStorage(serverResponse: string) {
    try {
      setItem(this.localStorageKey, serverResponse)
    } catch (e) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (e.message.toLowerCase().includes('quota')) {
        // we violated LS quota, clear storage for all ref selectors and try again
        this.clearSiblingLocalStorage()
        sendStats({incrementKey: 'REF_SELECTOR_LOCALSTORAGE_OVERFLOWED'})
        try {
          setItem(this.localStorageKey, serverResponse)
        } catch (err2) {
          // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
          if (err2.message.toLowerCase().includes('quota')) {
            sendStats({incrementKey: 'REF_SELECTOR_LOCALSTORAGE_GAVE_UP'})
          }
        }
      } else {
        throw e // some other error, let it bubble
      }
    }
  }

  // Clear the LocalStorage entries associated with all instances of this class (i.e. for all repos)
  clearSiblingLocalStorage() {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(SearchIndex.LocalStoragePrefix)) {
        removeItem(key)
      }
    }
  }

  // Clear the LocalStorage entry for this instance
  clearLocalStorage() {
    removeItem(this.localStorageKey)
  }

  get localStorageKey(): string {
    return `${SearchIndex.LocalStoragePrefix}:${this.nameWithOwner}:${this.refType}`
  }
}
