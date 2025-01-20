import {intervalDatesDescription} from './iterations'
import {filterSuggestions, type FuzzyFilterData, ScoringCache} from './suggester'
import type {SuggestedIterationOption} from './suggestions'

const scoringCache = new ScoringCache<SuggestedIterationOption>()
const scoreFn = scoringCache.sortByWithCache.bind(scoringCache)

/**
 * Given filter text from the select menu and a list of all suggested options,
 * this function filters and sorts that list based on the call to fzy.js (https://github.com/jhawthorn/fzy.js/).
 * @param searchQuery current filter text
 * @param suggestionsData all items to filter and prioritize
 * @param maxSuggestions maximum number of suggestions to return
 * @returns A filtered, prioritized and limited list of iterations.
 */
export function filterSuggestedIterationOptions(
  searchQuery: string,
  suggestionsData: Array<SuggestedIterationOption>,
  maxSuggestions: number,
): FuzzyFilterData<SuggestedIterationOption> {
  return filterSuggestions(
    searchQuery,
    suggestionsData,
    item => `${item.title} ${intervalDatesDescription(item)}`,
    scoringCache,
    scoreFn,
    maxSuggestions,
  )
}
