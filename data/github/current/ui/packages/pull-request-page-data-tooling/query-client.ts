import {QueryClient} from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // This will prevent additional re-fetches when
      // 1. A similiar HTTP request is in flight
      // 2. initialData field is set with data on page load or through SSR
      staleTime: Infinity,
      // Disable retries
      retry: false,
    },
  },
})

export default queryClient
