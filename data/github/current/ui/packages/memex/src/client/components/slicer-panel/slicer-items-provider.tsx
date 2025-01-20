import {createContext, memo, useContext, useMemo} from 'react'
import invariant from 'tiny-invariant'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {PaginatedTotalCount} from '../../api/memex-items/paginated-views'
import {useFilteredItems} from '../../features/filtering/hooks/use-filtered-items'
import {getGroupingMetadataFromServerGroupValue} from '../../features/grouping/get-grouping-metadata'
import {groupItems} from '../../features/grouping/group-items'
import {buildGroupingConfiguration} from '../../features/grouping/grouping-metadata-configurations'
import type {GroupingMetadataWithSource} from '../../features/grouping/types'
import {useSliceBy} from '../../features/slicing/hooks/use-slice-by'
import {getEnabledFeatures} from '../../helpers/feature-flags'
import type {MemexItemModel} from '../../models/memex-item-model'
import {useSliceByDataQuery} from '../../state-providers/memex-items/queries/use-slice-by-data-query'
import {useMemexItems} from '../../state-providers/memex-items/use-memex-items'

export type SlicerItemGroup = GroupingMetadataWithSource & {totalCount: PaginatedTotalCount}

export type SlicerItemsContextValue = {
  slicerItems: Array<SlicerItemGroup> | null
}

const context = createContext<SlicerItemsContextValue>({slicerItems: null})

export const useSlicerItems = () => {
  const contextValue = useContext(context)

  return contextValue
}

const groupingConfiguration = buildGroupingConfiguration((item: MemexItemModel) => item.columns, {
  useDistinctAssigneesGrouping: true,
})

export const SlicerItemsProvider = memo<{children: React.ReactNode}>(function SlicerItemsProvider({children}) {
  const sliceBy = useSliceBy()
  const {items: allItems} = useMemexItems()
  const {filteredItems} = useFilteredItems({applyTransientFilter: 'exclude'})
  const {memex_table_without_limits} = getEnabledFeatures()

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sliceByQuery = memex_table_without_limits ? useSliceByDataQuery() : undefined

  const slicerItems: Array<SlicerItemGroup> = !memex_table_without_limits
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useMemo(() => {
        if (!sliceBy.sliceField || sliceBy.sliceField.dataType === MemexColumnDataType.TrackedBy) return []
        const groupForColumn = groupingConfiguration[sliceBy.sliceField.dataType]
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        invariant(groupForColumn, `No grouping configuration for column ${sliceBy.sliceField}`)

        const groupedItems = groupItems(
          filteredItems,
          sliceBy.sliceField,
          groupForColumn.getGroupingMetadata,
          groupForColumn.getAllGroupMetadata,
          undefined,
          allItems,
        )
        return groupedItems.map(g => ({
          value: g.value,
          sourceObject: g.sourceObject,
          totalCount: {isApproximate: false, value: g.rows.length},
        }))
      }, [allItems, filteredItems, sliceBy.sliceField])
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useMemo(() => {
        if (!sliceBy.sliceField || sliceBy.sliceField.dataType === MemexColumnDataType.TrackedBy || !sliceByQuery?.data)
          return []

        // Assuming we have a slice by field and data in the sliceByQuery,
        // we want to iterate over the slices and return the SlicerItemGroup
        // expected by the slice by panel

        const columnModel = sliceBy.sliceField
        return (
          sliceByQuery.data.slices
            .map(sliceData => {
              const {sliceValue, sliceMetadata, totalCount} = sliceData
              const groupMetadataFromServerValue = getGroupingMetadataFromServerGroupValue(
                columnModel,
                sliceValue,
                sliceMetadata,
              )

              if (!groupMetadataFromServerValue) {
                return undefined
              }

              return {
                sourceObject: groupMetadataFromServerValue,
                value: sliceValue,
                totalCount,
              }
            })
            // if we were unable to find grouping metadata for the sliceValue, the map call above will
            // return undefined, so we want to filter those values out.
            .filter((g): g is SlicerItemGroup => !!g)
        )
      }, [sliceBy.sliceField, sliceByQuery?.data])

  const ctx = useMemo(
    () => ({
      slicerItems,
    }),

    [slicerItems],
  )

  return <context.Provider value={ctx}>{children}</context.Provider>
})
