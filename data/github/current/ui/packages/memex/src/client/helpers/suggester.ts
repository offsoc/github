import {positions as fzyPositions} from 'fzy.js'

import {fzyScore} from './fzy'

function sortByScoreAndText(aScore: number, bScore: number, aText: string, bText: string) {
  if (aScore > bScore) {
    return -1
  } else if (aScore < bScore) {
    return 1
  } else if (aText < bText) {
    return -1
  } else if (aText > bText) {
    return 1
  } else {
    return 0
  }
}

export interface FuzzyFilterChunk {
  highlight: boolean
  startIndex: number
  endIndex: number
}

export interface FuzzyFilterPositionData {
  chunks: Array<FuzzyFilterChunk>
}

export interface FuzzyFilterData<T extends object> {
  filteredItems: Array<T>
  positionData: WeakMap<T, FuzzyFilterPositionData>
}

/**
 * Provides chunk data which can be easily consumed by a component looking to highlight
 * matches. Makes a call to fzy.js (https://github.com/jhawthorn/fzy.js/) positions() to get the indexes which should be highlighted.
 *
 * @param searchQuery - user filter text
 * @param text - full text of the item being matched
 * @returns A list of chunks. Each chunk in the list contains a start index, end index, and whether or not the
 * chunk should contain a highlight.
 */
function chunkMatches(searchQuery: string, text: string) {
  const positions: Array<number> = fzyPositions(searchQuery, text)
  let lastHighlightPos = -1
  let startIndex = 0
  const chunks: Array<FuzzyFilterChunk> = []
  for (const pos of positions) {
    if (pos - 1 !== lastHighlightPos) {
      if (lastHighlightPos === -1) {
        chunks.push({startIndex, endIndex: pos, highlight: false})
      } else {
        chunks.push({startIndex, endIndex: lastHighlightPos + 1, highlight: true})
        chunks.push({startIndex: lastHighlightPos + 1, endIndex: pos, highlight: false})
      }
      startIndex = pos
    }
    lastHighlightPos = pos
  }
  if (lastHighlightPos === text.length - 1) {
    chunks.push({startIndex, endIndex: text.length, highlight: true})
  } else {
    if (lastHighlightPos === -1) {
      chunks.push({startIndex, endIndex: text.length, highlight: false})
    } else {
      chunks.push({startIndex, endIndex: lastHighlightPos + 1, highlight: true})
      chunks.push({startIndex: lastHighlightPos + 1, endIndex: text.length, highlight: false})
    }
  }
  return chunks
}

export class ScoringCache<T extends object> {
  private textCache = new WeakMap<T, string>()
  private scoreCache = new WeakMap<T, number>()

  public sortByWithCache(a: T, b: T) {
    const as = this.scoreCache.get(a) || 0
    const bs = this.scoreCache.get(b) || 0
    const at = this.textCache.get(a) || ''
    const bt = this.textCache.get(b) || ''
    return sortByScoreAndText(as, bs, at, bt)
  }

  public getText(item: T) {
    return this.textCache.get(item)
  }
  public setText(item: T, text: string) {
    if (this.scoreCache.get(item) == null) {
      this.textCache.set(item, text)
    }
  }
  public getScore(item: T) {
    return this.scoreCache.get(item)
  }
  public setScore(item: T, score: number) {
    this.scoreCache.set(item, score)
  }
}

export function filterSuggestions<T extends object>(
  searchQuery: string,
  suggestionsData: Array<T>,
  getText: (item: T) => string,
  scoringCache: ScoringCache<T>,
  scoreFunction: (a: T, b: T) => -1 | 0 | 1,
  maxSuggestions: number | null = 5,
): FuzzyFilterData<T> {
  let filteredItems: Array<T> = suggestionsData
  if (searchQuery) {
    filteredItems = []
    for (const item of suggestionsData) {
      const text = getText(item)
      scoringCache.setText(item, text)
      const currentScore = fzyScore(searchQuery, text)
      scoringCache.setScore(item, currentScore)

      if (currentScore > 0) {
        filteredItems.push(item)
      }
    }
    filteredItems.sort(scoreFunction)
  }

  if (maxSuggestions !== null) filteredItems = filteredItems.slice(0, maxSuggestions)
  const positionData = new WeakMap<T, FuzzyFilterPositionData>()
  for (const item of filteredItems) {
    const text = getText(item)
    positionData.set(item, {chunks: chunkMatches(searchQuery, text)})
  }
  return {filteredItems, positionData}
}
