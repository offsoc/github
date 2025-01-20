import {useContext} from 'react'

import {ProjectTemplateIdContext} from './memex-state-provider'

/**
 * This hooks exposes a read-only view of the current project's template id.
 * Used when initializing a new project from a template.
 */
export const useProjectTemplateId = (): number | undefined => {
  const contextValue = useContext(ProjectTemplateIdContext)
  return contextValue
}
