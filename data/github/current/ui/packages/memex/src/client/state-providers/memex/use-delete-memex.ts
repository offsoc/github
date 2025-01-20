import {type MutableRefObject, useCallback} from 'react'

import {apiDeleteMemex} from '../../api/memex/api-delete-memex'
import type {DeleteMemexResponse} from '../../api/memex/contracts'
import {type Status, useApiRequest} from '../../hooks/use-api-request'

type DeleteMemexReturnType = {
  /**
   * Delete the project on the backend and redirect users to the projects page
   */
  deleteMemex: (requestArgs: void, rollbackArgs: void) => Promise<void>
  status: MutableRefObject<Status<DeleteMemexResponse>>
}

/**
 * Hook to delete the current project.
 */

export const useDeleteMemex = (): DeleteMemexReturnType => {
  const {perform, status} = useApiRequest({
    request: apiDeleteMemex,
    showErrorToast: true,
  })

  const deleteMemex = useCallback(async () => {
    await perform()
    if (status.current.status === 'succeeded') {
      window.location.assign(status.current.data.redirectUrl)
    }
  }, [perform, status])

  return {
    deleteMemex,
    status,
  }
}
