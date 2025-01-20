import {useCallback} from 'react'

import useToasts from '../../../components/toasts/use-toasts'
import {ApiError} from '../../../platform/api-error'
import {Resources} from '../../../strings'

export function useShowToastOnError() {
  const {addToast} = useToasts()
  return useCallback(
    (error: unknown) => {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({type: 'error', message: error instanceof ApiError ? error.message : Resources.genericErrorMessage})
    },
    [addToast],
  )
}
