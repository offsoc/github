import {useCallback} from 'react'

import {apiUpdateMemex} from '../../api/memex/api-update-memex'
import {useProjectDetails} from './use-project-details'
import {useSetProject} from './use-set-project'

type UpdateMemexShortDescriptionReturnType = {
  /**
   * Set the short description for the project on the backend and update the
   * client-side state with the updated value.
   *
   * @param shortDescription the new value to use for the project description
   */
  updateShortDescription: (shortDescription: string) => Promise<void>
}

/**
 * Update the project short description on the server.
 *
 * If the memex has not yet been created, go through the creation flow instead
 * of the update flow to prevent an extra round-trip.
 *
 */
export const useUpdateMemexShortDescription = (): UpdateMemexShortDescriptionReturnType => {
  const context = useProjectDetails()
  const {setProject} = useSetProject()

  const updateShortDescription = useCallback(
    async (shortDescription: string) => {
      shortDescription = shortDescription.trim()
      if (context.shortDescription === shortDescription) {
        return
      }

      const updateMemexResponse = await apiUpdateMemex({shortDescription})
      setProject(updateMemexResponse.memexProject)
    },
    [context.shortDescription, setProject],
  )

  return {
    updateShortDescription,
  }
}
