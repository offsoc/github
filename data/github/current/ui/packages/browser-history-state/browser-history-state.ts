import {ssrSafeWindow, ssrSafeHistory, ssrSafeLocation} from '@github-ui/ssr-utils'

let sessionHistoryEntries: Array<{url: string; state: unknown}> = []
let sessionHistoryOffset = 0
let state: State

type State = {
  _id: number
  turbo?: {
    restorationIdentifier: string
  }
}

/*
 * Array of history entries.
 *
 * Example:
 * {
 *   0: {
 *     url: "/",
 *     state: { ... }.
 *   },
 *   1: {
 *     url: "/github/github/issues/123",
 *     state: { ... }.
 *   },
 *   2: {
 *     url: "/github/github/issues/123#comment-4",
 *     state: { ... }.
 *   }.
 *  }.
 */

export function getState(): State {
  return state
}

function safeGetHistory() {
  try {
    // Clamp history.length to 0<->9007199254740991 (Number.MAX_SAFE_INTEGER isn't supported in IE)
    return Math.min(Math.max(0, ssrSafeHistory?.length || 0) || 0, 9007199254740991)
  } catch (e) {
    return 0
  }
}

function initializeState(): State {
  const newState = {_id: new Date().getTime(), ...ssrSafeHistory?.state}
  setState(newState)
  return newState
}

// Current index into history entries stack.
function position(): number {
  return safeGetHistory() - 1 + sessionHistoryOffset
}

function setState(newState: State) {
  state = newState

  // Update entry at current position
  const url = ssrSafeLocation?.href
  sessionHistoryEntries[position()] = {url, state}

  // Trim entries to match history size
  sessionHistoryEntries.length = safeGetHistory()

  // Emit public statechange
  ssrSafeWindow?.dispatchEvent(new CustomEvent('statechange', {bubbles: false, cancelable: false}))
}

// Generate unique id for state object.
//
// Use a timestamp instead of a counter since ids should still be unique
// across page loads.
function uniqueId(): number {
  return new Date().getTime()
}

// Indirection for history.pushState to support tracking URL changes.
//
// Would be great if there was a standard window.addEventListener('statechange') event.
export function pushState(oldState: State | null, title: string, url: string) {
  // pushState drops any forward history entries
  sessionHistoryOffset = 0
  const newState = {_id: uniqueId(), ...oldState}
  ssrSafeHistory?.pushState(newState, title, url)
  setState(newState)
}

// Indirection for history.replaceState to support tracking URL changes.
//
// Would be great if there was a standard window.addEventListener('statechange') event.
export function replaceState(oldState: Record<string, unknown> | null, title: string, url: string) {
  const newState = {...getState(), ...oldState}
  ssrSafeHistory?.replaceState(newState, title, url)
  setState(newState)
}

state = initializeState()

ssrSafeWindow?.addEventListener(
  'popstate',
  function onPopstate(event: PopStateEvent) {
    const currentState: State = event.state

    if (!currentState || (!currentState._id && !currentState.turbo?.restorationIdentifier)) {
      // Unmanaged state in history entries
      // Or could be a hashchange pop, ignore and let hashchange handle it
      return
    }

    // Each state has a unique restorationIdentifier provided by Turbo. We compare the id
    // to see if we are going backwards or forwards.
    const id = currentState.turbo?.restorationIdentifier
    const restoreId = (sessionHistoryEntries[position() - 1]?.state as State)?.turbo?.restorationIdentifier

    if (restoreId === id) {
      sessionHistoryOffset--
    } else {
      sessionHistoryOffset++
    }

    setState(currentState)
  },
  true,
)

let turboAction: string

ssrSafeWindow?.addEventListener('turbo:visit', event => {
  if (!(event instanceof CustomEvent)) return

  turboAction = event.detail.action
})

// Listen turbo navigations to reset the `sessionHistoryOffset` in case we are doing a page load
// instead of poping a state from the history stack.
ssrSafeWindow?.addEventListener('turbo:load', () => {
  if (turboAction === 'restore') return

  sessionHistoryOffset = 0
  // Add turbo navigations to the state stack, so we can keep it complete without `empty` entries.
  replaceState(ssrSafeHistory?.state, '', '')
})

ssrSafeWindow?.addEventListener(
  'hashchange',
  function onHashchange() {
    if (safeGetHistory() > sessionHistoryEntries.length) {
      // Forward navigation
      const newState = {_id: uniqueId()}
      ssrSafeHistory?.replaceState(newState, '', ssrSafeLocation.href)
      setState(newState)
    }
  },
  true,
)

// We need to reset our history state on full-page loads to prevent our state from getting out of sync with the browser's history stack.
ssrSafeWindow?.addEventListener('pageshow', () => {
  sessionHistoryEntries = []
  sessionHistoryOffset = 0
})
