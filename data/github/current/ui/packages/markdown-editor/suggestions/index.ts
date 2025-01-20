import {NO_MATCH} from '@github-ui/fuzzy-score/fuzzy-score'
import type {Suggestion, Trigger} from '@github-ui/inline-autocomplete/types'

const MAX_SUGGESTIONS = 5

export type SuggestionOptions<T> = T[] | (() => Promise<T[]>) | 'loading'

export type UseSuggestionsHook<T, C = void> = (
  options: SuggestionOptions<T>,
  config?: C,
) => {
  trigger: Trigger
  calculateSuggestions: (query: string) => Promise<Suggestion[] | 'loading'>
}

export const suggestionsCalculator =
  <T>(
    options: SuggestionOptions<T>,
    score: (query: string, option: T) => number,
    tieBreaker: (optionOne: T, optionTwo: T) => number,
    toSuggestion: (option: T) => Suggestion,
    sortInitialOptions?: boolean,
  ) =>
  async (query: string) => {
    if (options === 'loading') return 'loading'

    const optionsArray = Array.isArray(options) ? options : await options()

    // If the query is empty or there is no match against the query, scores will be -Infinity
    const scoredAndSorted = query
      ? optionsArray
          .map(o => [score(query, o), o] as const)
          .filter(([s]) => s > NO_MATCH)
          .sort(([aScore, a], [bScore, b]) => {
            if (bScore === aScore) return -tieBreaker(b, a)
            return bScore - aScore
          })
          .slice(0, MAX_SUGGESTIONS)
          .map(([, o]) => o)
      : optionsArray.slice(0, MAX_SUGGESTIONS)

    if (sortInitialOptions) {
      scoredAndSorted.sort(tieBreaker)
    }

    return scoredAndSorted.map(toSuggestion)
  }
