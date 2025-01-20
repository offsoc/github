import type {Iteration} from '../api/columns/contracts/iteration'
import type {PersistedOption} from '../api/columns/contracts/single-select'
import type {
  SuggestedAssignee,
  SuggestedIssueType,
  SuggestedLabel,
  SuggestedMilestone,
} from '../api/memex-items/contracts'

export interface SuggestedIterationOption extends Iteration {
  selected: boolean
}

export interface SuggestedSingleSelectOption extends PersistedOption {
  selected: boolean
}

export type SupportedSuggestionOptions =
  | SuggestedAssignee
  | SuggestedIterationOption
  | SuggestedLabel
  | SuggestedMilestone
  | SuggestedIssueType
  | SuggestedSingleSelectOption

/**
 * Determine if the given single-select column option's display text (its label) matches user-entered text.
 * @param filterValue The text the user entered into an input field
 * @param option The single-select column option to compare against
 * @returns The given option if it matches the filter value, otherwise null
 */
export const getOptionMatchingFilterValue = (
  filterValue: string,
  option: SuggestedSingleSelectOption,
): SuggestedSingleSelectOption | null => {
  const optionLabel = option.name

  if (optionLabel.toLowerCase() !== filterValue.toLowerCase()) {
    return null
  }

  return option
}
