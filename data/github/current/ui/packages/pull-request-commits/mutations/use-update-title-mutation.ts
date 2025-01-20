import {useMutation} from '@tanstack/react-query'
import {reactFetchJSON} from '@github-ui/verified-fetch'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import type {HeaderPageData} from '../page-data/payloads/header'

/**
 * Updates the title of a pull request. On success, will update Tanstack query data.
 *
 * To run additional callbacks, you can pass any supported callback option to the `mutate` function when it's
 * called, including `onSuccess`, `onError`, and `onSettled`. These additional callbacks will run after the
 * callbacks defined in the hook below.
 *
 * For more details, see https://tanstack.com/query/latest/docs/framework/react/guides/mutations#mutation-side-effects
 *
 * @example
 * ```ts
 * const {mutate} = useUpdateTitleMutation()
 *
 * // Required arguments
 * const mutationArguments = {id: 1, title: 'very cool title' }
 *
 * // Optional callbacks, will run after callbacks defined in useUpdateTitleMutation hook
 * const mutationCallbacks = {
 *   onError: error => console.log(error.message),
 *   onSuccess: (data) => console.log(data),
 * }
 *
 * mutate(mutationArguments, mutationCallbacks)
 * ```
 */
export function useUpdateTitleMutation() {
  const titleUrl = usePageDataUrl(PageData.updateTitle)
  const headerUrl = usePageDataUrl(PageData.header)

  return useMutation({
    networkMode: 'always',
    mutationFn: ({id, title}: {id: number; title: string}) => {
      return reactFetchJSON(titleUrl, {method: 'PATCH', body: {id, title}})
    },
    onSuccess: async result => {
      const responseBody = await result.json()

      if (!result.ok) {
        throw new Error(responseBody.errors)
      }

      queryClient.setQueryData([PageData.header, headerUrl], (old: HeaderPageData) => {
        return {
          ...old,
          pullRequest: {
            ...old.pullRequest,
            title: responseBody.pullRequest.title,
            titleHtml: responseBody.pullRequest.titleHtml,
          },
        }
      })
    },
  })
}
