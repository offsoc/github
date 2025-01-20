import {Toasts} from '@github-ui/toast/Toasts'
import {SSRErrorToast} from './SSRErrorToast'

// This is a container for common UI that should be rendered in all React UIs, including full-page apps and partials.
// Please be very conservative in adding functionality here, as it will affect the bundle size of every page on the
// site.
export function CommonElements({ssrError}: {ssrError?: HTMLScriptElement}) {
  return (
    <>
      <Toasts />
      {ssrError && <SSRErrorToast ssrError={ssrError} />}
    </>
  )
}
