import {navigator} from '@github/turbo'

type State = Record<string, unknown> & {
  turbo?: {restorationIdentifier: string}
  skipTurbo?: boolean
  usr?: {skipTurbo: boolean}
  turboCount?: number
}

// keep Turbo's history up to date with the browser's in case code calls native history API's directly
const patchHistoryApi = (name: 'replaceState' | 'pushState') => {
  const oldHistory = history[name]

  history[name] = function (this: History, state?: State, unused?: string, url?: string | URL | null) {
    const skipTurbo = state?.skipTurbo || state?.usr?.skipTurbo

    // we need to merge the state from turbo with the state given to pushState in case others are adding data to the state
    function oldHistoryWithMergedState(
      this: History,
      turboState: State,
      turboUnused: string,
      turboUrl?: string | URL | null,
    ) {
      const currentTurboCount = history.state?.turboCount || 0
      // Only turbo navs have the `turbo` key when pushing state.
      const turboCount = name === 'pushState' && state?.turbo ? currentTurboCount + 1 : currentTurboCount
      const mergedState = skipTurbo ? {...state, skipTurbo: true} : {...state, ...turboState, turboCount}
      oldHistory.call(this, mergedState, turboUnused, turboUrl)
    }

    navigator.history.update(
      oldHistoryWithMergedState,
      new URL(url || location.href, location.href),
      state?.turbo?.restorationIdentifier,
    )
  }
}

patchHistoryApi('replaceState')
patchHistoryApi('pushState')
