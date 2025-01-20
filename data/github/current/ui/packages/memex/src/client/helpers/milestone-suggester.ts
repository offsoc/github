import type {SuggestedMilestone} from '../api/memex-items/contracts'
import {filterSuggestions, type FuzzyFilterData, ScoringCache} from './suggester'

const scoringCache = new ScoringCache<SuggestedMilestone>()
const scoreFn = scoringCache.sortByWithCache.bind(scoringCache)

/**
 * Given filter text from the milestones select menu and a list of all suggested milestones from the server,
 * this function filters and sorts that list, in addition to providing chunk information
 * based on the call to fzy.js (https://github.com/jhawthorn/fzy.js/).
 * @param searchQuery current filter text
 * @param suggestionsData all items to filter and prioritize
 * @param maxSuggestions maximum number of suggestions to return
 * @returns A filtered, prioritized and limited list of milestones.
 * In addition to the ordered list, a WeakMap is provided which povides a way to access
 * the chunking information for each milestone (so that we can highlight the matches in the title).
 */
export function filterSuggestedMilestones(
  searchQuery: string,
  suggestionsData: Array<SuggestedMilestone>,
  maxSuggestions: number,
): FuzzyFilterData<SuggestedMilestone> {
  return filterSuggestions(searchQuery, suggestionsData, item => item.title, scoringCache, scoreFn, maxSuggestions)
}
