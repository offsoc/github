import {QueryClient} from '@tanstack/react-query'

/**
 * We are setting networkMode to 'always' here for a small percentage of our Chromium users on macOS who
 * encounter a networking change (possibly related to sleep mode) which causes `navigator.onLine` to return
 * false even when the network connection starts working again.
 *
 * See https://bugs.chromium.org/p/chromium/issues/detail?id=678075 for Chromium write-up on the issue.
 */
const networkMode = 'always'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Default is 3, but we don't necessarily want to retry
       * that much
       */
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode,
    },
    mutations: {
      networkMode,
    },
  },
})
