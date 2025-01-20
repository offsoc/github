import {useCallback} from 'react'

import {apiUpdateMemex} from '../../api/memex/api-update-memex'
import {useProjectDetails} from './use-project-details'
import {useSetProject} from './use-set-project'

type UpdateMemexTitleReturnType = {
  /**
   * Set the title for the project on the backend and update the client-side
   * state with the updated value.
   *
   * @param title the new value to use for the project tile
   */
  updateTitle: (title: string) => Promise<void>
}

/**
 * Updates the title of the memex on the server.
 *
 * If the memex has not yet been created, go through the creation flow instead
 * of the update flow to prevent an extra round-trip.
 */
export const useUpdateMemexTitle = (): UpdateMemexTitleReturnType => {
  const context = useProjectDetails()

  const {setProject} = useSetProject()

  const updateTitle = useCallback(
    async (title: string) => {
      title = title.trim()

      if (context.title === title || title.length === 0) {
        return
      }

      const updateMemexResponse = await apiUpdateMemex({title})
      setProject(updateMemexResponse.memexProject)
    },
    [context.title, setProject],
  )

  return {
    updateTitle,
  }
}
