import type {SuggestedIssueType} from '../api/memex-items/contracts'
import {filterSuggestions, type FuzzyFilterData, ScoringCache} from './suggester'

const scoringCache = new ScoringCache<SuggestedIssueType>()
const scoreFn = scoringCache.sortByWithCache.bind(scoringCache)

/**
 * Given filter text from the type select menu and a list of all suggested issue types from the server,
 * this function filters and sorts that list, in addition to providing chunk information
 * based on the call to fzy.js (https://github.com/jhawthorn/fzy.js/).
 * @param searchQuery current filter text
 * @param suggestionsData all items to filter and prioritize
 * @param maxSuggestions maximum number of suggestions to return
 * @returns A filtered, prioritized and limited list of types.
 * In addition to the ordered list, a WeakMap is provided which povides a way to access
 * the chunking information for each milestone (so that we can highlight the matches in the name).
 */
export function filterSuggestedIssueTypes(
  searchQuery: string,
  suggestionsData: Array<SuggestedIssueType>,
  maxSuggestions: number,
): FuzzyFilterData<SuggestedIssueType> {
  return filterSuggestions(searchQuery, suggestionsData, item => item.name, scoringCache, scoreFn, maxSuggestions)
}
