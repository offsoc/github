import {render} from '@github-ui/react-core/test-utils'
import {type QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {ReactElement} from 'react'

import {PageDataContextProvider} from '../contexts/PageDataContext'
import {default as defaultQueryClient} from '../query-client'

export const BASE_PAGE_DATA_URL = '/monalisa/smile/pull/1'

/**
 *
 * @param ui: ReactElement that will be used for testing a React component that queries data from HTTP request.
 * @param queryClient: Pass a custom query client instance. Defaults a shared query client instance.
 * @returns The @github-ui/react-core/test-utils function that is wrapping @testing-library/react's render utility function.
 *
 * This can be used in a test with HTTP request mocks by following this pattern:
 *
 * import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
 * import {screen} from '@testing-library/react'
 *
 * test('renders data info', async () => {
 *   mockFetch.mockRouteOnce('/nwo/pull/:number/page_data/some_route', {
 *     title: 'Example title'
 *   })
 *   renderWithClient(<ExampleComponent />)
 *   await screen.findByText('Example title')
 *   expectMockFetchCalledTimes('/nwo/pull/:number/page_data/some_route', 1)
 * })
 */
export function renderWithClient(ui: ReactElement, queryClient: QueryClient = defaultQueryClient) {
  const {rerender, user, ...rest} = render(
    <PageDataContextProvider basePageDataUrl={BASE_PAGE_DATA_URL}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </PageDataContextProvider>,
  )
  return {
    ...rest,
    // The user value being returned from render will not destructure.
    // It does not follow the Rest pattern rules in destructuring https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#rest_property as it's lazily defined in return result of the render function.
    user,
    rerender: (rerenderUi: ReactElement) =>
      rerender(
        <PageDataContextProvider basePageDataUrl={BASE_PAGE_DATA_URL}>
          <QueryClientProvider client={queryClient}>{rerenderUi}</QueryClientProvider>
        </PageDataContextProvider>,
      ),
  }
}
