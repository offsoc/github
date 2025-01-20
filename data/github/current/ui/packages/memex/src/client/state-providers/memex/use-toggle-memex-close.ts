import {useCallback} from 'react'

import {apiUpdateMemex} from '../../api/memex/api-update-memex'
import {useSetProject} from './use-set-project'

type ToggleMemexCloseReturnType = {
  /**
   *  Close or re-open a project on the backend.
   *
   * @param closed boolean representing the new project state
   */
  toggleMemexClose: (closed: boolean) => Promise<void>
}

/**
 * Close or re-open the current project.
 *
 * This will also update the project state on the backend.
 */
export const useToggleMemexClose = (): ToggleMemexCloseReturnType => {
  const {setProject} = useSetProject()

  const toggleMemexClose = useCallback(
    async (closed: boolean) => {
      const closeMemexResponse = await apiUpdateMemex({closed})
      setProject(closeMemexResponse.memexProject)
    },
    [setProject],
  )

  return {
    toggleMemexClose,
  }
}
