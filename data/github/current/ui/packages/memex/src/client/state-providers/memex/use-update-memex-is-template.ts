import {useCallback} from 'react'

import {apiUpdateMemex} from '../../api/memex/api-update-memex'
import {useProjectState} from './use-project-state'
import {useSetProject} from './use-set-project'

type UpdateMemexIsTemplateReturnType = {
  /**
   * Set the project as template on the backend and update the
   * client-side state with the updated value.
   *
   * @param isTemplate the new value to use for template
   */
  updateIsTemplate: (isTemplate: boolean) => Promise<void>
}

/**
 * Update the project to be marked as a template on the server.
 *
 * If the memex has not yet been created, go through the creation flow instead
 * of the update flow to prevent an extra round-trip.
 *
 */
export const useUpdateMemexIsTemplate = (): UpdateMemexIsTemplateReturnType => {
  const context = useProjectState()
  const {setProject} = useSetProject()

  const updateIsTemplate = useCallback(
    async (isTemplate: boolean) => {
      if (context.isTemplate === isTemplate) {
        return
      }

      const updateMemexResponse = await apiUpdateMemex({isTemplate})
      setProject(updateMemexResponse.memexProject)
    },
    [context.isTemplate, setProject],
  )

  return {
    updateIsTemplate,
  }
}
