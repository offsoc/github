import {useCallback} from 'react'

import type {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {useColumnsStableContext} from './use-columns-stable-context'

type FindLoadedFieldIdsHookReturnType = {
  /**
   * Queries the client-side state to determine which columns have been loaded
   * (i.e. we have column values for)
   * @return A list of column ids which have been loaded
   */
  findLoadedFieldIds: () => ReadonlyArray<SystemColumnId | number>
}

export const useFindLoadedFieldIds = (): FindLoadedFieldIdsHookReturnType => {
  const {loadedFieldIdsRef} = useColumnsStableContext()
  const findLoadedFieldIds = useCallback(() => {
    return [...loadedFieldIdsRef.current]
  }, [loadedFieldIdsRef])

  return {findLoadedFieldIds}
}
