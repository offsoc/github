import {CheckIcon, StopIcon, InfoIcon} from '@primer/octicons-react'
import {Portal, useSafeTimeout} from '@primer/react'
import React, {useEffect, type ReactNode, type ReactElement} from 'react'

export type ToastType = 'info' | 'success' | 'error'
export type ToastRole = 'alert' | 'status' | 'log'
export interface ToastProps {
  message: ReactNode
  timeToLive?: number
  icon?: React.ReactNode
  type?: ToastType
  role?: ToastRole
}

const typeClass: Record<ToastType, string> = {
  info: '',
  success: 'Toast--success',
  error: 'Toast--error',
}
const typeIcon: Record<ToastType, ReactElement> = {
  info: <InfoIcon />,
  success: <CheckIcon />,
  error: <StopIcon />,
}

// Default role for the Toast is 'log' because 'status' is not read out by some screen readers.
// Notably, NVDA will not read out popup content if the role is 'status'.
/**
 * ⚠️ Warning: Usage of this component is discouraged by the accessibility team as
 * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
 * within GitHub.
 * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
 */
export const Toast: React.FC<ToastProps> = ({message, timeToLive, icon, type = 'info', role = 'log'}) => {
  const [isVisible, setIsVisible] = React.useState(true)
  const {safeSetTimeout} = useSafeTimeout()

  useEffect(() => {
    if (!timeToLive) return
    safeSetTimeout(() => setIsVisible(false), timeToLive - 300)
  }, [safeSetTimeout, timeToLive])

  return (
    <Portal>
      <div className="p-1 position-fixed bottom-0 left-0 mb-3 ml-3">
        <div
          className={`Toast ${typeClass[type]} ${isVisible ? 'Toast--animateIn' : 'Toast--animateOut'}`}
          id="ui-app-toast"
          data-testid={`ui-app-toast-${type}`}
          role={role}
        >
          <span className="Toast-icon">{icon || typeIcon[type]}</span>
          <span className="Toast-content">{message}</span>
        </div>
      </div>
    </Portal>
  )
}
