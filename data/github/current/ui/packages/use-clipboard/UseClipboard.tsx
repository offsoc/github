import {useCallback, type ReactNode} from 'react'
import {useClickAnalytics, type AnalyticsEvent} from '@github-ui/use-analytics'
import {CheckIcon} from '@primer/octicons-react'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

interface ToastProps {
  message: ReactNode
  timeToLive?: number
  icon?: ReactNode
  type?: 'info' | 'success' | 'error'
  role?: 'alert' | 'status'
}

interface CopyToClipboardProps {
  textToCopy: string
  payload?: AnalyticsEvent
  toast?: ToastProps
  showToast?: boolean
}
type CopyToClipboardWithTextFunction = () => void
type CopyToClipboardFunction = (props: CopyToClipboardProps) => CopyToClipboardWithTextFunction

/**
 * Use this hook to copy text values to clipboard. It may optionally send an analytics event and display a toast message.
 *
 * Your react app should use
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { copyToClipboard } = useClipboard()
 *   const copyLabel = copyToClipboard({textToCopy: "text-to-copy"})
 *   return <Button onClick={copyLabel}>Submit</Button>
 * }
 * ```
 *
 * * @example
 * ```tsx
 * function Component() {
 *   const { copyToClipboard } = useClipboard()
 *   const analyticsPayload = {
 *      category: 'test_example',
 *      action: `click_to_copy_test_example`,
 *      label: `ref_cta:copy_label;ref_loc:test`,
 *   }
 *   const toast = {type: 'success', message: 'Copied to clipboard!', icon: <CheckIcon />, role: 'status'}
 *   const copyLabel = copyToClipboard({
 *     textToCopy: 'bar',
 *     payload: analyticsPayload,
 *     toast: toast,
 *   })
 *   return <Button onClick={copyLabel}>Submit</Button>
 * }
 * ```
 *
 */
export function useClipboard(): {
  copyToClipboard: CopyToClipboardFunction
} {
  const {addToast} = useToastContext()
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  return {
    copyToClipboard: useCallback(
      ({
        textToCopy,
        payload,
        toast = {type: 'success', message: 'Copied to clipboard!', icon: <CheckIcon />, role: 'status'},
        showToast = true,
      }) => {
        return () => {
          navigator.clipboard.writeText(textToCopy)
          payload && sendClickAnalyticsEvent(payload)
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          showToast && addToast(toast)
        }
      },
      [sendClickAnalyticsEvent, addToast],
    ),
  }
}
