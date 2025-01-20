import {fuzzyScore, NO_MATCH} from './fuzzy-score'

export const hasFuzzyMatch = (searchQuery: string, text: string): boolean => {
  return fuzzyScore(searchQuery, text) > NO_MATCH
}
