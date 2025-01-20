import {render as superRender, type TestRenderOptions} from '@github-ui/react-core/test-utils'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {RenderResult} from '@testing-library/react'
import type {ReactElement} from 'react'

import {PathsProvider} from './PathsProvider'

export function render(ui: ReactElement, opts: TestRenderOptions = {}): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return superRender(ui, {
    wrapper: ({children}) => (
      <PathsProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </PathsProvider>
    ),
    ...opts,
  })
}
