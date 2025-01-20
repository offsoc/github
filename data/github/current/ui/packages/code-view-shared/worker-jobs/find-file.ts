import memoize from '@github/memoize'
import {hasMatch, score} from 'fzy.js'

export interface FindFileRequest {
  baseList: string[]
  query: string
  startTime: number
}

export interface FindFileResponse {
  query: string
  list: string[]
  baseCount: number
  startTime: number
}

const fuzzyScore = memoize(score)

export function findFileWorkerJob({data}: {data: FindFileRequest}): FindFileResponse {
  const {query, baseList, startTime} = data
  const queryWithoutBackslash = query.replaceAll('\\', '')
  const list = baseList
    .filter(item => filterItem(item, queryWithoutBackslash))
    .sort((itemA, itemB) => fuzzyScore(queryWithoutBackslash, itemB) - fuzzyScore(queryWithoutBackslash, itemA))

  return {query, list, baseCount: baseList.length, startTime}
}

function filterItem(item: string, query: string) {
  return query === '' || (hasMatch(query, item) && fuzzyScore(query, item) > 0)
}
