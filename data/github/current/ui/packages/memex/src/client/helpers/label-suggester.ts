import type {SuggestedLabel} from '../api/memex-items/contracts'
import {filterSuggestions, type FuzzyFilterData, ScoringCache} from './suggester'

const scoringCache = new ScoringCache<SuggestedLabel>()
const scoreFn = scoringCache.sortByWithCache.bind(scoringCache)

/**
 * Given filter text from the labels select menu and a list of all suggested labels from the server,
 * this function filters and sorts that listbased on the call to fzy.js (https://github.com/jhawthorn/fzy.js/).
 * @param searchQuery current filter text
 * @param suggestionsData all items to filter and prioritize
 * @param maxSuggestions maximum number of suggestions to return
 * @returns A filtered, prioritized and limited list of labels.
 */
export function filterSuggestedLabels(
  searchQuery: string,
  suggestionsData: Array<SuggestedLabel>,
  maxSuggestions: number,
): FuzzyFilterData<SuggestedLabel> {
  return filterSuggestions(searchQuery, suggestionsData, item => item.nameHtml, scoringCache, scoreFn, maxSuggestions)
}
