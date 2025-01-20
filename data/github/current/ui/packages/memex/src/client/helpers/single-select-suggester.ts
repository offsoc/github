import {filterSuggestions, type FuzzyFilterData, ScoringCache} from './suggester'
import type {SuggestedSingleSelectOption} from './suggestions'

const scoringCache = new ScoringCache<SuggestedSingleSelectOption>()
const scoreFn = scoringCache.sortByWithCache.bind(scoringCache)

/**
 * Given filter text from the select menu and a list of all suggested options,
 * this function filters and sorts that list based on the call to fzy.js (https://github.com/jhawthorn/fzy.js/).
 * @param searchQuery current filter text
 * @param suggestionsData all items to filter and prioritize
 * @param maxSuggestions maximum number of suggestions to return
 * @returns A filtered, prioritized and limited list of labels.
 */
export function filterSuggestedSingleSelectOptions(
  searchQuery: string,
  suggestionsData: Array<SuggestedSingleSelectOption>,
  maxSuggestions: number,
): FuzzyFilterData<SuggestedSingleSelectOption> {
  return filterSuggestions(searchQuery, suggestionsData, item => item.name, scoringCache, scoreFn, maxSuggestions)
}
