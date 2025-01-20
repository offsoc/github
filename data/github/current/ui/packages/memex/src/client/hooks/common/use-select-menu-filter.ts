import {useMemo, useState} from 'react'

import type {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {ItemType} from '../../api/memex-items/item-type'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import type {FuzzyFilterData} from '../../helpers/suggester'
import type {SupportedSuggestionOptions} from '../../helpers/suggestions'
import {isValidDraftItemColumn} from '../../state-providers/memex-items/memex-item-helpers'
import {useSuggestions} from '../../state-providers/suggestions/use-suggestions'

interface UseSelectMenuFilterParams<TSuggestion extends SupportedSuggestionOptions> {
  /**
   * Function which will be called every time the select menu opens, unless the suggestions
   * for this column are already loaded.
   */
  fetchSuggestions: () => void

  /** Item to look up suggestions for. */
  memexItemModel: SidePanelItem

  /** Column to look up suggestions for. */
  columnId: SystemColumnId | number

  /** Function called to do a client-side filter based on current text in filter text box. */
  filterSuggestions: (
    searchQuery: string,
    suggestions: Array<TSuggestion>,
    maxSuggestions: number,
  ) => FuzzyFilterData<TSuggestion>

  /** Maximum number of suggestions to return. */
  maxSuggestions: number

  /** Set of options to return if you know you don't need to fetch them. */
  options?: Array<TSuggestion>

  /** A value to initialize the filter with, defaulting to an empty string if none is passed */
  initialFilterValue?: string
}

/**
 * This hook provides behavior for select menus to fetch suggestions and filter them.
 * It exposes four things:
 *
 * filterValue: The current value of the filter field.
 *
 * onOpen: Callback that the consumer should invoke whenever the user opens the
 * select menu. This will fetch the initial list of suggestions that will be
 * displayed within the menu.
 *
 * onChangeField: Callback that the consumer should invoke whenever the value
 * of the filter input changes. This will filter this list of suggestions
 * displayed to the user.
 *
 * filteredSuggestions: an array of `T` which should be used in the `SelectMenu`
 * where a user edits metadata. This list is filtered and prioritized based on
 * the results of the client-side filter parameter.
 *
 * @param params
 * @param params.fetchSuggestions function which will be called every time the select menu is attached.
 * @param params.memexItemModel item to look up suggestions for
 * @param params.columnId column to look up suggestions for
 * @param params.filterSuggestions function called to do a client-side filter based on current text in filter text box
 * @param params.options a set of options to return if you know you don't need to fetch them
 */
export const useSelectMenuFilter = <TSuggestion extends SupportedSuggestionOptions>({
  fetchSuggestions,
  memexItemModel,
  columnId,
  filterSuggestions,
  maxSuggestions,
  options,
  initialFilterValue = '',
}: UseSelectMenuFilterParams<TSuggestion>) => {
  const [filterValue, setFilterValue] = useState(initialFilterValue)
  const {suggestions, error: error} = useSuggestions<TSuggestion>(memexItemModel, columnId, options)

  const onOpen = () => {
    if (isFetchSuggestionsEnabled(memexItemModel.contentType, columnId) && fetchSuggestions) {
      fetchSuggestions()
    }
  }

  const filteredSuggestions = useMemo(() => {
    if (suggestions) {
      const filterData = filterSuggestions(filterValue, suggestions, maxSuggestions)
      return filterData.filteredItems
    } else {
      return undefined
    }
  }, [filterSuggestions, filterValue, suggestions, maxSuggestions])

  return {
    onOpen,
    setFilterValue,
    filterValue,
    suggestions,
    filteredSuggestions,
    error,
  }
}

/**
 * @returns true if suggestions are supported for this ItemType and column.
 */
export function isFetchSuggestionsEnabled(contentType: ItemType, columnId: number | SystemColumnId) {
  // Only draft issues do not support some suggestions.
  if (contentType !== ItemType.DraftIssue) return true

  return isValidDraftItemColumn(columnId)
}
