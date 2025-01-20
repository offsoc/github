import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import type {SupportedSuggestionOptions} from '../../helpers/suggestions'
import {useSuggestionsContext} from './use-suggestions-context'

/**
 * Given a specific MemexItemModel and column id, this hook exposes:
 *
 * suggestions: an array of `TSuggestion`s which should be used in the `SelectMenu`
 * where a user edits that column's value. The state of this list matches the response from the server,
 * and doesn't include any client-side prioritization or filtering.
 * @param memexItemModel - The memex item (issue or pull request) to get suggestions for.
 * @param columnId - The column id to get suggestions for.
 * @param options - An optional set of options to alway return if you know you don't need to fetch them.
 */
export const useSuggestions = <TSuggestion extends SupportedSuggestionOptions>(
  memexItemModel: SidePanelItem,
  columnId: SystemColumnId | number,
  options?: Array<TSuggestion>,
): {suggestions: Array<TSuggestion> | undefined; error: Error | undefined} => {
  const context = useSuggestionsContext()

  if (options) {
    return {suggestions: options, error: undefined}
  }

  let suggestions
  const suggestionsCacheKey = memexItemModel.getSuggestionsCacheKey()

  switch (columnId) {
    case SystemColumnId.Assignees:
      suggestions = context.getSuggestedAssigneesForItem(suggestionsCacheKey)
      break

    case SystemColumnId.Labels:
      suggestions = context.getSuggestedLabelsForItem(suggestionsCacheKey)
      break

    case SystemColumnId.Milestone:
      suggestions = context.getSuggestedMilestonesForItem(suggestionsCacheKey)
      break

    case SystemColumnId.IssueType:
      suggestions = context.getSuggestedIssueTypesForItem(suggestionsCacheKey)
      break
  }

  if (suggestions instanceof Error) {
    const error = suggestions
    return {suggestions: undefined, error}
  }

  return {suggestions: suggestions as Array<TSuggestion>, error: undefined}
}
