import {useQueryClient} from '@tanstack/react-query'
import {createMutation} from 'react-query-kit'

import {cancelGetAllMemexData} from '../../../api/memex/api-get-all-memex-data'
import {apiRemoveItems} from '../../../api/memex-items/api-remove-items'
import useToasts from '../../../components/toasts/use-toasts'
import {useWrapMutationMutateAsync} from '../../../helpers/mutation-helpers'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {ApiError} from '../../../platform/api-error'
import {Resources} from '../../../strings'
import {useRemoveSuggestions} from '../../suggestions/use-remove-suggestions'
import {useRemoveParentIssues} from '../../tracked-by-items/use-remove-parent-issues'
import {useArchiveStatus} from '../../workflows/use-archive-status'
import {
  getMemexItemsQueryDataFromQueryClient,
  removeMemexItemsFromQueryClient,
  rollbackMemexItemData,
  setMemexItemsQueryDataInQueryClient,
} from '../query-client-api/memex-items'

export const useRemoveItemsMutation = () => {
  const {removeSuggestions} = useRemoveSuggestions()
  const {setArchiveStatus} = useArchiveStatus()
  const {getIssuesIdsToRemove, removeParentFromChildren} = useRemoveParentIssues()
  const {tasklist_block} = useEnabledFeatures()
  const queryClient = useQueryClient()
  const {addToast} = useToasts()

  // We pushed these callbacks into the mutation definition (as opposed to at the call site) so that they will be called
  // even if the components that initiated the mutation are unmounted.
  // Without this approach, we would not be able to call the `onSuccess` and `onError` callbacks in conjunction with an optimistic update
  // as the component that triggered the removal might have been removed from the component hierarchy as part of the optimistic update.
  // See https://tkdodo.eu/blog/mastering-mutations-in-react-query#some-callbacks-might-not-fire for more details.
  const mutationHook = createMutation({
    mutationFn: (request: {memexProjectItemIds: Array<number>}) => {
      return apiRemoveItems(request)
    },
    onMutate: request => {
      // Get this list of issue ids prior to optimistically removing the items from the query client.
      const issueIdsToRemove = getIssuesIdsToRemove(request.memexProjectItemIds)
      // Optimistically remove suggestions prior to removing the items
      // Suggestion cache keys require item content type
      removeSuggestions(request.memexProjectItemIds)

      const originalQueryData = getMemexItemsQueryDataFromQueryClient(queryClient)
      // Optimistically remove items
      const rollbackData = removeMemexItemsFromQueryClient(queryClient, request.memexProjectItemIds)
      cancelGetAllMemexData()
      return {originalQueryData, rollbackData, issueIdsToRemove}
    },
    onSuccess: (_response, request, context) => {
      if (tasklist_block && context?.issueIdsToRemove) {
        removeParentFromChildren(context.issueIdsToRemove)
      }
      setArchiveStatus()
    },
    onError: (error: unknown, _request, context) => {
      if (context?.originalQueryData) {
        setMemexItemsQueryDataInQueryClient(queryClient, context.originalQueryData)
      } else if (context?.rollbackData) {
        rollbackMemexItemData(queryClient, context.rollbackData)
      }
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({type: 'error', message: error instanceof ApiError ? error.message : Resources.genericErrorMessage})
    },
  })

  const mutation = mutationHook()
  return useWrapMutationMutateAsync(mutation)
}
