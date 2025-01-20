import {useSafeTimeout} from '@primer/react'
import {createContext, type ReactNode, useCallback, useContext, useMemo, useState} from 'react'
import {noop} from '@github-ui/noop'
import useSafeState from '@github-ui/use-safe-state'
import type {ToastRole, ToastType} from './Toast'

export const TOAST_SHOW_TIME = 5000

interface ToastInfo {
  message: ReactNode
  icon?: ReactNode
  type?: ToastType
  role?: ToastRole
}

type ToastContextType = {
  /**
   * ⚠️ Warning: Usage of this hook is discouraged by the accessibility team as
   * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
   * within GitHub.
   * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
   */
  addToast: (toast: ToastInfo) => void
  /**
   * ⚠️ Warning: Usage of this hook is discouraged by the accessibility team as
   * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
   * within GitHub.
   * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
   */
  addPersistedToast: (toast: ToastInfo) => void
  clearPersistedToast: () => void
}
type ToastContextProviderType = {
  children: ReactNode
}

const ToastContext = createContext<ToastContextType>({
  addToast: noop,
  addPersistedToast: noop,
  clearPersistedToast: noop,
})

type InternalToastsContextType = {
  toasts: ToastInfo[]
  persistedToast: ToastInfo | null
}
export const InternalToastsContext = createContext<InternalToastsContextType>({toasts: [], persistedToast: null})

export default ToastContext

export function ToastContextProvider({children}: ToastContextProviderType) {
  const [toasts, setToasts] = useSafeState<ToastInfo[]>([])
  const [persistedToast, setPersistedToast] = useState<ToastInfo | null>(null)
  const {safeSetTimeout} = useSafeTimeout()

  const addToast = useCallback(
    function (toast: ToastInfo) {
      setToasts([...toasts, toast])
      safeSetTimeout(() => setToasts(toasts.slice(1)), TOAST_SHOW_TIME)
    },
    [toasts, safeSetTimeout, setToasts],
  )

  const addPersistedToast = useCallback(
    function (toast: ToastInfo) {
      setPersistedToast(toast)
    },
    [setPersistedToast],
  )

  const clearPersistedToast = useCallback(
    function () {
      setPersistedToast(null)
    },
    [setPersistedToast],
  )

  const contextValue = useMemo(() => {
    return {addToast, addPersistedToast, clearPersistedToast}
  }, [addPersistedToast, addToast, clearPersistedToast])

  const internalToastsContext = useMemo(() => {
    return {toasts, persistedToast}
  }, [toasts, persistedToast])

  return (
    <ToastContext.Provider value={contextValue}>
      <InternalToastsContext.Provider value={internalToastsContext}>{children}</InternalToastsContext.Provider>
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  return useContext(ToastContext)
}
