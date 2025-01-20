import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {renderHook as superRenderHook, type RenderHookResult} from '@testing-library/react'

import {PathsProvider} from './PathsProvider'

export function renderHook<Result, Props>(render: (initialProps: Props) => Result): RenderHookResult<Result, Props> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return superRenderHook(render, {
    wrapper: ({children}) => {
      return PathsProvider({
        scope: {type: 'org', slug: 'github'},
        children: QueryClientProvider({client: queryClient, children}),
      })
    },
  })
}
