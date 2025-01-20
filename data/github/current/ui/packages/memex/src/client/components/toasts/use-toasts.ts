import {useContext} from 'react'

import {ToastContext} from './toast-container'

// re-export types that the public API uses to avoid making callers import
// from the same two files each time
export {type AddToastProps, ToastType} from './types'

export default function useToasts() {
  const toastContext = useContext(ToastContext)
  if (!toastContext) {
    throw new Error('useToasts must be used within a ToastContext.Provider')
  }

  return toastContext
}
