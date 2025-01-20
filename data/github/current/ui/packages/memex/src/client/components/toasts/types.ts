import type {Icon} from '@primer/octicons-react'

import type {Cancellable} from '../../hooks/common/timeouts/use-timeout'

/** Duration for animating the toast in or out is 300ms */
export const TOAST_ANIMATION_LENGTH = 300

interface ToastAction {
  /** Optional short message to include as the button label */
  text: string
  /** Required callback to fire when the user clicks on the toast */
  handleClick: () => void
}

export const ToastType = {
  success: 'success',
  default: 'default',
  warning: 'warning',
  error: 'error',
} as const
export type ToastType = ObjectValues<typeof ToastType>

export interface AddToastProps {
  /** Text to display to the user in the main part of the toast message */
  message: string
  /** Indicate the type of toast this is - 'default' is equivalent to an informational message */
  type: ToastType
  /** Optional icon - only needed if you wish to change the default icon */
  icon?: Icon
  /** Optional object representing an action for the user to acknowledge the toast */
  action?: ToastAction
  /** Optional callback to handle when the toast is dismissed */
  onDismiss?: () => void
  /** Set to {@see true} to keep the toast on-screen until the user acknowledges it */
  keepAlive?: boolean
}

export interface ToastItem extends AddToastProps {
  id: number
  timeout?: Cancellable
  className?: string
}
