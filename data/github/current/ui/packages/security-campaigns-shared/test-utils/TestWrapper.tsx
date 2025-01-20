import {QueryClientProvider, type QueryClient} from '@tanstack/react-query'
import {queryClient as testQueryClient} from './query-client'

export type TestWrapperProps = {
  children: React.ReactNode

  queryClient?: QueryClient
}

export function TestWrapper({children, queryClient = testQueryClient}: TestWrapperProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
