import type {DiffFindRequest, DiffFindResponse} from '../hooks/use-diff-search-results'
import type {DiffEntryData} from '../types'

export interface DiffMatchResult {
  matchingPathDigest: string
  diffMatchContent: DiffMatchContent[]
}

export interface DiffMatchContent {
  pathDigest: string
  indexWithinPathDigest: number
  matchContent: string
  column: number
  diffLineNumIndex: number
  columnEnd: number
  text: string
  leftLineNumber: number
  rightLineNumber: number
  isHunk: boolean
  hunkLineNumber: number
}

const SEARCH_RESULT_LIMIT = 200
export function findInDiffWorkerJob({data}: {data: DiffFindRequest}): DiffFindResponse {
  const {query, diffEntryInfo, currentDiffEntryData} = data
  let output: Map<string, DiffMatchContent[]> = new Map<string, DiffMatchContent[]>()

  // incremental search
  if (currentDiffEntryData) {
    output = searchInDiffIncrementally(diffEntryInfo, textMatchable(query), currentDiffEntryData)
  } else {
    output = searchInDiffContent(diffEntryInfo, textMatchable(query))
  }

  return {matchingDiffs: output, query}
}

export function searchInDiffIncrementally(
  diffs: DiffEntryData[],
  matchable: Matchable,
  currentDiffEntryData: Map<string, DiffMatchContent[]>,
): Map<string, DiffMatchContent[]> {
  if (currentDiffEntryData.size === 0) {
    // In the incremental search we are narrowing results. If there are no results for a less specific search, there won't be any further matches.
    return new Map<string, DiffMatchContent[]>()
  }

  const startedAtResultLimit = currentDiffEntryData.size >= SEARCH_RESULT_LIMIT

  const checkedDiff: Record<number, true> = {}
  const searchResults = diffs.reduce<Map<string, DiffMatchContent[]>>((output, ref, index) => {
    if (checkedDiff[index]) {
      return output
    }

    checkedDiff[index] = true

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const matches = getMatchGenerator(matchable, [diffs[index]!])
    let match = matches.next()
    while (!match.done && output.size < SEARCH_RESULT_LIMIT) {
      const {resultsWithinDiff} = match.value
      output.set(diffs[index]?.pathDigest ?? '', resultsWithinDiff)
      match = matches.next()
    }

    return output
  }, new Map<string, DiffMatchContent[]>())

  // Add new results from the raw blob. Note: this is only necessary if we dropped the number
  // of results below the maximum in the previous phase!
  if (searchResults.size < SEARCH_RESULT_LIMIT && startedAtResultLimit) {
    const startFromDiff = searchResults.size
    const matchesInRawDiff = getMatchGenerator(matchable, diffs, startFromDiff)
    let match = matchesInRawDiff.next()
    while (!match.done && searchResults.size < SEARCH_RESULT_LIMIT) {
      const {resultsWithinDiff, diff} = match.value
      searchResults.set(diffs[diff]?.pathDigest ?? '', resultsWithinDiff)
      match = matchesInRawDiff.next()
    }
  }

  return searchResults
}

export function searchInDiffContent(diffs: DiffEntryData[], m: Matchable): Map<string, DiffMatchContent[]> {
  const output = new Map<string, DiffMatchContent[]>()
  const matches = getMatchGenerator(m, diffs)
  let match = matches.next()

  while (!match.done && output.size < SEARCH_RESULT_LIMIT) {
    const {resultsWithinDiff, diff} = match.value
    output.set(diffs[diff]?.pathDigest ?? '', resultsWithinDiff)

    match = matches.next()
  }
  return output
}

enum MatchableType {
  Text,
  Symbol,
}

interface Matchable {
  kind: MatchableType
  regexp: RegExp
}

function textMatchable(query: string) {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return {
    kind: MatchableType.Text,
    regexp: new RegExp(escapedQuery, 'gi'),
  }
}

/**
 * Lazy iterator that returns one match at a time
 * @param regex regular expression used for the search
 * @param diffs all of the diff entries currently available
 * @param startFromDiff diff to start at indexed from 0
 */

function* getMatchGenerator(regex: Matchable, diffs: DiffEntryData[], startFromDiff = 0) {
  for (let diff = startFromDiff; diff < diffs.length; diff++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentDiff = diffs[diff]!
    const resultsWithinDiff = []
    let indexOfResultWithinDiff = 0
    for (let diffLineNumIndex = 0; diffLineNumIndex < currentDiff.diffLines.length; diffLineNumIndex++) {
      let snippet
      if (diffs[diff]?.diffLines[diffLineNumIndex]?.type === 'HUNK') {
        snippet = currentDiff.diffLines[diffLineNumIndex]?.text
      } else {
        //get rid of the plus or minus
        snippet = currentDiff.diffLines[diffLineNumIndex]?.text?.substring(1)
      }
      const currentDiffLine = currentDiff.diffLines[diffLineNumIndex]
      let match: RegExpExecArray | null

      while (snippet && (match = regex.regexp.exec(snippet)) !== null) {
        const matchContent = match[0]
        const column = match.index
        resultsWithinDiff.push({
          pathDigest: currentDiff.pathDigest,
          indexWithinPathDigest: indexOfResultWithinDiff,
          matchContent,
          column,
          diffLineNumIndex,
          isHunk: currentDiffLine?.type === 'HUNK' ?? false,
          hunkLineNumber: currentDiffLine?.blobLineNumber ?? -1,
          leftLineNumber: currentDiffLine?.type !== 'ADDITION' ? currentDiffLine?.left ?? -1 : -1,
          rightLineNumber: currentDiffLine?.type !== 'DELETION' ? currentDiffLine?.right ?? -1 : -1,
          columnEnd: column + matchContent.length,
          text: snippet,
        })
        indexOfResultWithinDiff++
      }
    }

    if (resultsWithinDiff.length !== 0) {
      yield {
        diff,
        resultsWithinDiff,
      }
    }
  }
}
