import {useContext} from 'react'

import {ProjectStateContext, type ProjectStateContextType} from './memex-state-provider'

/**
 * This hooks exposes a read-only view of the state of the current project.
 *
 * While this is still currently backed by the same context, future changes may
 * allow us to move this out to separate state as it is essentially unchanged
 * once the project is created.
 */
export const useProjectState = (): ProjectStateContextType => {
  const contextValue = useContext(ProjectStateContext)

  if (!contextValue) {
    throw new Error('useProjectState must be used within a ProjectStateContext.Provider')
  }

  return contextValue
}
