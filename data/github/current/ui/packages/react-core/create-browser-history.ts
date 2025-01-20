import {
  createBrowserHistory as routerCreateBrowserHistory,
  type BrowserHistory,
  type BrowserHistoryOptions,
  type To,
  Action,
} from '@remix-run/router'
import type {Listener, Update} from '@remix-run/router/dist/history'

/**
 * A change to the current location that was blocked. May be retried
 * after obtaining user confirmation.
 *
 * The RR version of Transition extends Update, but this does not because it was easier not to.
 */
export interface Transition {
  /**
   * Retries the update to the current location.
   */
  retry(): void
}

/**
 * A function that receives transitions when navigation is blocked.
 */
export interface Blocker {
  (tx: Transition): void
}

export interface GitHubBrowserHistory extends BrowserHistory {
  block(blocker: Blocker): () => void
}

/**
 * This is a wrapper around React Router's createBrowserHistory. On top of the RR browser history, this wrapper:
 * - Ensures that it is constructed with v5Compat:true, so that it is compatible with pre-6.4 RR usage.
 * - Creates a .block() method that is API-compatible with pre-6.4 RR usage, but using the post-6.4 RR internals.
 *
 * It would be lovely to get rid of this file. We will be able to do that if we migrate to using a data router, which
 * would allow us to use the RR unstable_useBlocker hook directly.
 */
export function createBrowserHistory(options: BrowserHistoryOptions = {}): GitHubBrowserHistory {
  /**
   * Note: `v5Compat` is set to true to maintain compatibility v5 & pre-6.4 versions of React Router. In the future,
   * if we shift to using a React Router data router, we can remove this option (and possibly this whole wrapper?).
   */
  const history = routerCreateBrowserHistory({...options, v5Compat: true})
  let listener: Listener | undefined
  let blockers: Blocker[] = []
  let ignoreNextHistoryUpdate = false

  history.listen((update: Update) => {
    if (ignoreNextHistoryUpdate) {
      ignoreNextHistoryUpdate = false
      return
    }

    if (update.action === Action.Pop && blockers.length && update.delta !== null && blockers.length > 0) {
      const delta = update.delta

      // undo the navigation for now:

      ignoreNextHistoryUpdate = true
      history.go(delta * -1)

      for (const blocker of blockers) {
        blocker({
          retry() {
            history.go(delta)
          },
        })
      }
    } else {
      listener?.(update)
    }
  })

  function doIfUnblocked(fn: () => void) {
    if (blockers.length > 0) {
      for (const blocker of blockers) {
        blocker({
          retry() {
            fn()
          },
        })
      }
    } else {
      fn()
    }
  }

  return {
    get action() {
      return history.action
    },

    get location() {
      return history.location
    },

    createHref(to: To) {
      return history.createHref(to)
    },

    createURL(to: To) {
      return history.createURL(to)
    },

    encodeLocation(to: To) {
      return history.encodeLocation(to)
    },

    push(to: To, state?: unknown) {
      doIfUnblocked(() => history.push(to, state))
    },

    replace(to: To, state?: unknown) {
      doIfUnblocked(() => history.replace(to, state))
    },

    go(delta: number) {
      doIfUnblocked(() => history.go(delta))
    },

    listen(newListener: Listener) {
      if (listener) {
        throw new Error('A history only accepts one active listener')
      }
      listener = newListener
      const unlisten = () => {
        listener = undefined
      }
      return unlisten
    },

    /**
     * @deprecated
     */
    block(blocker: Blocker): () => void {
      blockers.push(blocker)

      const unblock = () => {
        blockers = blockers.filter(b => b !== blocker)
      }
      return unblock
    },
  }
}
