import {useContext} from 'react'

import {SuggestionsStableContext} from './suggestions-state-provider'

/**
 * Accesses the SuggestionsStableContext, which contains a method to remove the suggested assignees,
 * labels and milestones from the local cache. Consuming this context will _not_ cause a
 * component to re-render any time the state changes, because it does not hold the state itself.
 *
 * @returns The value of the SuggestionsStableContext
 */
export const useSuggestionsStableContext = () => {
  const context = useContext(SuggestionsStableContext)
  if (!context) {
    throw new Error('useSuggestionsStableContext must be used within a SuggestionsStableContext.Provider.')
  }

  return context
}
