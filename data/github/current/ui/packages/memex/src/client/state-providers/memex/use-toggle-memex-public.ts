import {useCallback} from 'react'

import {apiUpdateMemex} from '../../api/memex/api-update-memex'
import {useSetProject} from './use-set-project'

type ToggleMemexPublicReturnType = {
  /**
   *  Set the project to be either "public" or "private"
   *
   * @param setPublic boolean representing whether the project should be public
   */
  toggleMemexPublic: (setPublic: boolean) => Promise<void>
}

/**
 * Toggle the `isPublic` property of the current project
 */
export const useToggleMemexPublic = (): ToggleMemexPublicReturnType => {
  const {setProject} = useSetProject()

  const toggleMemexPublic = useCallback(
    async (setPublic: boolean) => {
      const response = await apiUpdateMemex({public: setPublic})
      setProject(response.memexProject)
    },
    [setProject],
  )

  return {
    toggleMemexPublic,
  }
}
