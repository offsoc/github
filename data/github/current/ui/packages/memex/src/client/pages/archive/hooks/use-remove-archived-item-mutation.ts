import {useQueryClient} from '@tanstack/react-query'
import {createMutation} from 'react-query-kit'

import {apiRemoveItems} from '../../../api/memex-items/api-remove-items'
import {fetchPoll} from '../../../platform/functional-fetch-wrapper'
import {useBasePaginatedArchivedItemsQuery} from './use-paginated-archive-items-query'

export const useRemoveArchivedItemsMutation = () => {
  const queryClient = useQueryClient()
  const createMutationHook = createMutation({
    mutationFn: apiRemoveItems,
    onSuccess: async data => {
      if (data && 'job' in data) {
        await fetchPoll(data.job.url, {headers: {accept: 'application/json'}})
      }
      const archivedItemsKey = useBasePaginatedArchivedItemsQuery.getKey()
      queryClient.invalidateQueries({queryKey: archivedItemsKey})
    },
  })
  return createMutationHook()
}
