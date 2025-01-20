import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {PropsWithChildren} from 'react'

import {PathsProvider} from '../../test-utils/PathsProvider'

export function getProviderWrappers({children}: PropsWithChildren<unknown>): JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return PathsProvider({
    scope: {type: 'org', slug: 'github'},
    children: QueryClientProvider({client: queryClient, children}),
  })
}
