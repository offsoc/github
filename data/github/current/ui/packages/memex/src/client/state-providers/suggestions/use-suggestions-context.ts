import {useContext} from 'react'

import {SuggestionsContext} from './suggestions-state-provider'

/**
 * Accesses the SuggestionsContext, which contains state related suggested assignees, labels
 * and milestones, per item, fetched from the server. Consuming this context will cause a
 * component to re-render any time the state changes.
 * @returns The value of the SuggestionsContext
 */
export const useSuggestionsContext = () => {
  const context = useContext(SuggestionsContext)
  if (!context) {
    throw new Error('useSuggestionsContext must be used within a SuggestionsContext.Provider.')
  }

  return context
}
