import {SuggestionsStateProvider} from '../../../client/state-providers/suggestions/suggestions-state-provider'

export function createSuggestionsStateProviderWrapper() {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <SuggestionsStateProvider>{children}</SuggestionsStateProvider>
  )
  return wrapper
}

/**
 * Splits an array exactly in the middle. Does not change the original array.
 *
 * @param array The array to be splitted.
 * @returns Returns a pair containing 2 arrays constructed from the given array.
 */
export function splitArray<T>(array: Array<T>): [Array<T>, Array<T>] {
  const middle = Math.round(array.length / 2)
  return [array.slice(0, middle), array.slice(middle)]
}
