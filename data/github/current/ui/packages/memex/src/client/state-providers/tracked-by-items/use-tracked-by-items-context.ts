import {useContext} from 'react'

import {TrackedByItemsContext} from './tracked-by-items-state-provider'

export const useTrackedByItemsContext = () => {
  const context = useContext(TrackedByItemsContext)
  if (!context) {
    throw new Error('useTrackedByItemsContext must be used within a TrackedByItemsContext.Provider.')
  }

  return context
}
