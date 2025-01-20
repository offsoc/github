import {useQueryClient} from '@tanstack/react-query'
import {createMutation} from 'react-query-kit'

import {apiUnarchiveItems} from '../../../api/memex-items/api-unarchive-items'
import {fetchPoll} from '../../../platform/functional-fetch-wrapper'
import {useBasePaginatedArchivedItemsQuery} from './use-paginated-archive-items-query'

export const useRestoreItemsMutation = () => {
  const queryClient = useQueryClient()
  const createMutationHook = createMutation({
    mutationFn: apiUnarchiveItems,
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
