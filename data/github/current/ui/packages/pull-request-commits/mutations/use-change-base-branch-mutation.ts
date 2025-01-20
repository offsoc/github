import {fetchPoll} from '@github-ui/fetch-utils'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {usePageDataUrl} from '@github-ui/pull-request-page-data-tooling/use-page-data-url'
import {reactFetchJSON} from '@github-ui/verified-fetch'
import {useMutation} from '@tanstack/react-query'

/**
 * Changes the base branch of a pull request.
 *
 * To run additional callbacks, you can pass any supported callback option to the `mutate` function when it's
 * called, including `onSuccess`, `onError`, and `onSettled`. These additional callbacks will run after the
 * callbacks defined in the hook below.
 *
 * For more details, see https://tanstack.com/query/latest/docs/framework/react/guides/mutations#mutation-side-effects
 *
 * @example
 * ```ts
 * const {mutate} = useChangeBaseBranchMutation()
 *
 * // Required arguments
 * const mutationArguments = {newBaseBranch: 'very-cool-branch' }
 *
 * // Optional callbacks, will run after callbacks defined in useChangeBaseBranchMutation hook
 * const mutationCallbacks = {
 *   onError: error => console.log(error.message),
 *   onSuccess: (data) => console.log(data),
 * }
 *
 * mutate(mutationArguments, mutationCallbacks)
 * ```
 */
export function useChangeBaseBranchMutation() {
  const changeBaseUrl = usePageDataUrl(PageData.changeBase)

  return useMutation({
    mutationFn: ({newBaseBranch}: {newBaseBranch: string}) => {
      // Ignore the TSLint deprecation warning for btoa. It's a false positive; btoa is considered legacy in Node as
      // of v15.13.0, but not in the browser. btoa is still our preferred method for encoding binary strings.
      const newBaseBinary = btoa(encodeURIComponent(newBaseBranch))
      return reactFetchJSON(changeBaseUrl, {
        method: 'PATCH',
        body: {new_base_binary: newBaseBinary},
      })
    },
    onSuccess: async data => {
      const response = await data.json()

      if (response.error) {
        throw new Error(response.error)
      }

      const orchestrationResult = await (
        await fetchPoll(response.orchestration.url, {headers: {accept: 'application/json'}})
      ).json()

      if (orchestrationResult.orchestration.error_message) {
        throw new Error(orchestrationResult.orchestration.error_message)
      }
    },
  })
}
