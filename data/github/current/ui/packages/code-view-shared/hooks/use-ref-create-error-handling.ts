// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useCallback} from 'react'

export function useRefCreateErrorHandling() {
  const {addToast} = useToastContext()

  return useCallback(
    (
      error: string, // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    ) => addToast({type: 'error', message: error}),
    [addToast],
  )
}
