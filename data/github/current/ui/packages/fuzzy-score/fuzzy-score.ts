import {score} from 'fzy.js'

export const DIRECT_MATCH = Infinity
export const NO_MATCH = -Infinity
export const BONUS_POINT = 1

export const fuzzyScore = (searchQuery: string, text: string, bonusForStartOrEndMatch = BONUS_POINT): number => {
  const safeSearchQuery = searchQuery.trim().toLowerCase()
  const safeText = text.trim().toLowerCase()

  if (safeSearchQuery === safeText) {
    return DIRECT_MATCH
  }

  if (safeText.length === 0 || safeSearchQuery.length === 0) {
    return NO_MATCH
  }

  const fzyScore = score(safeSearchQuery, safeText)

  // fzy unintuitively returns Infinity if the length of the item is less than or equal to the length of the query
  if (fzyScore === Infinity && safeSearchQuery !== safeText) {
    return NO_MATCH
  }

  // Bonus points awarding to direct matches on individual components
  if (safeText.startsWith(safeSearchQuery) || safeText.endsWith(safeSearchQuery)) {
    return fzyScore + bonusForStartOrEndMatch
  } else {
    return fzyScore
  }
}
