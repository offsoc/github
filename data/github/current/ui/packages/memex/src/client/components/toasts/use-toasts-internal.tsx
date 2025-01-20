import {useCallback, useRef, useState} from 'react'

import {useTimeout} from '../../hooks/common/timeouts/use-timeout'
import {type AddToastProps, TOAST_ANIMATION_LENGTH, type ToastItem} from './types'

/**
 * Internal API for managing toasts within the application.
 *
 * This handles the lifecycle of toasts and cleaning up the toasts as they
 * expire.
 *
 * By default this will auto-dismiss toasts after 15 seconds.
 */
const useToastsInternal = ({autoDismiss = true, timeout = 15000} = {}) => {
  const [toasts, setToasts] = useState<Array<ToastItem>>([])
  const nextId = useRef(0)
  const getNextId = () => nextId.current++

  const findToastById = useCallback((id: number) => toasts.find(toast => toast.id === id), [toasts])

  const setToastsAfterAnimationDuration = useTimeout(setToasts, TOAST_ANIMATION_LENGTH)

  const removeToast = useCallback(
    (id: number) => {
      const currentToast = findToastById(id)

      if (!currentToast) return

      currentToast.timeout?.cancel()

      setToasts(currentToasts => currentToasts.filter(toast => toast.id !== currentToast.id))

      if (currentToast.onDismiss) {
        currentToast.onDismiss()
      }
    },
    [findToastById, setToasts],
  )
  const removeToastAfterAnimationDuration = useTimeout(removeToast, TOAST_ANIMATION_LENGTH)

  // find the toast to remove and add the `toast-leave` class name
  const startRemovingToast = useCallback(
    (id: number) => {
      setToasts(prevState => prevState.map(toast => (toast.id === id ? {...toast, className: 'toast-leave'} : toast)))
      removeToastAfterAnimationDuration(id)
    },
    [removeToastAfterAnimationDuration, setToasts],
  )
  const dismissToastAfterTimeout = useTimeout(startRemovingToast, timeout)

  const addToast = useCallback(
    (freshToast: AddToastProps) => {
      const toastId = getNextId()
      let timeoutInstance
      if (autoDismiss && !freshToast.keepAlive) {
        timeoutInstance = dismissToastAfterTimeout(toastId)
      }
      const newToast = {id: toastId, timeout: timeoutInstance, ...freshToast}
      // if there's already a toast on the page, wait for it to animate out before
      // adding a new toast
      const firstToast = toasts[0]
      if (firstToast) {
        startRemovingToast(firstToast.id)
        setToastsAfterAnimationDuration([newToast])
      } else {
        setToasts([newToast])
      }
      return toastId
    },
    [autoDismiss, dismissToastAfterTimeout, setToastsAfterAnimationDuration, startRemovingToast, toasts],
  )

  return {addToast, toasts, removeToast, startRemovingToast}
}

export default useToastsInternal
