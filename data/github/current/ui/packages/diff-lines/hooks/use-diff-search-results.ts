import {WebWorker} from '@github-ui/code-view-shared/utilities/web-worker'
import React, {useEffect, useRef, useState} from 'react'
import {DebouncedWorkerManager} from '@github-ui/code-view-shared/worker-jobs/debounced-worker-manager'

import type {DiffEntryData} from '../types'
import {findInDiffWorkerJob, type DiffMatchContent} from '../helpers/find-in-diff'

export interface DiffFindRequest {
  query: string
  diffEntryInfo: DiffEntryData[]
  currentDiffEntryData: Map<string, DiffMatchContent[]> | undefined
}

export const emptyFocusedSearchResult = {
  pathDigest: '',
  indexWithinDigest: 0,
}
export interface DiffFindResponse {
  matchingDiffs: Map<string, DiffMatchContent[]>
  query: string
}
export interface FocusedSearchResult {
  pathDigest: string
  indexWithinDigest: number
  isCurrentDigest?: boolean
}
export type SearchInFileStatus = 'pending' | 'done'

export function useDiffSearchResults(
  diffInfo: DiffEntryData[] | undefined,
  searchTerm: string,
  findInDiffWorkerPath: string,
  redoSearchResults: object,
) {
  const [searchResults, setSearchResults] = useState<Map<string, DiffMatchContent[]>>(
    new Map<string, DiffMatchContent[]>(),
  )
  const [focusedSearchResult, setFocusedSearchResult] = useState<FocusedSearchResult | undefined>(undefined)
  const [currentIndex, setCurrentIndex] = useState(0)
  const workerManagerRef = React.useRef<DebouncedWorkerManager<DiffFindRequest, DiffFindResponse>>()
  //TODO: figure out how to detect a soft nav has happened to redo the search on the new page if necessary

  if (!workerManagerRef.current && searchTerm) {
    workerManagerRef.current = new DebouncedWorkerManager<DiffFindRequest, DiffFindResponse>(
      new WebWorker(findInDiffWorkerPath, findInDiffWorkerJob),
      200, // Disable debounce, since we do incremental searching anyway so it's ultra fast
      (req: DiffFindRequest) => req.query.length !== 1,
    )
  }

  // Search term ref is used in the worker `onResponse` callback to avoid changing callback on every search term change.
  const searchTermRef = useRef(searchTerm)
  searchTermRef.current = searchTerm
  const lastSearchTerm = useRef('')

  useEffect(() => {
    return function destroy() {
      workerManagerRef.current?.terminate()
    }
  }, [])

  const lastDiffEntryData = useRef<DiffEntryData[] | undefined>([])
  if (workerManagerRef.current && diffInfo !== lastDiffEntryData.current) {
    workerManagerRef.current.onResponse = (data: DiffFindResponse) => {
      if (data.query === searchTermRef.current) {
        setSearchResults(data.matchingDiffs)
        lastSearchTerm.current = searchTermRef.current
      }
    }

    lastDiffEntryData.current = diffInfo
  }

  //this effect re-searches for the previous search term when the ref changes - it wipes out all saved progress because
  //anything could have changed during the swap between refs
  useEffect(() => {
    if (!diffInfo || !workerManagerRef.current || !lastSearchTerm.current || lastSearchTerm.current === '') {
      //reset everything because we changed refs
      setSearchResults(new Map<string, DiffMatchContent[]>())
      setFocusedSearchResult(undefined)
      return
    }
    setSearchResults(new Map<string, DiffMatchContent[]>())
    setFocusedSearchResult(undefined)
    workerManagerRef.current.post({
      query: lastSearchTerm.current,
      diffEntryInfo: diffInfo,
      currentDiffEntryData: undefined,
    })
    // We only want to trigger an update when the ref changes, aka the user is on a new branch or commit, or when
    //they navigate to a new file (path). If they are navigating using the symbols navigation, we want to redo the
    //search for that symbol within the new file as well

    //TODO: figure out how to trigger the refreshed search on soft navs
  }, [diffInfo?.length, diffInfo])

  useEffect(() => {
    if (!diffInfo || !workerManagerRef.current) {
      return
    }
    if (searchTerm === '') {
      setSearchResults(new Map<string, DiffMatchContent[]>())
      setFocusedSearchResult(undefined)
      setCurrentIndex(0)
      lastSearchTerm.current = ''
    } else if (!validSearchTerm(searchTerm)) {
      return
    } else {
      const canDoIncrementalSearch = lastSearchTerm.current.length > 0 && searchTerm.startsWith(lastSearchTerm.current)
      workerManagerRef.current.post({
        query: searchTerm,
        diffEntryInfo: diffInfo,
        currentDiffEntryData: canDoIncrementalSearch ? searchResults : undefined,
      })
      setCurrentIndex(0)
    }

    // We only want to trigger an update when the search term changes or when context lines are added
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, redoSearchResults])

  return {
    focusedSearchResult,
    setFocusedSearchResult,
    searchResults,
    currentIndex,
    setCurrentIndex,
  }
}

function validSearchTerm(searchTerm: string) {
  return searchTerm.length > 0 && searchTerm.length <= 1000
}
