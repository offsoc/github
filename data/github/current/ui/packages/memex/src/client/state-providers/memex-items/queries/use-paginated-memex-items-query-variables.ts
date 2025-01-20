import {useMemo} from 'react'

import {DefaultSearchConfig} from '../../../components/filter-bar/search-context'
import {useHorizontalGroupedBy} from '../../../features/grouping/hooks/use-horizontal-grouped-by'
import {useVerticalGroupedBy} from '../../../features/grouping/hooks/use-vertical-grouped-by'
import {useSliceBy} from '../../../features/slicing/hooks/use-slice-by'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {usePaginatedVariablesWithFieldIds} from '../../../hooks/use-paginated-variables-with-field-ids'
import {useSortedBy} from '../../../hooks/use-sorted-by'
import {useViews} from '../../../hooks/use-views'
import type {PaginatedMemexItemsQueryVariables, SliceByQueryVariables} from './types'

type QueryVariableOptions = {
  withSliceByValue: boolean
}

export function usePaginatedMemexItemsQueryVariables(options: {
  withSliceByValue: true
}): PaginatedMemexItemsQueryVariables
export function usePaginatedMemexItemsQueryVariables(options: {withSliceByValue: false}): SliceByQueryVariables
export function usePaginatedMemexItemsQueryVariables({withSliceByValue}: QueryVariableOptions) {
  const {memex_mwl_swimlanes} = useEnabledFeatures()
  const {currentView} = useViews()
  const q = DefaultSearchConfig.getSearchQueryFromView(currentView)
  const {sorts} = useSortedBy()
  const sortedBy = useMemo(
    () => sorts.map(sort => ({columnId: sort.column.databaseId, direction: sort.direction})),
    [sorts],
  )
  let {groupedByColumnId: horizontalGroupedByColumnId} = useHorizontalGroupedBy()
  let {groupedByColumnId: verticalGroupedByColumnId} = useVerticalGroupedBy()

  // only board views use vertical grouping, but it's always defaulted for any view type
  if (currentView?.localViewStateDeserialized.viewType !== 'board') {
    verticalGroupedByColumnId = undefined
  } else if (currentView?.localViewStateDeserialized.viewType === 'board' && !memex_mwl_swimlanes) {
    // If we're on a board view with swimlanes disabled, then we don't want to include
    // a horizontal grouped by column id in the request, even if we somehow have one in the view
    horizontalGroupedByColumnId = undefined
  }

  const {sliceField, sliceValue} = useSliceBy()
  const sliceByColumnId = sliceField?.id

  const variablesWithoutFieldIds: PaginatedMemexItemsQueryVariables = useMemo(
    () => ({
      q,
      sortedBy,
      horizontalGroupedByColumnId,
      verticalGroupedByColumnId,
      sliceByColumnId,
      // don't include `sliceValue` if withSliceValue is false
      // sliceValue can be `null`, which we want to coerce to undefined
      sliceByValue: withSliceByValue ? sliceValue ?? undefined : undefined,
    }),
    [
      q,
      sortedBy,
      horizontalGroupedByColumnId,
      verticalGroupedByColumnId,
      sliceByColumnId,
      withSliceByValue,
      sliceValue,
    ],
  )

  const variables = usePaginatedVariablesWithFieldIds(variablesWithoutFieldIds)

  // Ideally this extra check wouldn't be necessary, but because the formation of the variables
  // is within a `useMemo`, TypeScript can't infer the type of the variables object based on the
  // withSliceValue param like we'd hope.
  if (withSliceByValue) {
    return variables
  } else {
    return variablesWithoutFieldIds as SliceByQueryVariables
  }
}
