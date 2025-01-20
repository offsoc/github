import {reportError} from './failbot'
import {ssrSafeWindow} from '@github-ui/ssr-utils'

ssrSafeWindow?.addEventListener('error', event => {
  if (event.error) {
    reportError(event.error)
  }
})

ssrSafeWindow?.addEventListener('unhandledrejection', async event => {
  if (!event.promise) return
  try {
    await event.promise
  } catch (error) {
    reportError(error)
  }
})

if (ssrSafeWindow?.location.hash === '#b00m') {
  setTimeout(() => {
    throw new Error('b00m')
  })
}
