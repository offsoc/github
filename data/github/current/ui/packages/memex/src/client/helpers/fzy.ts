import {score as getScore, SCORE_MAX} from 'fzy.js'

export const fzyScore = (query: string, string: string) => {
  let score = getScore(query, string)

  // fzy.js.score() assumes that all of the characters in the search query exist
  // in the item to score (the string / the "haystack"), and in the same order.
  // We currently aren't holding truth to this expectation, so we have to manually
  // handle the case where the the library returns a SCORE_MAX, assuming that if
  // the search query has the same number of characters as the item, then it is an
  // exact match.
  if (score === SCORE_MAX && string.toLocaleLowerCase() !== query.toLocaleLowerCase()) {
    score = 0
  }

  return score
}
