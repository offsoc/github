import {createQuery} from 'react-query-kit'

import type {MemexServiceData} from '../../api/memex/contracts'
import {fetchJSONIslandData} from '../../helpers/json-island'

/**
 * Manages state for the data in the `memex-service` JSON island.
 */
export const useMemexServiceQuery = createQuery<MemexServiceData>({
  queryKey: ['memex-service'],
  fetcher: async () => {
    // This parameter is necessary for type safety, even though the query is disabled
    return {
      betaSignupBanner: 'hidden',
      killSwitchEnabled: false,
      killSwitchRecentlyDisabled: false,
    }
  },
  enabled: false,
  // Read our initial data from the JSON island
  initialData: () => {
    return (
      fetchJSONIslandData('memex-service') || {
        betaSignupBanner: 'hidden',
        killSwitchEnabled: false,
        killSwitchRecentlyDisabled: false,
      }
    )
  },
})
