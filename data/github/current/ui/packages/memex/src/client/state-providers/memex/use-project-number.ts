import {useContext} from 'react'

import {ProjectNumberContext, type ProjectNumberContextType} from './memex-state-provider'

/**
 * This hooks exposes a read-only view of the current project number.
 *
 * While this is still currently backed by the same context, future changes may
 * allow us to move this out to separate state as it is essentially unchanged
 * once the project is created.
 */
export const useProjectNumber = (): ProjectNumberContextType => {
  const contextValue = useContext(ProjectNumberContext)

  if (!contextValue) {
    throw new Error('useMemex must be used within a ProjectNumberContext.Provider')
  }

  return contextValue
}
