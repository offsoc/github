import {QueryClient} from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      // Always make requests to ensure we show an error when the user is offline
      networkMode: 'always',
    },
  },
})
