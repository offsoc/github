import {render as ghRender, type RenderResult, type TestRenderOptions} from '@github-ui/react-core/test-utils'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {ReactElement} from 'react'

export function render(ui: ReactElement, testRenderOptions: TestRenderOptions = {}): RenderResult {
  return ghRender(ui, {
    wrapper: ({children}) =>
      QueryClientProvider({
        client: new QueryClient({
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        }),
        children,
      }),
    ...testRenderOptions,
  })
}
