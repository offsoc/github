import {useMutation, useQueryClient} from '@tanstack/react-query'

import {cancelGetAllMemexData} from '../../../api/memex/api-get-all-memex-data'
import {apiArchiveItems} from '../../../api/memex-items/api-archive-items'
import {apiUnarchiveItems} from '../../../api/memex-items/api-unarchive-items'
import useToasts from '../../../components/toasts/use-toasts'
import {useWrapMutationMutateAsync} from '../../../helpers/mutation-helpers'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {ApiError} from '../../../platform/api-error'
import {HistoryResources, Resources} from '../../../strings'
import {useHistory} from '../../history/history'
import {useRemoveSuggestions} from '../../suggestions/use-remove-suggestions'
import {useRemoveParentIssues} from '../../tracked-by-items/use-remove-parent-issues'
import {useArchiveStatus} from '../../workflows/use-archive-status'
import {
  addMemexItemToQueryClient,
  getItemsFromQueryData,
  getMemexItemsQueryDataFromQueryClient,
  removeMemexItemsFromQueryClient,
  setMemexItemsQueryDataInQueryClient,
} from '../query-client-api/memex-items'

interface RevertArchiveMutationRequest {
  archivedItemIds: Array<number>
  originalItemModels: Array<MemexItemModel> | undefined
  rollbackRemoveParentFromChildren?: () => void
}

export const useArchiveItemsMutation = () => {
  const {removeSuggestions} = useRemoveSuggestions()
  const {setArchiveStatus} = useArchiveStatus()
  const {getIssuesIdsToRemove, removeParentFromChildren} = useRemoveParentIssues()
  const {tasklist_block} = useEnabledFeatures()
  const queryClient = useQueryClient()
  const {addToast} = useToasts()
  const history = useHistory()

  // We pushed these callbacks into the mutation definition (as opposed to at the call site) so that they will be called
  // even if the components that initiated the mutation are unmounted.
  // Without this approach, we would not be able to call the `onSuccess` and `onError` callbacks in conjunction with an optimistic update
  // as the component that triggered the removal might have been removed from the component hierarchy as part of the optimistic update.
  // See https://tkdodo.eu/blog/mastering-mutations-in-react-query#some-callbacks-might-not-fire for more details.
  const archiveMutation = useMutation({
    mutationFn: (request: {memexProjectItemIds: Array<number>}) => {
      return apiArchiveItems(request)
    },
    onMutate: request => {
      // Get this list of issue ids prior to optimistically removing the items from the query client.
      const issueIdsToRemove = getIssuesIdsToRemove(request.memexProjectItemIds)

      const originalQueryData = getMemexItemsQueryDataFromQueryClient(queryClient)
      // Optimistically remove items
      removeMemexItemsFromQueryClient(queryClient, request.memexProjectItemIds)
      cancelGetAllMemexData()
      return {originalQueryData, issueIdsToRemove}
    },
    onSuccess: (_response, request, context) => {
      const rollbackRemoveParentFromChildren =
        tasklist_block && context?.issueIdsToRemove ? removeParentFromChildren(context.issueIdsToRemove) : undefined

      removeSuggestions(request.memexProjectItemIds)
      setArchiveStatus()

      if (context && history) {
        history.registerAction({
          description: HistoryResources.archive(request.memexProjectItemIds.length),
          revert: () =>
            undoArchiveMutation.mutateAsync({
              archivedItemIds: request.memexProjectItemIds,
              originalItemModels: getItemsFromQueryData(context.originalQueryData),
              rollbackRemoveParentFromChildren,
            }),
        })
      }
    },
    onError: (error: unknown, _request, context) => {
      if (context?.originalQueryData) {
        setMemexItemsQueryDataInQueryClient(queryClient, context?.originalQueryData)
      }
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({type: 'error', message: error instanceof ApiError ? error.message : Resources.genericErrorMessage})
    },
  })

  /**
   * Unarchive the items, ensuring they end up in the correct order, and also revert all changes to the project state.
   */
  const undoArchiveMutation = useMutation({
    mutationFn: ({archivedItemIds}: RevertArchiveMutationRequest) =>
      apiUnarchiveItems({memexProjectItemIds: archivedItemIds}),
    onMutate: ({archivedItemIds, originalItemModels}) => {
      // Optimistically readd items to query client. We are trying to build something as close as possible to the
      // correct state. It's not possible for it to be absolutely perfect because we don't have the latest models of
      // the unarchived items and we don't know the actual correct sort position without resorting everything by
      // priority (which we want to avoid to prevent wierd side effects for other items). Since this is only an
      // optimistic any problems will self-resolve and this _should_ work fine for the most common cases.

      // Insert the unarchived items at the indexes they were originally
      for (const id of archivedItemIds) {
        const originalIndex = originalItemModels?.findIndex(m => m.id === id) ?? -1
        const originalItem = originalItemModels?.[originalIndex]
        if (!originalItem) continue
        addMemexItemToQueryClient(queryClient, originalItem, originalIndex)
      }
      cancelGetAllMemexData()
    },
    onSuccess: (_, {rollbackRemoveParentFromChildren}) => {
      rollbackRemoveParentFromChildren?.()

      // We don't revert the `removeSuggestions` call. This is not an issue since that call was just to free up
      // memory by clearing unneeded values from the cache -- we will just refetch that data on demand

      setArchiveStatus()
    },
    onError: (error: unknown, {archivedItemIds}) => {
      removeMemexItemsFromQueryClient(queryClient, archivedItemIds)

      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: `Failed to undo archive. ${error instanceof ApiError ? error.message : Resources.genericErrorMessage}`,
      })
    },
  })

  return useWrapMutationMutateAsync(archiveMutation)
}
