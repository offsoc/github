import {useContext} from 'react'

import {SetProjectContext, type SetProjectContextType} from './memex-state-provider'

/**
 * This hooks exposes a callback to update the local project data, and does
 * not send changes to the backend.
 *
 * To access the project data you should use one of the specialized hooks:
 *
 *  - useProjectNumber
 *  - useProjectState
 *  - useProjectDetails
 */
export const useSetProject = (): SetProjectContextType => {
  const contextValue = useContext(SetProjectContext)

  if (!contextValue) {
    throw new Error('useSetProject must be used within a SetProjectContext.Provider')
  }

  return contextValue
}
