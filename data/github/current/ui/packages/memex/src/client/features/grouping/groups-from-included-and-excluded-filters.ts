import {filterMatches, iterationMatches} from '../../components/filter-bar/helpers/search-filter'
import {sanitizeTextInputHtmlString} from '../../helpers/sanitize'
import type {ColumnModel} from '../../models/column-model'
import {isAnySingleSelectColumnModel, isIterationColumnModel} from '../../models/column-model/guards'
import {isIteration, type VerticalGroup} from '../../models/vertical-group'
import {normalizeGroupName} from './utils'

/**
 * Filters the list of groups used to only include those that match any current filter values.
 * Only takes the filter string into account when compared against the group names - this method does
 * not consider empty groups. Will also make sure that the group names are sanitized for the
 * `nameHtml` property.
 *
 * Currently only supports single-select and iteration fields.
 *
 * @param groupByField The field that we're grouping by.
 * @param groups The list of groups belonging to the group by field.
 * @param param2 Filter states consisting of field names that should definitely be included and excluded.
 * @returns A list of groups that match the filter states.
 */
export function groupsFromIncludedAndExcludedFilters(
  groupByField: ColumnModel,
  groups: Array<VerticalGroup>,
  {include, exclude}: {include: Set<string>; exclude: Set<string>},
) {
  return groups.reduce<Array<VerticalGroup>>((acc, group) => {
    const optionWithNameHtml: VerticalGroup = {
      ...group,
      nameHtml: sanitizeTextInputHtmlString(group.nameHtml),
    }

    if (isAnySingleSelectColumnModel(groupByField)) {
      const lowerGroupName = normalizeGroupName(group)
      const isIncluded = include.size === 0 || filterMatches(Array.from(include), lowerGroupName)
      const isExcluded = filterMatches(Array.from(exclude), lowerGroupName)

      if (isIncluded && !isExcluded) {
        acc.push(optionWithNameHtml)
      }
    } else if (isIterationColumnModel(groupByField)) {
      const iteration = isIteration(group.groupMetadata) ? group.groupMetadata : undefined
      const isIncluded = include.size === 0 || iterationMatches(Array.from(include), groupByField, false, iteration?.id)
      const isExcluded = iterationMatches(Array.from(exclude), groupByField, false, iteration?.id)
      if (isIncluded && !isExcluded) {
        acc.push(optionWithNameHtml)
      }
    }

    return acc
  }, [])
}
