import {type QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {ReactNode} from 'react'

import {PageDataContextProvider} from '../contexts/PageDataContext'
import {default as defaultQueryClient} from '../query-client'
import {BASE_PAGE_DATA_URL} from './RenderWithQueryClient'

/**
 *
 * @param queryClient: Pass a custom query client instance. Defaults a shared query client instance.
 * @returns the ref/state of the hook
 *
 * This can be used in a hook test (most likely a mutation) like so:
 *
 * test('example', async () => {
 *   const wrapper = createWrapper(customQueryClient)
 *   const pullRequestQueryKey = useQueryKey(PageData.pullRequest)
 *   const {result} = renderHook(() => usePullRequesUpdateMutation(), {wrapper})
 *
 *   // run hook mutation
 *   result.current.mutate({title: 'test-example'})
 *
 *   await waitFor(() => expect(result.current.isSuccess).toEqual(true))
 *
 *   const pullRequest = queryClient.getQueryData<PullRequestPageData>(pullRequestQueryKey)
 *   expect(pullRequest?.title).toEqual('test-example')
 * })
 *
 * Alternatively you can use a custom built queryClient:
 *
 * test('example', async () => {
 *   const customQueryClient = new QueryClient({ defaultOptions: {...myTestDefaultOptions}})
 *   const wrapper = createWrapper(customQueryClient)
 *   ...same as above
 * })
 */
export function createQueryWrapper(queryClient: QueryClient = defaultQueryClient) {
  // eslint-disable-next-line react/display-name
  return ({children}: {children: ReactNode}) => (
    <PageDataContextProvider basePageDataUrl={BASE_PAGE_DATA_URL}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PageDataContextProvider>
  )
}
