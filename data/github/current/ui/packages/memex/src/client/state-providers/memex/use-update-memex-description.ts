import {useCallback} from 'react'

import {apiUpdateMemex} from '../../api/memex/api-update-memex'
import {useProjectDetails} from './use-project-details'
import {useSetProject} from './use-set-project'

type UpdateMemexDescriptionReturnType = {
  /**
   * Set the description for the project on the backend and update the
   * client-side state with the updated value.
   *
   * @param description the new value to use for the project description
   */
  updateDescription: (description: string) => Promise<void>
}

/**
 * Update the project description on the server.
 *
 * If the memex has not yet been created, go through the creation flow instead
 * of the update flow to prevent an extra round-trip.
 *
 */
export const useUpdateMemexDescription = (): UpdateMemexDescriptionReturnType => {
  const memex = useProjectDetails()
  const {setProject} = useSetProject()

  const updateDescription = useCallback(
    async (description: string) => {
      description = description.trim()
      if (memex.description === description) {
        return
      }

      const updateMemexResponse = await apiUpdateMemex({description})
      setProject(updateMemexResponse.memexProject)
    },
    [memex.description, setProject],
  )

  return {
    updateDescription,
  }
}
