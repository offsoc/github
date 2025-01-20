import {useContext} from 'react'
import {InternalToastsContext, TOAST_SHOW_TIME} from './ToastContext'
import {Toast} from './Toast'

// Renders all toasts including the persisted toast. Likely you'll only want to include this one in a React app, in a
// place common to all pages.
/**
 * ⚠️ Warning: Usage of this component is discouraged by the accessibility team as
 * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
 * within GitHub.
 * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
 */
export function Toasts() {
  const {toasts, persistedToast} = useContext(InternalToastsContext)

  return (
    <>
      {toasts.map((toastInfo, index) => (
        <Toast
          message={toastInfo.message}
          icon={toastInfo.icon}
          key={index}
          timeToLive={TOAST_SHOW_TIME}
          type={toastInfo.type}
          role={toastInfo.role}
        />
      ))}
      {persistedToast && (
        <Toast
          message={persistedToast.message}
          icon={persistedToast.icon}
          type={persistedToast.type}
          role={persistedToast.role}
        />
      )}
    </>
  )
}
