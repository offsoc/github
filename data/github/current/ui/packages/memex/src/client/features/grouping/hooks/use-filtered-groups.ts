import {useCallback} from 'react'

import {normalizeToLowercaseFieldName, splitFieldFilters} from '../../../components/filter-bar/helpers/search-filter'
import {useSearch} from '../../../components/filter-bar/search-context'
import type {ColumnModel} from '../../../models/column-model'
import {isIterationColumnModel} from '../../../models/column-model/guards'
import type {VerticalGroup} from '../../../models/vertical-group'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {groupsFromIncludedAndExcludedFilters} from '../groups-from-included-and-excluded-filters'

/**
 * Returns a function to build a filtered list of groups for the provided column model.
 * If a group is specifically included in the current search query, only those included will be returned.
 * If a group is excluded from the current search query, it will not be returned.
 *
 * @returns A function for building a list of filtered vertical groups for a given field.
 */
export const useFilteredGroups = () => {
  const {orderedTokenizedFilters} = useSearch()
  const {allColumns} = useAllColumns()

  const getGroupByFieldOptions = useCallback(
    (
      groupByField: ColumnModel,
      getGroupsForField: (
        columnModel?: ColumnModel,
        opts?: {includeAllCompletedIterations?: boolean},
      ) => Array<VerticalGroup>,
    ) => {
      const groupByFilter = orderedTokenizedFilters.reduce(
        (acc, filter) => {
          if (
            groupByField &&
            filter.type === 'field' &&
            allColumns.find(c => c.name.toLowerCase() === normalizeToLowercaseFieldName(filter.field)) === groupByField
          ) {
            for (const field of splitFieldFilters(filter.value.toLowerCase())) {
              acc[filter.exclude ? 'exclude' : 'include'].add(field)
            }
          }
          return acc
        },
        {include: new Set<string>(), exclude: new Set<string>()},
      )

      const groups = getGroupsForField(groupByField, {
        includeAllCompletedIterations:
          isIterationColumnModel(groupByField) && groupByFilter.include.size + groupByFilter.exclude.size > 0,
      })

      return groupsFromIncludedAndExcludedFilters(groupByField, groups, groupByFilter)
    },
    [orderedTokenizedFilters, allColumns],
  )

  return {getGroupByFieldOptions}
}
