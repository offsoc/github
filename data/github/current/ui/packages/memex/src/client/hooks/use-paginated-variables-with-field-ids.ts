import isEqual from 'lodash-es/isEqual'
import {useEffect, useMemo, useRef} from 'react'

import {filterFalseyValues} from '../helpers/util'
import {useFindColumnByDatabaseId} from '../state-providers/columns/use-find-column-by-database-id'
import type {PaginatedMemexItemsQueryVariables} from '../state-providers/memex-items/queries/types'
import {useNextPlaceholderQuery} from '../state-providers/memex-items/queries/use-next-placeholder-query'
import {useEnabledFeatures} from './use-enabled-features'
import {useViews} from './use-views'

/*
 * A hook to access the synthetic ids of visible fields for the current view.
 * Used to limit the fields returned in paginated items requests.
 */
export function usePaginatedVariablesWithFieldIds(
  variablesWithoutFieldIds: Omit<PaginatedMemexItemsQueryVariables, 'fieldIds'>,
): PaginatedMemexItemsQueryVariables {
  const {memex_mwl_limited_field_ids} = useEnabledFeatures()
  const {currentView} = useViews()
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()
  // useViews stores visible fields for the current view as database ids
  const {visibleFields: databaseIds} = currentView?.localViewState ?? {}
  // But the server expects synthetic field ids in the request
  const nextVisibleFieldIds = useMemo(() => {
    if (!memex_mwl_limited_field_ids) return undefined
    const ids = filterFalseyValues(databaseIds?.map(databaseId => findColumnByDatabaseId(databaseId)?.id) || [])
    return ids.length === 0 ? undefined : ids.sort()
  }, [databaseIds, findColumnByDatabaseId, memex_mwl_limited_field_ids])

  const visibleFieldIdsRef = useRef(nextVisibleFieldIds)

  const {setUpNextPlaceholderQueries} = useNextPlaceholderQuery(
    {...variablesWithoutFieldIds, fieldIds: nextVisibleFieldIds},
    visibleFieldIdsRef.current,
  )

  useEffect(() => {
    if (!memex_mwl_limited_field_ids) return
    if (!isEqual(nextVisibleFieldIds, visibleFieldIdsRef.current)) {
      // Note: when nextVisibleFieldIds changes, this useEffect will be (re)evaluated at
      // each usePaginatedMemexItemsQueryVariables callsite. This is fine, because
      // setUpNextPlaceholderQueries guards against setting up placeholders more than once
      // for the same field ids.
      setUpNextPlaceholderQueries()
      visibleFieldIdsRef.current = nextVisibleFieldIds
    }
  }, [nextVisibleFieldIds, memex_mwl_limited_field_ids, currentView?.id, setUpNextPlaceholderQueries])

  return {
    ...variablesWithoutFieldIds,
    fieldIds: visibleFieldIdsRef.current,
  }
}
