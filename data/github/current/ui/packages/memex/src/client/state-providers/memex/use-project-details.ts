import {useContext} from 'react'

import {ProjectDetailsContext, type ProjectDetailsContextType} from './memex-state-provider'

/**
 * This hooks exposes a read-only view of the details of the current project.
 *
 * While this is still currently backed by the same context, future changes may
 * allow us to move this out to separate state as it is essentially unchanged
 * once the project is created.
 */
export const useProjectDetails = (): ProjectDetailsContextType => {
  const contextValue = useContext(ProjectDetailsContext)

  if (!contextValue) {
    throw new Error('useProjectDetails must be used within a ProjectDetailsContext.Provider')
  }

  return contextValue
}
