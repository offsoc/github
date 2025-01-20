import type {SuggestedAssignee} from '../api/memex-items/contracts'
import {filterSuggestions, type FuzzyFilterData, ScoringCache} from './suggester'

const scoringCache = new ScoringCache<SuggestedAssignee>()
const scoreFn = scoringCache.sortByWithCache.bind(scoringCache)

/**
 * Given filter text from the assignees select menu and a list of all suggested assignees from the server,
 * this function filters and sorts that list, in addition to providing chunk information
 * based on the call to fzy.js (https://github.com/jhawthorn/fzy.js/).
 * @param searchQuery current filter text
 * @param suggestionsData all items to filter and prioritize
 * @param maxSuggestions maximum number of suggestions to return
 * @returns A filtered, prioritized and limited list of assignees.
 * In addition to the ordered list, a WeakMap is provided which povides a way to access
 * the chunking information for each assignees (so that we can highlight the matches in the login).
 */
export function filterSuggestedAssignees(
  searchQuery: string,
  suggestionsData: Array<SuggestedAssignee>,
  maxSuggestions: number,
): FuzzyFilterData<SuggestedAssignee> {
  return filterSuggestions(
    searchQuery,
    suggestionsData,
    item => item.login + (item.name ? ` ${item.name}` : ''),
    scoringCache,
    scoreFn,
    maxSuggestions,
  )
}
